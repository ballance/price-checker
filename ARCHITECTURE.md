# Architecture Documentation

## Overview

Multi-retailer price checker MVP built with Node.js and Puppeteer. Tracks product prices across Amazon, Best Buy, Walmart, and Costco with automatic price comparison and alerting.

## Project Structure

```
price-checker/
├── src/
│   ├── scraper.js       # Multi-site web scraping with Puppeteer
│   ├── storage.js       # JSON-based data persistence
│   ├── currency.js      # Currency conversion utilities
│   ├── cli.js           # Interactive command-line interface
│   ├── check-prices.js  # Automated price monitoring
│   └── notifier.js      # Alert notification system (console output)
├── data/
│   ├── products.json    # Product and price data (auto-created)
│   └── products.example.json  # Example data structure
├── package.json
└── README.md
```

## Core Components

### 1. Scraper (`src/scraper.js`)

**Purpose**: Extract prices and product information from retailer websites.

**Key Features**:
- Multi-site support with retailer auto-detection
- Site-specific CSS selectors for each retailer
- Puppeteer-based headless browser automation
- Returns prices as integers (cents) for precision

**Supported Retailers**:
```javascript
{
  amazon: { priceSelectors: [...], titleSelectors: [...] },
  bestbuy: { priceSelectors: [...], titleSelectors: [...] },
  walmart: { priceSelectors: [...], titleSelectors: [...] },
  costco: { priceSelectors: [...], titleSelectors: [...] }
}
```

**Usage**:
```javascript
import { scrapePrice } from './scraper.js';

const result = await scrapePrice('https://www.amazon.com/...');
// Returns: { priceCents: 24999, title: "Product Name", retailer: "Amazon" }
```

### 2. Storage (`src/storage.js`)

**Purpose**: Manage product and retailer data persistence.

**Data Model**:
```javascript
Product {
  id: string              // Unique identifier (timestamp)
  name: string            // Product name
  targetPriceCents: int   // Alert threshold in cents
  triggered: boolean      // Whether alert has been triggered
  createdAt: string       // ISO timestamp
  retailers: [
    {
      url: string              // Product URL at retailer
      retailer: string         // Retailer name
      currentPriceCents: int   // Last fetched price in cents
      lastChecked: string      // ISO timestamp
    }
  ]
}
```

**Key Functions**:
- `loadProducts()` - Load all products from JSON
- `saveProducts(products)` - Save products to JSON
- `addProduct(name, url, retailer, targetPriceCents)` - Add/update product
- `updateRetailer(productId, url, updates)` - Update retailer price
- `removeProduct(id)` - Delete product

### 3. Currency (`src/currency.js`)

**Purpose**: Handle currency conversions and formatting.

**Why Cents?**
- Avoids floating-point precision errors (e.g., `0.1 + 0.2 !== 0.3`)
- Industry standard (Stripe, PayPal use cents)
- Exact integer arithmetic for price comparisons
- Easy to add multi-currency support later

**API**:
```javascript
dollarsToCents(249.99)          // → 24999
centsToDollars(24999)           // → 249.99
formatPrice(24999)              // → "$249.99"
parsePriceToCents("$249.99")    // → 24999
```

### 4. CLI (`src/cli.js`)

**Purpose**: Interactive command-line interface for managing products.

**Commands**:
- `npm run add` - Add new product with multiple retailers
- `npm run list` - Display all tracked products
- `npm run remove` - Remove a product
- `npm run check` - Check prices manually

**User Flow (Add Product)**:
1. Prompt for product name
2. Prompt for target price (in dollars)
3. Convert target to cents
4. Loop: prompt for retailer URLs
5. For each URL:
   - Scrape current price
   - Save to storage
   - Display confirmation
6. Show summary with best price

### 5. Price Checker (`src/check-prices.js`)

**Purpose**: Automated price monitoring and comparison.

**Process**:
1. Load all products from storage
2. For each product:
   - Scrape prices from all retailers
   - Update storage with current prices
   - Compare prices to find best deal
   - Check if any retailer is below target
   - Trigger alert if threshold met
3. Display summary with savings

**Output Example**:
```
📦 Apple AirPods Pro 3
   Target: $199.00

   ✅ Costco: $229.99
   ⏳ Best Buy: $239.99
   ⏳ Amazon: $249.99

   💰 BEST PRICE: Costco at $229.99
   ⏳ Waiting for $30.99 price drop
```

### 6. Notifier (`src/notifier.js`)

**Purpose**: Send price alerts when thresholds are met.

**Current Implementation**: Console output with formatted messages

