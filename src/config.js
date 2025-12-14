/**
 * Application configuration
 * Can be overridden by environment variables
 */

export const config = {
  // Scraping settings
  maxRetries: parseInt(process.env.MAX_RETRIES) || 3,
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT) || 30000, // 30 seconds
  delayBetweenRequests: parseInt(process.env.DELAY_BETWEEN_REQUESTS) || 2000, // 2 seconds

  // Debug settings
  debugMode: process.env.DEBUG_SCRAPER === '1' || process.env.DEBUG_SCRAPER === 'true',

  // Price history settings
  enablePriceHistory: process.env.ENABLE_PRICE_HISTORY !== 'false', // enabled by default
  maxHistoryEntries: parseInt(process.env.MAX_HISTORY_ENTRIES) || 100,
};

/**
 * Get supported retailers list
 */
export function getSupportedRetailers() {
  return [
    'Amazon',
    'Best Buy',
    'Walmart',
    'Costco',
    'GameStop',
    'Micro Center',
    'Target'
  ];
}
