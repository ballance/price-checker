import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '../data/products.json');

// Write queue to prevent race conditions
let writeQueue = Promise.resolve();

/**
 * Ensure the data directory exists
 */
async function ensureDataDirectory() {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
}

/**
 * Load all products from storage
 * @returns {Promise<Array>}
 */
export async function loadProducts() {
  await ensureDataDirectory();
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

/**
 * Save products to storage (with write queue to prevent race conditions)
 * @param {Array} products
 */
export async function saveProducts(products) {
  // Queue writes to prevent concurrent write conflicts
  writeQueue = writeQueue.then(async () => {
    await ensureDataDirectory();
    await fs.writeFile(DATA_FILE, JSON.stringify(products, null, 2));
  });
  return writeQueue;
}

/**
 * Create a new product group or add retailer to existing product
 * @param {string} productName - Product name
 * @param {string} url - Retailer product URL
 * @param {string} retailer - Retailer name
 * @param {number} targetPriceCents - Alert when any retailer price drops below this (in cents)
 */
export async function addProduct(productName, url, retailer, targetPriceCents) {
  const products = await loadProducts();

  // Try to find existing product by name (case-insensitive)
  let product = products.find(p =>
    p.name.toLowerCase() === productName.toLowerCase()
  );

  if (product) {
    // Product exists, add or update retailer
    const existingRetailer = product.retailers.find(r => r.url === url);

    if (existingRetailer) {
      // Update existing retailer
      existingRetailer.retailer = retailer;
    } else {
      // Add new retailer to existing product
      product.retailers.push({
        url,
        retailer,
        currentPriceCents: null,
        lastChecked: null,
        priceHistory: config.enablePriceHistory ? [] : undefined
      });
    }

    // Update target price if provided
    product.targetPriceCents = targetPriceCents;

  } else {
    // Create new product
    product = {
      id: Date.now().toString(),
      name: productName,
      targetPriceCents,
      createdAt: new Date().toISOString(),
      triggered: false,
      retailers: [{
        url,
        retailer,
        currentPriceCents: null,
        lastChecked: null,
        priceHistory: config.enablePriceHistory ? [] : undefined
      }]
    };
    products.push(product);
  }

  await saveProducts(products);
  return product;
}

/**
 * Remove a product by ID
 * @param {string} id
 */
export async function removeProduct(id) {
  const products = await loadProducts();
  const filtered = products.filter(p => p.id !== id);
  await saveProducts(filtered);
  return filtered.length < products.length;
}

/**
 * Remove a specific retailer from a product
 * @param {string} productId
 * @param {string} url
 */
export async function removeRetailer(productId, url) {
  const products = await loadProducts();
  const product = products.find(p => p.id === productId);

  if (!product) {
    throw new Error(`Product with id ${productId} not found`);
  }

  product.retailers = product.retailers.filter(r => r.url !== url);

  // Remove product if no retailers left
  if (product.retailers.length === 0) {
    const filtered = products.filter(p => p.id !== productId);
    await saveProducts(filtered);
  } else {
    await saveProducts(products);
  }

  return true;
}

/**
 * Update a specific retailer's price information
 * @param {string} productId
 * @param {string} url
 * @param {Object} updates
 */
export async function updateRetailer(productId, url, updates) {
  const products = await loadProducts();
  const product = products.find(p => p.id === productId);

  if (!product) {
    throw new Error(`Product with id ${productId} not found`);
  }

  const retailer = product.retailers.find(r => r.url === url);

  if (!retailer) {
    throw new Error(`Retailer with url ${url} not found`);
  }

  // Add price history if enabled and price changed
  if (config.enablePriceHistory && updates.currentPriceCents !== undefined) {
    if (!retailer.priceHistory) {
      retailer.priceHistory = [];
    }

    // Only add to history if price changed
    if (retailer.currentPriceCents !== updates.currentPriceCents) {
      retailer.priceHistory.push({
        priceCents: updates.currentPriceCents,
        timestamp: new Date().toISOString()
      });

      // Limit history size
      if (retailer.priceHistory.length > config.maxHistoryEntries) {
        retailer.priceHistory = retailer.priceHistory.slice(-config.maxHistoryEntries);
      }
    }
  }

  Object.assign(retailer, updates, { lastChecked: new Date().toISOString() });
  await saveProducts(products);

  return product;
}

/**
 * Update product-level information
 * @param {string} productId
 * @param {Object} updates
 */
export async function updateProduct(productId, updates) {
  const products = await loadProducts();
  const product = products.find(p => p.id === productId);

  if (!product) {
    throw new Error(`Product with id ${productId} not found`);
  }

  Object.assign(product, updates);
  await saveProducts(products);

  return product;
}