**Future Extensions**:
- Email notifications (Nodemailer + SendGrid)
- SMS alerts (Twilio)
- Push notifications (Pushover, ntfy.sh)
- Webhooks (Discord, Slack)

## Data Flow

```
User Input → CLI
              ↓
         Scraper (Puppeteer)
              ↓
         Currency Utils (convert to cents)
              ↓
         Storage (save as JSON)
              ↓
         Price Checker (periodic)
              ↓
         Notifier (console/email/etc)
```

## Design Decisions

### Why Puppeteer?
- Handles JavaScript-rendered content (many sites use React/Vue)
- Reliable across different retailers
- Can bypass simple bot detection
- Headless mode for server deployment

### Why JSON Storage?
- Simple MVP - no database setup required
- Human-readable for debugging
- Easy to migrate to database later
- Sufficient for single-user local usage

### Why Product Grouping?
- Allows tracking same product across retailers
- Easy price comparison
- Single alert threshold for all retailers
- Natural UX: "Track AirPods Pro 3" vs "Track Amazon URL"

### Why Site-Specific Selectors?
- Each retailer has different HTML structure
- Fallback selectors improve reliability
- Easy to add new retailers
- Centralized configuration

## Extension Points

### Adding New Retailers

1. Add configuration to `SITE_CONFIGS` in `src/scraper.js`:
```javascript
target: {
  name: 'Target',
  priceSelectors: ['[data-test="product-price"]', '.price'],
  titleSelectors: ['[data-test="product-title"]', 'h1'],
  detectUrl: (url) => url.includes('target.com')
}
```

2. Test with actual product URL
3. Adjust selectors as needed

### Adding Notifications

Extend `src/notifier.js`:
```javascript
export async function sendEmailAlert(alert, price) {
  const transporter = nodemailer.createTransport({ ... });
  await transporter.sendMail({
    to: user.email,
    subject: `Price Alert: ${alert.title}`,
    text: `Price dropped to ${formatPrice(price)}`
  });
}
```

### Adding Price History

Extend storage model:
```javascript
retailers: [{
  url: string,
  retailer: string,
  priceHistory: [
    { priceCents: int, timestamp: string }
  ]
}]
```

## Performance Considerations

- **Rate Limiting**: 2-second delay between requests to avoid bans
- **Headless Mode**: Reduced resource usage
- **Sequential Processing**: Prevents overwhelming retailers
- **Selective Scraping**: Only active products, not historical data

## Security Considerations

- **No Credentials**: Doesn't handle user logins (public pages only)
- **Local Storage**: Data stays on user's machine
- **No External APIs**: Doesn't leak tracking data to third parties
- **User Agent**: Identifies as real browser to avoid detection

## Deployment Options

### Local Cron (Free)
```bash
0 9 * * * cd /path/to/price-checker && npm run check
```

### AWS Lambda (Serverless)
- Deploy as Lambda function
- EventBridge trigger (daily schedule)
- Store data in S3 or DynamoDB

### Docker Container
```dockerfile
FROM node:24
WORKDIR /app
COPY . .
RUN npm install
CMD ["npm", "run", "check"]
```

### GitHub Actions (Free)
```yaml
on:
  schedule:
    - cron: '0 9 * * *'
jobs:
  check-prices:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm run check
```

## Testing Strategy

### Manual Testing
1. `npm run add` - Add test product with known URLs
2. `npm run list` - Verify product appears
3. `npm run check` - Confirm prices scraped correctly
4. Verify JSON storage format
5. Test price alert triggering

### Automated Testing (Future)
- Unit tests for currency conversion
- Mock Puppeteer for scraper tests
- Integration tests for storage layer
- E2E tests with test product pages

## Troubleshooting

### Scraping Failures
- Check if retailer changed HTML structure
- Verify product page loads in browser
- Check for geo-blocking or login requirements
- Update CSS selectors in `SITE_CONFIGS`

### Performance Issues
- Reduce number of tracked products
- Increase delay between requests
- Run during off-peak hours
- Consider using proxies

## Future Roadmap

1. **Price History Tracking**: Store historical prices, generate graphs
2. **Web Dashboard**: React/Vue frontend for visualization
3. **Email/SMS Alerts**: Real notifications beyond console
4. **More Retailers**: Target, Newegg, eBay, etc.
5. **Browser Extension**: One-click tracking from product pages
6. **Price Prediction**: ML model to predict future price drops
7. **Multi-Currency**: Support international retailers
8. **User Accounts**: Multi-user support with authentication

## License

MIT
