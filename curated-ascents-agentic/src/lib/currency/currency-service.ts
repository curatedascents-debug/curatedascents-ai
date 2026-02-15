/**
 * Multi-Currency Service
 * Handles exchange rates, currency conversion, and formatting
 */

import { db } from "@/db";
import { exchangeRates, supportedCurrencies, dailyFxRates } from "@/db/schema";
import { eq, desc, and, gte } from "drizzle-orm";

// ============================================
// TYPES
// ============================================

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  locale: string;
  decimalPlaces: number;
}

export interface ExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  inverseRate: number;
  source: string;
  updatedAt: Date;
}

export interface ConversionResult {
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  targetCurrency: string;
  rate: number;
  rateTimestamp: Date;
}

// ============================================
// SUPPORTED CURRENCIES
// ============================================

// Default supported currencies for adventure travel
export const DEFAULT_CURRENCIES: Currency[] = [
  { code: "USD", name: "US Dollar", symbol: "$", locale: "en-US", decimalPlaces: 2 },
  { code: "EUR", name: "Euro", symbol: "€", locale: "de-DE", decimalPlaces: 2 },
  { code: "GBP", name: "British Pound", symbol: "£", locale: "en-GB", decimalPlaces: 2 },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", locale: "en-AU", decimalPlaces: 2 },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", locale: "en-CA", decimalPlaces: 2 },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", locale: "de-CH", decimalPlaces: 2 },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", locale: "ja-JP", decimalPlaces: 0 },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", locale: "en-SG", decimalPlaces: 2 },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", locale: "en-HK", decimalPlaces: 2 },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", locale: "en-NZ", decimalPlaces: 2 },
  { code: "INR", name: "Indian Rupee", symbol: "₹", locale: "en-IN", decimalPlaces: 2 },
  { code: "NPR", name: "Nepalese Rupee", symbol: "रू", locale: "ne-NP", decimalPlaces: 2 },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", locale: "zh-CN", decimalPlaces: 2 },
  { code: "THB", name: "Thai Baht", symbol: "฿", locale: "th-TH", decimalPlaces: 2 },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", locale: "ar-AE", decimalPlaces: 2 },
];

// Fallback rates (updated manually as a backup)
// These are approximate rates - real rates fetched from API
export const FALLBACK_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  AUD: 1.53,
  CAD: 1.36,
  CHF: 0.88,
  JPY: 149.5,
  SGD: 1.34,
  HKD: 7.82,
  NZD: 1.64,
  INR: 83.1,
  NPR: 133.2,
  CNY: 7.24,
  THB: 35.8,
  AED: 3.67,
};

// Base currency for the platform
export const BASE_CURRENCY = "USD";

// ============================================
// EXCHANGE RATE FETCHING
// ============================================

/**
 * Fetch latest exchange rates from external API
 * Uses exchangerate-api.com (free tier: 1500 requests/month)
 */
