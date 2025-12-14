/**
 * Currency utilities for handling prices as cents (integers)
 * Avoids floating point precision issues
 */

/**
 * Convert dollars to cents
 * @param {number} dollars - Price in dollars (e.g., 249.99)
 * @returns {number} Price in cents (e.g., 24999)
 */
export function dollarsToCents(dollars) {
  return Math.round(dollars * 100);
}

/**
 * Convert cents to dollars
 * @param {number} cents - Price in cents (e.g., 24999)
 * @returns {number} Price in dollars (e.g., 249.99)
 */
export function centsToDollars(cents) {
  return cents / 100;
}

/**
 * Format cents as currency string
 * @param {number} cents - Price in cents
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted price (e.g., "$249.99")
 */
export function formatPrice(cents, currency = 'USD') {
  const dollars = centsToDollars(cents);

  if (currency === 'USD') {
    return `$${dollars.toFixed(2)}`;
  }

  return `${dollars.toFixed(2)} ${currency}`;
}

/**
 * Parse a price string to cents
 * Handles formats like "$249.99", "249.99", "$1,299.99", "Now $199.00"
 * @param {string} priceStr - Price string
 * @returns {number} Price in cents
 */
export function parsePriceToCents(priceStr) {
  // Remove common price prefixes, currency symbols, and commas
  const cleaned = priceStr
    .replace(/\b(Now|Was|From|Sale|Price|Only)\b/gi, '')
    .replace(/[$,]/g, '')
    .trim();

  const dollars = parseFloat(cleaned);

  if (isNaN(dollars)) {
    throw new Error(`Invalid price format: ${priceStr}`);
  }

  return dollarsToCents(dollars);
}
