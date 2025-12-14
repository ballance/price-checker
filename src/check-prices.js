import { loadProducts, updateRetailer, updateProduct } from './storage.js';
import { scrapePrice } from './scraper.js';
import { formatPrice } from './currency.js';
import { config } from './config.js';

/**
 * Display ASCII logo
 */
function displayLogo() {
  const orange = '\x1b[38;5;208m';
  const white = '\x1b[37m';
  const bold = '\x1b[1m';
  const reset = '\x1b[0m';

  console.log(`
${orange}                  ╱╲${reset}
${orange}                 ╱  ╲${reset}
${orange}                ╱    ╲${reset}
${orange}               ╱${white}  ${bold}◉${reset}${white}   ${reset}${orange}╲${reset}
${orange}              ╱        ╲${reset}
${orange}             ╱          ╲${reset}
${orange}            ╱            ╲${reset}
${orange}           ┃              ┃${reset}
${orange}           ┃  ${white}${bold}███  ████${reset}    ${orange}┃${reset}
${orange}           ┃  ${white}${bold}█ █ █${reset}        ${orange}┃${reset}
${orange}           ┃  ${white}${bold}███ █${reset}        ${orange}┃${reset}
${orange}           ┃  ${white}${bold}█   █${reset}        ${orange}┃${reset}
${orange}           ┃  ${white}${bold}█    ████${reset}    ${orange}┃${reset}
${orange}           ┃              ┃${reset}
${orange}           ┃ Price Checker ┃${reset}
${orange}           ┃              ┃${reset}
${orange}           ┃       ${white}${bold}✓${reset}       ${orange}┃${reset}
${orange}           ┃      ${white}${bold}╱ ╲${reset}      ${orange}┃${reset}
${orange}           ┃     ${white}${bold}╱   ╲${reset}     ${orange}┃${reset}
${orange}           ┃              ┃${reset}
${orange}           ╰──────────────╯${reset}
`);
}

/**
 * Check all products and send notifications for triggered alerts
 */
async function checkPrices() {
  displayLogo();
  const products = await loadProducts();

  if (products.length === 0) {
    console.log('No products configured. Add products using: npm run add');
    return;
  }

  console.log(`\nChecking ${products.length} product(s) across multiple retailers...\n`);

  for (const product of products) {
    console.log(`\n📦 ${product.name}`);
    console.log(`   Target: ${formatPrice(product.targetPriceCents)}\n`);

    const prices = [];
    let anyTriggered = false;

    for (const retailer of product.retailers) {
      try {
        console.log(`   Checking ${retailer.retailer}...`);

        const { priceCents } = await scrapePrice(retailer.url);

        // Update retailer with current price
        await updateRetailer(product.id, retailer.url, {
          currentPriceCents: priceCents
        });

        prices.push({ retailer: retailer.retailer, priceCents, url: retailer.url });

        const status = priceCents <= product.targetPriceCents ? '✅' : '⏳';
        console.log(`   ${status} ${retailer.retailer}: ${formatPrice(priceCents)}`);

        if (priceCents <= product.targetPriceCents) {
          anyTriggered = true;
        }

        // Add delay between requests to avoid overwhelming retailers
        await new Promise(resolve => setTimeout(resolve, config.delayBetweenRequests));

      } catch (error) {
        console.error(`   ❌ ${retailer.retailer}: ${error.message}`);
      }
    }

    if (prices.length > 0) {
      // Find best price
      const sorted = prices.sort((a, b) => a.priceCents - b.priceCents);
      const bestPrice = sorted[0];

      console.log(`\n   💰 BEST PRICE: ${bestPrice.retailer} at ${formatPrice(bestPrice.priceCents)}`);
      console.log(`   🔗 ${bestPrice.url}`);

      // Send alert if any retailer is below target and not already triggered
      if (anyTriggered && !product.triggered) {
        console.log('\n   🔔 PRICE ALERT TRIGGERED! 🔔');
        console.log(`   ✅ Price dropped below ${formatPrice(product.targetPriceCents)}!`);

        // Mark as triggered
        await updateProduct(product.id, { triggered: true });
      }

      // Show savings
      if (bestPrice.priceCents <= product.targetPriceCents) {
        const savingsCents = product.targetPriceCents - bestPrice.priceCents;
        console.log(`   💵 Savings: ${formatPrice(savingsCents)} below target`);
      } else {
        const diffCents = bestPrice.priceCents - product.targetPriceCents;
        console.log(`   ⏳ Waiting for ${formatPrice(diffCents)} price drop`);
      }
    }

    console.log('');
  }

  console.log('✓ Price check complete!\n');
}

checkPrices().catch(console.error);
