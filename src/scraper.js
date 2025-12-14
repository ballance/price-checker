import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { parsePriceToCents } from './currency.js';
import { config } from './config.js';

/**
 * IMPORTANT: Terms of Service Compliance
 *
 * This scraper is intended for personal, educational use only.
 * Before using this tool, review each retailer's Terms of Service.
 * Some retailers prohibit automated scraping. Use responsibly and
 * respect rate limits to avoid IP bans or legal issues.
 *
 * By using this code, you acknowledge responsibility for ensuring
 * your usage complies with all applicable laws and terms of service.
 */

// Use stealth plugin to avoid bot detection
puppeteer.use(StealthPlugin());

// Site-specific configurations for different retailers
const SITE_CONFIGS = {
  amazon: {
    name: 'Amazon',
    priceSelectors: [
      '.a-price .a-offscreen',
      '#priceblock_ourprice',
      '#priceblock_dealprice',
      '.a-price-whole',
      '#corePrice_feature_div .a-offscreen'
    ],
    titleSelectors: ['#productTitle'],
    detectUrl: (url) => url.includes('amazon.com')
  },
  bestbuy: {
    name: 'Best Buy',
    priceSelectors: [
      '[data-testid="customer-price"] span[aria-hidden="true"]',
      '.priceView-hero-price span[aria-hidden="true"]',
      '.priceView-customer-price span'
    ],
    titleSelectors: [
      '.sku-title h1',
      '[data-testid="product-title"]'
    ],
    detectUrl: (url) => url.includes('bestbuy.com')
  },
  walmart: {
    name: 'Walmart',
    priceSelectors: [
      '[itemprop="price"]',
      'span[data-automation-id="product-price"]',
      '[data-testid="price-wrap"] span'
    ],
    titleSelectors: [
      '[itemprop="name"]',
      'h1[data-automation-id="product-title"]'
    ],
    detectUrl: (url) => url.includes('walmart.com')
  },
  costco: {
    name: 'Costco',
    priceSelectors: [
      '.price-value',
      '.product-price .value',
      '[automation-id="productPriceOutput"]'
    ],
    titleSelectors: [
      'h1[automation-id="productName"]',
      '.product-h1'
    ],
    detectUrl: (url) => url.includes('costco.com')
  },
  gamestop: {
    name: 'GameStop',
    priceSelectors: [
      '.actual-price',
      '[data-testid="product-price"]',
      '.product-price',
      '.buy-box__price',
      '.price-tag',
      '[class*="price"][class*="actual"]',
      '[class*="ProductPrice"]'
    ],
    titleSelectors: [
      'h1[class*="ProductTitle"]',
      'h1.product-name',
      '[data-testid="product-title"]',
      '.product-name-wrapper h1',
      'h1'
    ],
    detectUrl: (url) => url.includes('gamestop.com')
  },
  microcenter: {
    name: 'Micro Center',
    priceSelectors: [
      '[itemprop="price"]',
      '[data-price]',
      '.price',
      '#pricing',
      '.product-price',
      '[class*="ProductPrice"]',
      '[class*="price"]'
    ],
    titleSelectors: [
      '[data-product-name]',
      'h1[data-name]',
      '[itemprop="name"]',
      'h1.product-title',
      'h1',
      'h2.product-name'
    ],
    detectUrl: (url) => url.includes('microcenter.com')
  },
  target: {
    name: 'Target',
    priceSelectors: [
      '[data-test="product-price"]',
      '[data-test="product-price-value"]',
      'span[data-test*="price"]',
      '[class*="Price"]',
      '[class*="currentPrice"]',
      'div[data-test="product-price"] span'
    ],
    titleSelectors: [
      '[data-test="product-title"]',
      'h1[data-test*="title"]',
      'h1[class*="Title"]',
      '[class*="ProductTitle"]',
      'h1'
    ],
    detectUrl: (url) => url.includes('target.com')
  }
};

/**
 * Detect which retailer the URL belongs to
 * @param {string} url
 * @returns {Object|null} Site configuration
 */
function detectSite(url) {
  for (const [key, config] of Object.entries(SITE_CONFIGS)) {
    if (config.detectUrl(url)) {
      return { key, ...config };
    }
  }
  return null;
}

/**
 * Scrapes price from any supported retailer
 * @param {string} url - Product URL
 * @param {number} maxRetries - Maximum number of retry attempts (default from config)
 * @returns {Promise<{priceCents: number, title: string, currency: string, retailer: string}>}
 */
export async function scrapePrice(url, maxRetries = config.maxRetries) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await scrapePriceAttempt(url);
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        const delay = 1000 * attempt;
        if (config.debugMode) {
          console.log(`[DEBUG] Attempt ${attempt} failed: ${error.message}. Retrying in ${delay}ms...`);
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Single attempt to scrape price (internal function)
 * @param {string} url - Product URL
 * @returns {Promise<{priceCents: number, title: string, currency: string, retailer: string}>}
 */
async function scrapePriceAttempt(url) {
  const siteConfig = detectSite(url);

  if (!siteConfig) {
    throw new Error('Unsupported retailer. Supported sites: Amazon, Best Buy, Walmart, Costco, GameStop, Micro Center, Target');
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // Set realistic viewport
    await page.setViewport({ width: 1920, height: 1080 });

    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Set additional headers to appear more like a real browser
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    });

    await page.goto(url, { waitUntil: 'networkidle2', timeout: config.requestTimeout });

    // Wait a bit to let dynamic content load
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Save screenshot for debugging
    if (config.debugMode) {
      await page.screenshot({ path: `debug-${siteConfig.key}.png` });
    }

    // Extract price and title using site-specific selectors
    const data = await page.evaluate((config) => {
      let priceText = null;
      let foundSelector = null;

      for (const selector of config.priceSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          priceText = element.textContent.trim();
          foundSelector = selector;
          break;
        }
      }

      let title = 'Unknown Product';
      for (const selector of config.titleSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          title = element.textContent.trim();
          break;
        }
      }

      return { priceText, title, foundSelector };
    }, siteConfig);

    if (config.debugMode) {
      console.log(`[DEBUG] Found price "${data.priceText}" using selector: ${data.foundSelector}`);
    }

    if (!data.priceText) {
      throw new Error(`Could not find price on ${siteConfig.name} page`);
    }

    // Parse price to cents (avoids floating point issues)
    const priceCents = parsePriceToCents(data.priceText);
    const currency = data.priceText.includes('$') ? 'USD' : 'USD';

    return {
      priceCents,
      title: data.title,
      currency,
      retailer: siteConfig.name
    };

  } finally {
    await browser.close();
  }
}
