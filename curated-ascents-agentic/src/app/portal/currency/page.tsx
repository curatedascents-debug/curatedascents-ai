"use client";

import { useState, useEffect } from "react";
import { Loader2, ArrowDownUp } from "lucide-react";

interface CurrencyRate {
  code: string;
  name: string;
  rate: number;
}

const POPULAR = ["USD", "EUR", "GBP", "NPR", "INR", "AUD", "CAD", "CHF", "JPY", "SGD"];

export default function CurrencyPage() {
  const [rates, setRates] = useState<CurrencyRate[]>([]);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("NPR");
  const [amount, setAmount] = useState("1000");
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [ratesLoading, setRatesLoading] = useState(true);

  useEffect(() => {
    fetch("/api/currency/rates")
      .then((res) => res.json())
      .then((data) => setRates(data.rates || []))
      .catch(console.error)
      .finally(() => setRatesLoading(false));
  }, []);

  const handleConvert = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/currency/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: fromCurrency,
          to: toCurrency,
          amount: parseFloat(amount),
        }),
      });
      const data = await res.json();
      setResult(data.convertedAmount ?? data.result ?? null);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult(null);
  };

  const currencies = rates.length > 0
    ? rates.map((r) => r.code)
    : POPULAR;

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-white font-bold text-lg px-1">Currency Converter</h2>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
        {/* Amount */}
        <div>
          <label className="block text-slate-400 text-xs mb-1">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setResult(null); }}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-lg font-medium focus:outline-none focus:border-emerald-500"
            min="0"
          />
        </div>

        {/* From / Swap / To */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="block text-slate-400 text-xs mb-1">From</label>
            <select
              value={fromCurrency}
              onChange={(e) => { setFromCurrency(e.target.value); setResult(null); }}
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
            >
              {currencies.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSwap}
            className="mt-5 p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition"
          >
            <ArrowDownUp className="w-4 h-4 text-emerald-400" />
          </button>

          <div className="flex-1">
            <label className="block text-slate-400 text-xs mb-1">To</label>
            <select
              value={toCurrency}
              onChange={(e) => { setToCurrency(e.target.value); setResult(null); }}
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
            >
              {currencies.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Convert Button */}
        <button
          onClick={handleConvert}
          disabled={loading || ratesLoading || !amount}
          className="w-full py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Convert
        </button>

        {/* Result */}
        {result !== null && (
          <div className="bg-slate-900/50 rounded-xl p-4 text-center">
            <p className="text-slate-400 text-sm">
              {parseFloat(amount).toLocaleString()} {fromCurrency} =
            </p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">
              {result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {toCurrency}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
