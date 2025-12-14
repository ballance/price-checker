import { loadProducts, addProduct, removeProduct } from './storage.js';
import { scrapePrice } from './scraper.js';
import { dollarsToCents, formatPrice } from './currency.js';
import { getSupportedRetailers } from './config.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

/**
 * Display ASCII logo
 */
function displayLogo() {
  const orange = '\x1b[38;5;208m';
  const white = '\x1b[37m';
  const bold = '\x1b[1m';
  const reset = '\x1b[0m';

  console.log(`
${orange}                  ╱ ╲${reset}
${orange}                 ╱   ╲${reset}
${orange}                ╱     ╲${reset}
${orange}               ╱${white}  ${bold}◉${reset}${white}   ${reset}${orange} ╲${reset}
${orange}              ╱         ╲${reset}
${orange}             ╱           ╲${reset}
${orange}            ╱             ╲${reset}
${orange}           ┃               ┃${reset}
${orange}           ┃  ${white}${bold}███  ████${reset}    ${orange}┃${reset}
${orange}           ┃  ${white}${bold}█ █ █${reset}        ${orange}┃${reset}
${orange}           ┃  ${white}${bold}███ █${reset}        ${orange}┃${reset}
${orange}           ┃  ${white}${bold}█   █${reset}        ${orange}┃${reset}
${orange}           ┃  ${white}${bold}█    ████${reset}    ${orange}┃${reset}
${orange}           ┃               ┃${reset}
${orange}           ┃ Price Checker ┃${reset}
${orange}           ┃               ┃${reset}
${orange}           ┃       ${white}${bold}✓${reset}       ${orange}┃${reset}
${orange}           ┃      ${white}${bold}╱ ╲${reset}      ${orange}┃${reset}
${orange}           ┃     ${white}${bold}╱   ╲${reset}     ${orange}┃${reset}
${orange}           ┃               ┃${reset}
${orange}           ╰───────────────╯${reset}
`);
}

