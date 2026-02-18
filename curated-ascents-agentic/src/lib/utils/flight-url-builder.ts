// Flight search URL builders for Google Flights and Skyscanner

function isValidIATA(code: string): boolean {
  return /^[A-Z]{3}$/.test(code);
}

function formatDateYYMMDD(dateStr: string): string {
  // Input: YYYY-MM-DD, Output: YYMMDD
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}${mm}${dd}`;
}

export function buildGoogleFlightsUrl(
  origin: string,
  destination: string,
  departureDate?: string,
  returnDate?: string
): string {
  const parts = ["Flights", "to", destination];
  if (origin && isValidIATA(origin.toUpperCase())) {
    parts.push("from", origin.toUpperCase());
  }
  if (departureDate) {
    parts.push("on", departureDate);
  }
  if (returnDate) {
    parts.push("return", returnDate);
  }
  const query = parts.join("+");
  return `https://www.google.com/travel/flights?q=${query}`;
}

export function buildSkyscannerUrl(
  origin: string,
  destination: string,
  departureDate?: string,
  returnDate?: string
): string {
  const orig = origin && isValidIATA(origin.toUpperCase()) ? origin.toLowerCase() : "anywhere";
  const dest = destination.toLowerCase();
  const dep = departureDate ? formatDateYYMMDD(departureDate) : "";
  const ret = returnDate ? formatDateYYMMDD(returnDate) : "";

  let url = `https://www.skyscanner.com/transport/flights/${orig}/${dest}/`;
  if (dep) {
    url += `${dep}/`;
    if (ret) {
      url += `${ret}/`;
    }
  }
  return url;
}

export function buildFlightSearchUrls(
  origin: string,
  destination: string,
  departureDate?: string,
  returnDate?: string
): { google: string; skyscanner: string } {
  return {
    google: buildGoogleFlightsUrl(origin, destination, departureDate, returnDate),
    skyscanner: buildSkyscannerUrl(origin, destination, departureDate, returnDate),
  };
}
