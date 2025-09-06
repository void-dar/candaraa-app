export function formatDecimal(value, decimals = 2) {
  return value.toFixed(decimals); // e.g. 0.01 → "0.01"
}