export async function fetchExchangeRates(): Promise<Record<string, number>> {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;

  if (!apiKey) {
    console.warn("EXCHANGE_RATE_API_KEY not set, using fallback rates");
    return FALLBACK_RATES;
  }

  try {
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${BASE_CURRENCY}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!response.ok) {
      throw new Error(`Exchange rate API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.result !== "success") {
      throw new Error(`Exchange rate API failed: ${data["error-type"]}`);
    }

    return data.conversion_rates;
  } catch (error) {
    console.error("Failed to fetch exchange rates:", error);
    return FALLBACK_RATES;
  }
}

/**
 * Update exchange rates in database
 */
export async function updateExchangeRates(): Promise<{
  updated: number;
  source: string;
}> {
  const rates = await fetchExchangeRates();
  const source = process.env.EXCHANGE_RATE_API_KEY
    ? "exchangerate-api.com"
    : "fallback";
  const now = new Date();
  let updated = 0;

  for (const [currency, rate] of Object.entries(rates)) {
    if (currency === BASE_CURRENCY) continue;

    try {
      // Upsert the rate
      await db
        .insert(exchangeRates)
        .values({
          fromCurrency: BASE_CURRENCY,
          toCurrency: currency,
          rate: rate.toString(),
          inverseRate: (1 / rate).toFixed(6),
          source,
          fetchedAt: now,
        })
        .onConflictDoUpdate({
          target: [exchangeRates.fromCurrency, exchangeRates.toCurrency],
          set: {
            rate: rate.toString(),
            inverseRate: (1 / rate).toFixed(6),
            source,
            fetchedAt: now,
            updatedAt: now,
          },
        });
      updated++;
    } catch (error) {
      console.error(`Failed to update rate for ${currency}:`, error);
    }
  }

  // Save daily snapshot
  try {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    await db
      .insert(dailyFxRates)
      .values({
        rateDate: today,
        baseCurrency: BASE_CURRENCY,
        rates: rates,
        source,
        fetchedAt: now,
      })
      .onConflictDoUpdate({
        target: [dailyFxRates.rateDate, dailyFxRates.baseCurrency],
        set: {
          rates: rates,
          source,
          fetchedAt: now,
        },
      });
  } catch (error) {
    console.error("Failed to save daily FX snapshot:", error);
  }

  return { updated, source };
}

/**
 * Get exchange rate between two currencies
 */
export async function getExchangeRate(
  fromCurrency: string,
  toCurrency: string
): Promise<ExchangeRate | null> {
  // Same currency = no conversion
  if (fromCurrency === toCurrency) {
    return {
      fromCurrency,
      toCurrency,
      rate: 1,
      inverseRate: 1,
      source: "identity",
      updatedAt: new Date(),
    };
  }

  // Try direct lookup
  let result = await db
    .select()
    .from(exchangeRates)
    .where(
      and(
        eq(exchangeRates.fromCurrency, fromCurrency),
        eq(exchangeRates.toCurrency, toCurrency)
      )
    )
    .orderBy(desc(exchangeRates.fetchedAt))
    .limit(1);

  if (result.length > 0) {
    const r = result[0];
    return {
      fromCurrency: r.fromCurrency,
      toCurrency: r.toCurrency,
      rate: parseFloat(r.rate),
      inverseRate: parseFloat(r.inverseRate || "0"),
      source: r.source || "database",
      updatedAt: r.fetchedAt || new Date(),
    };
  }

  // Try inverse lookup
  result = await db
    .select()
    .from(exchangeRates)
    .where(
      and(
        eq(exchangeRates.fromCurrency, toCurrency),
        eq(exchangeRates.toCurrency, fromCurrency)
      )
    )
    .orderBy(desc(exchangeRates.fetchedAt))
    .limit(1);

  if (result.length > 0) {
    const r = result[0];
    return {
      fromCurrency,
      toCurrency,
      rate: parseFloat(r.inverseRate || "0"),
      inverseRate: parseFloat(r.rate),
      source: r.source || "database",
      updatedAt: r.fetchedAt || new Date(),
    };
  }

  // Try triangulation through USD
  if (fromCurrency !== BASE_CURRENCY && toCurrency !== BASE_CURRENCY) {
    const fromToUSD = await getExchangeRate(fromCurrency, BASE_CURRENCY);
    const usdToTarget = await getExchangeRate(BASE_CURRENCY, toCurrency);

    if (fromToUSD && usdToTarget) {
      return {
        fromCurrency,
        toCurrency,
        rate: fromToUSD.rate * usdToTarget.rate,
        inverseRate: 1 / (fromToUSD.rate * usdToTarget.rate),
        source: "triangulated",
        updatedAt: new Date(
          Math.min(fromToUSD.updatedAt.getTime(), usdToTarget.updatedAt.getTime())
        ),
      };
    }
  }

  // Use fallback rates
  const fromRate = FALLBACK_RATES[fromCurrency] || 1;
  const toRate = FALLBACK_RATES[toCurrency] || 1;
  const rate = toRate / fromRate;

  return {
    fromCurrency,
    toCurrency,
    rate,
    inverseRate: 1 / rate,
    source: "fallback",
    updatedAt: new Date(),
  };
}

// ============================================
// CURRENCY CONVERSION
// ============================================

/**
 * Convert an amount between currencies
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  spreadPercent: number = 0 // Optional markup for FX spread
): Promise<ConversionResult> {
  const rate = await getExchangeRate(fromCurrency, toCurrency);

  if (!rate) {
    throw new Error(`Could not find exchange rate for ${fromCurrency} to ${toCurrency}`);
  }

  // Apply spread (e.g., 2% markup on conversions)
  const effectiveRate = rate.rate * (1 + spreadPercent / 100);
  const convertedAmount = amount * effectiveRate;

  return {
    originalAmount: amount,
    originalCurrency: fromCurrency,
    convertedAmount,
    targetCurrency: toCurrency,
    rate: effectiveRate,
    rateTimestamp: rate.updatedAt,
  };
}

/**
 * Convert multiple amounts at once (batch conversion)
 */
export async function convertCurrencyBatch(
  items: Array<{ amount: number; currency: string }>,
  targetCurrency: string,
  spreadPercent: number = 0
): Promise<Array<ConversionResult>> {
  const results: ConversionResult[] = [];

  for (const item of items) {
    const result = await convertCurrency(
      item.amount,
      item.currency,
      targetCurrency,
      spreadPercent
    );
    results.push(result);
  }

  return results;
}

// ============================================
// CURRENCY FORMATTING
// ============================================

/**
 * Get currency configuration by code
 */
export function getCurrencyConfig(code: string): Currency {
  const currency = DEFAULT_CURRENCIES.find(c => c.code === code);
  return currency || {
    code,
    name: code,
    symbol: code,
    locale: "en-US",
    decimalPlaces: 2,
  };
}

/**
 * Format an amount with proper currency symbol and locale
 */
export function formatCurrency(
  amount: number | string | null,
  currencyCode: string = "USD",
  options: {
    showCode?: boolean;
    compact?: boolean;
  } = {}
): string {
  if (amount === null || amount === undefined) {
    return formatCurrency(0, currencyCode, options);
  }

  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return formatCurrency(0, currencyCode, options);
  }

  const currency = getCurrencyConfig(currencyCode);

  try {
    const formatter = new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: currency.decimalPlaces,
      maximumFractionDigits: currency.decimalPlaces,
      ...(options.compact && { notation: "compact" }),
    });

    let formatted = formatter.format(numAmount);

    // Optionally append currency code
    if (options.showCode && !formatted.includes(currencyCode)) {
      formatted += ` ${currencyCode}`;
    }

    return formatted;
  } catch {
    // Fallback formatting
    return `${currency.symbol}${numAmount.toFixed(currency.decimalPlaces)}`;
  }
}

/**
 * Format amount with conversion info
 */
export async function formatWithConversion(
  amount: number,
  baseCurrency: string,
  displayCurrency: string,
  options: {
    showOriginal?: boolean;
    showRate?: boolean;
  } = {}
): Promise<string> {
  if (baseCurrency === displayCurrency) {
    return formatCurrency(amount, displayCurrency);
  }

  const conversion = await convertCurrency(amount, baseCurrency, displayCurrency);
  let result = formatCurrency(conversion.convertedAmount, displayCurrency);

  if (options.showOriginal) {
    result += ` (${formatCurrency(amount, baseCurrency)})`;
  }

  if (options.showRate) {
    result += ` @ ${conversion.rate.toFixed(4)}`;
  }

  return result;
}

// ============================================
// SUPPORTED CURRENCIES MANAGEMENT
// ============================================

/**
 * Get all supported currencies
 */
export async function getSupportedCurrencies(): Promise<Currency[]> {
  try {
    const dbCurrencies = await db
      .select()
      .from(supportedCurrencies)
      .where(eq(supportedCurrencies.isActive, true))
      .orderBy(supportedCurrencies.sortOrder);

    if (dbCurrencies.length > 0) {
      return dbCurrencies.map(c => ({
        code: c.code,
        name: c.name,
        symbol: c.symbol,
        locale: c.locale || "en-US",
        decimalPlaces: c.decimalPlaces || 2,
      }));
    }
  } catch {
    // DB not available, use defaults
  }

  return DEFAULT_CURRENCIES;
}

/**
 * Seed supported currencies into database
 */
export async function seedSupportedCurrencies(): Promise<number> {
  let seeded = 0;

  for (let i = 0; i < DEFAULT_CURRENCIES.length; i++) {
    const currency = DEFAULT_CURRENCIES[i];
    try {
      await db
        .insert(supportedCurrencies)
        .values({
          code: currency.code,
          name: currency.name,
          symbol: currency.symbol,
          locale: currency.locale,
          decimalPlaces: currency.decimalPlaces,
          isActive: true,
          sortOrder: i,
        })
        .onConflictDoNothing();
      seeded++;
    } catch (error) {
      console.error(`Failed to seed currency ${currency.code}:`, error);
    }
  }

  return seeded;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Parse currency code from locale or country
 */
export function getCurrencyFromLocale(locale: string): string {
  const localeToCurrency: Record<string, string> = {
    "en-US": "USD",
    "en-GB": "GBP",
    "en-AU": "AUD",
    "en-CA": "CAD",
    "en-NZ": "NZD",
    "en-SG": "SGD",
    "en-HK": "HKD",
    "en-IN": "INR",
    "de-DE": "EUR",
    "fr-FR": "EUR",
    "it-IT": "EUR",
    "es-ES": "EUR",
    "de-CH": "CHF",
    "ja-JP": "JPY",
    "zh-CN": "CNY",
    "th-TH": "THB",
    "ar-AE": "AED",
    "ne-NP": "NPR",
  };

  return localeToCurrency[locale] || "USD";
}

/**
 * Detect currency from country code
 */
export function getCurrencyFromCountry(countryCode: string): string {
  const countryToCurrency: Record<string, string> = {
    US: "USD",
    GB: "GBP",
    UK: "GBP",
    AU: "AUD",
    CA: "CAD",
    NZ: "NZD",
    SG: "SGD",
    HK: "HKD",
    IN: "INR",
    DE: "EUR",
    FR: "EUR",
    IT: "EUR",
    ES: "EUR",
    NL: "EUR",
    BE: "EUR",
    AT: "EUR",
    IE: "EUR",
    PT: "EUR",
    CH: "CHF",
    JP: "JPY",
    CN: "CNY",
    TH: "THB",
    AE: "AED",
    NP: "NPR",
  };

  return countryToCurrency[countryCode.toUpperCase()] || "USD";
}

/**
 * Check if a currency is supported
 */
export function isSupportedCurrency(code: string): boolean {
  return DEFAULT_CURRENCIES.some(c => c.code === code);
}