/**
 * Validate URL format
 * @param {string} url
 * @returns {boolean}
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

async function addProductInteractive() {
  displayLogo();
  console.log('\n📦 Add New Price Alert\n');
  console.log('⚠️  Reminder: Please ensure your use complies with retailer Terms of Service.');
  console.log('   This tool is for personal use only. See README for details.\n');

  const productName = await question('Product name (e.g., "Apple AirPods Pro 3"): ');

  if (!productName.trim()) {
    console.error('❌ Please provide a product name');
    rl.close();
    return;
  }

  const targetPriceStr = await question('Target price (alert when ANY retailer drops below): $');
  const targetPriceDollars = parseFloat(targetPriceStr);

  if (isNaN(targetPriceDollars) || targetPriceDollars <= 0) {
    console.error('❌ Please provide a valid price');
    rl.close();
    return;
  }

  const targetPriceCents = dollarsToCents(targetPriceDollars);

  const supportedRetailers = getSupportedRetailers().join(', ');
  console.log(`\n✨ Add retailers to track (${supportedRetailers})`);
  console.log('Enter URLs one at a time. Press Enter with empty URL when done.\n');

  const retailers = [];
  let urlCount = 1;

  while (true) {
    const url = await question(`Retailer URL #${urlCount} (or press Enter to finish): `);

    if (!url.trim()) {
      if (retailers.length === 0) {
        console.error('❌ You must add at least one retailer');
        rl.close();
        return;
      }
      break;
    }

    // Validate URL format
    if (!isValidUrl(url.trim())) {
      console.error('❌ Invalid URL format. Please enter a valid URL.');
      const retry = await question('Try another URL? (y/n): ');
      if (retry.toLowerCase() !== 'y') {
        break;
      }
      continue;
    }

    console.log('⏳ Fetching price...');

    try {
      const { priceCents, title, retailer } = await scrapePrice(url);

      console.log(`✓ Found: ${retailer} - ${formatPrice(priceCents)}`);

      retailers.push({ url, priceCents, retailer, title });
      urlCount++;

      // Save product after each successful fetch
      await addProduct(productName, url, retailer, targetPriceCents);

    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      const retry = await question('Try another URL? (y/n): ');
      if (retry.toLowerCase() !== 'y') {
        break;
      }
    }
  }

  if (retailers.length > 0) {
    console.log(`\n✓ Price tracking enabled for "${productName}"`);
    console.log(`  Target Price: ${formatPrice(targetPriceCents)}`);
    console.log(`  Tracking ${retailers.length} retailer(s):\n`);

    const sortedRetailers = retailers.sort((a, b) => a.priceCents - b.priceCents);
    for (const r of sortedRetailers) {
      const status = r.priceCents <= targetPriceCents ? '✅' : '⏳';
      console.log(`  ${status} ${r.retailer}: ${formatPrice(r.priceCents)}`);
    }

    const cheapest = sortedRetailers[0];
    console.log(`\n  💰 Best current price: ${cheapest.retailer} at ${formatPrice(cheapest.priceCents)}\n`);
  }

  rl.close();
}

async function listProducts() {
  displayLogo();
  const products = await loadProducts();

  if (products.length === 0) {
    console.log('\nNo products tracked.\n');
    return;
  }

  console.log(`\n📋 Tracked Products (${products.length})\n`);

  for (const product of products) {
    console.log(`[${product.id}] ${product.name}`);
    console.log(`  Target Price: ${formatPrice(product.targetPriceCents)}`);
    console.log(`  Status: ${product.triggered ? '✅ Alert Triggered' : '⏳ Monitoring'}`);
    console.log(`  Retailers (${product.retailers.length}):\n`);

    // Sort by price (lowest first)
    const sorted = [...product.retailers].sort((a, b) => {
      if (a.currentPriceCents === null) return 1;
      if (b.currentPriceCents === null) return -1;
      return a.currentPriceCents - b.currentPriceCents;
    });

    for (const retailer of sorted) {
      if (retailer.currentPriceCents !== null) {
        const status = retailer.currentPriceCents <= product.targetPriceCents ? '✅' : '⏳';
        const lastChecked = new Date(retailer.lastChecked).toLocaleString();
        console.log(`    ${status} ${retailer.retailer}: ${formatPrice(retailer.currentPriceCents)} (checked: ${lastChecked})`);
      } else {
        console.log(`    ⏳ ${retailer.retailer}: Not yet checked`);
      }
      console.log(`       ${retailer.url}`);
    }

    if (sorted[0]?.currentPriceCents !== null) {
      console.log(`\n    💰 Best price: ${sorted[0].retailer} at ${formatPrice(sorted[0].currentPriceCents)}`);
    }

    console.log('');
  }
}

async function removeProductInteractive() {
  displayLogo();
  const products = await loadProducts();

  if (products.length === 0) {
    console.log('\nNo products to remove.\n');
    rl.close();
    return;
  }

  console.log('\n🗑️  Remove Product\n');

  for (const product of products) {
    console.log(`[${product.id}] ${product.name} (${product.retailers.length} retailers)`);
  }

  const id = await question('\nEnter product ID to remove: ');
  const removed = await removeProduct(id);

  if (removed) {
    console.log(`\n✓ Product ${id} removed.\n`);
  } else {
    console.log(`\n❌ Product ${id} not found.\n`);
  }

  rl.close();
}

async function appendRetailerInteractive() {
  displayLogo();
  const products = await loadProducts();

  if (products.length === 0) {
    console.log('\nNo products to add retailers to.\n');
    rl.close();
    return;
  }

  console.log('\n➕ Add Retailer to Existing Product\n');

  for (const product of products) {
    console.log(`[${product.id}] ${product.name} (${product.retailers.length} retailers)`);
  }

  const id = await question('\nEnter product ID: ');
  const product = products.find(p => p.id === id);

  if (!product) {
    console.log(`\n❌ Product ${id} not found.\n`);
    rl.close();
    return;
  }

  console.log(`\nAdding retailer to: ${product.name}`);
  console.log(`Current retailers: ${product.retailers.map(r => r.retailer).join(', ')}\n`);

  while (true) {
    const url = await question('Retailer URL (or press Enter to finish): ');

    if (!url.trim()) {
      break;
    }

    // Validate URL format
    if (!isValidUrl(url.trim())) {
      console.error('❌ Invalid URL format. Please enter a valid URL.');
      const retry = await question('Try another URL? (y/n): ');
      if (retry.toLowerCase() !== 'y') {
        break;
      }
      continue;
    }

    // Check if URL already exists for this product
    if (product.retailers.some(r => r.url === url.trim())) {
      console.error('❌ This URL is already being tracked for this product.');
      const retry = await question('Try another URL? (y/n): ');
      if (retry.toLowerCase() !== 'y') {
        break;
      }
      continue;
    }

    console.log('⏳ Fetching price...');

    try {
      const { priceCents, title, retailer } = await scrapePrice(url);

      console.log(`✓ Found: ${retailer} - ${formatPrice(priceCents)}`);

      // Add retailer to existing product
      await addProduct(product.name, url, retailer, product.targetPriceCents);

      console.log(`\n✓ Retailer added to "${product.name}"\n`);

      const another = await question('Add another retailer to this product? (y/n): ');
      if (another.toLowerCase() !== 'y') {
        break;
      }

    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      const retry = await question('Try another URL? (y/n): ');
      if (retry.toLowerCase() !== 'y') {
        break;
      }
    }
  }

  rl.close();
}

const command = process.argv[2];

switch (command) {
  case 'add':
    addProductInteractive();
    break;
  case 'append':
    appendRetailerInteractive();
    break;
  case 'list':
    listProducts();
    break;
  case 'remove':
    removeProductInteractive();
    break;
  default:
    console.log('\nUsage:');
    console.log('  npm run add     - Add a new product with multiple retailers');
    console.log('  npm run append  - Add retailers to an existing product');
    console.log('  npm run list    - List all tracked products');
    console.log('  npm run remove  - Remove a product');
    console.log('  npm run check   - Check all prices now\n');
    process.exit(1);
}
