<p align="center">
  <img src="logo.svg" alt="Price Checker Logo" width="200" height="200">
</p>

# Multi-Retailer Price Checker

MVP price alert system for tracking products across multiple major retailers. Inspired by CamelCamelCamel but works across multiple retailers.

**🚀 New to this?** Check out the [Quick Start Guide (QUICKSTART.md)](QUICKSTART.md) for a beginner-friendly setup tutorial!

**🔍 Technical evaluation?** Read the [Technical Review (TECHNICAL-REVIEW.md)](TECHNICAL-REVIEW.md) for a Staff+ engineer's perspective on production readiness, limitations, and alternatives.

## Features

- Track the same product across multiple retailers
- Supports 7 major retailers: Amazon, Best Buy, Walmart, Costco, GameStop, Micro Center, and Target
- Automatic price comparison - always shows best current price
- Set price thresholds and get alerted when ANY retailer drops below target
- Price history tracking (configurable)
- Simple CLI interface
- Local JSON storage (no database required)
- Configurable settings via environment variables

## Important Disclaimer

⚠️ **Terms of Service Compliance**

This tool is provided for educational and personal use only. Before using this application:

- **Review each retailer's Terms of Service** - Some retailers explicitly prohibit automated scraping in their Terms of Service
- **Use responsibly** - Excessive or aggressive scraping may violate retailer policies and could result in IP bans or legal action
- **Respect rate limits** - The default delay between requests (2 seconds) is intentionally conservative. Do not reduce this without careful consideration
- **Personal use only** - This tool is intended for individual price monitoring, not commercial data collection or resale
- **No warranty** - This software is provided "as-is" without any guarantees

**By using this software, you acknowledge that:**
- You are responsible for ensuring your use complies with all applicable laws and terms of service
- The authors are not responsible for any consequences resulting from your use of this tool
- You will use this tool ethically and in accordance with retailer policies

If you're uncertain about the legality or permissibility of using this tool with a specific retailer, **consult their Terms of Service or seek legal advice before proceeding.**

## Setup

1. Install dependencies:
```bash
npm install
```

2. That's it! The app will create a `data/` directory for storing product data automatically.

## Usage

### Add a new product to track

```bash
npm run add
```

Follow the prompts to enter:
1. Product name (e.g., "Apple AirPods Pro 3")
2. Target price (you'll be alerted when ANY retailer drops below this)
3. URLs from different retailers (one at a time)
   - Amazon: `https://www.amazon.com/...`
   - Best Buy: `https://www.bestbuy.com/...`
   - Walmart: `https://www.walmart.com/...`
   - Costco: `https://www.costco.com/...`
   - GameStop: `https://www.gamestop.com/...`
   - Micro Center: `https://www.microcenter.com/...`
   - Target: `https://www.target.com/...`

The app will:
- Validate URLs and fetch current prices from each retailer
- Show you the best current price
- Track price history for each retailer
- Alert when any retailer drops below your target

**Example:**
```
Product name: Apple AirPods Pro 3
Target price: $199

Retailer URL #1: https://www.amazon.com/Apple-Cancellation.../dp/B0FQFB8FMG/
✓ Found: Amazon - $249.99

Retailer URL #2: https://www.bestbuy.com/product/apple-airpods-pro-3.../6376563
✓ Found: Best Buy - $239.99

Retailer URL #3: (press Enter to finish)

✓ Price tracking enabled for "Apple AirPods Pro 3"
  Tracking 2 retailer(s):
  ⏳ Best Buy: $239.99
  ⏳ Amazon: $249.99
  💰 Best current price: Best Buy at $239.99
```

### Add retailers to existing product

```bash
npm run append
```

Add more retailers to a product you're already tracking without re-entering everything. Perfect for when you want to expand your price tracking coverage.

### List all tracked products

```bash
npm run list
```

Shows all products with prices from each retailer, sorted by best price.

### Check prices now

```bash
npm run check
```

Manually check prices for all tracked products. This will:
- Fetch current prices from all retailers
- Compare across retailers to find best price
- Display alerts for any items below your target threshold
- Show potential savings

### Remove a product

```bash
npm run remove
```

Remove a product and all its retailers by ID.

## Automation

Automate price checks to run on a schedule without manual intervention.

### Linux/Mac - Cron Job

**Recommended: Use the Helper Script**

We provide a script that handles logging, error reporting, and log rotation automatically:

```bash
# Make the script executable (only needed once)
chmod +x scripts/run-check.sh

# Edit crontab
crontab -e

# Add this line to check daily at 9 AM
0 9 * * * /absolute/path/to/price-checker/scripts/run-check.sh
```

The helper script automatically:
- Creates log directory if needed
- Adds timestamps to all log entries
- Rotates logs to prevent unlimited growth
- Logs errors to a separate file
- Tracks success/failure status

**Alternative: Direct Command**

If you prefer not to use the helper script:

```bash
# Edit crontab
crontab -e

# Add this line to check daily at 9 AM with logging
0 9 * * * cd /path/to/price-checker && npm run check >> /path/to/price-checker/logs/cron.log 2>&1
```

**Create logs directory:**
```bash
mkdir logs
```

**Cron Schedule Examples:**

```bash
# Every day at 9 AM
0 9 * * * cd /path/to/price-checker && npm run check >> logs/cron.log 2>&1

# Every day at 9 AM and 9 PM
0 9,21 * * * cd /path/to/price-checker && npm run check >> logs/cron.log 2>&1

# Every 6 hours
0 */6 * * * cd /path/to/price-checker && npm run check >> logs/cron.log 2>&1

# Every Monday at 9 AM
0 9 * * 1 cd /path/to/price-checker && npm run check >> logs/cron.log 2>&1

# First day of every month at 9 AM
0 9 1 * * cd /path/to/price-checker && npm run check >> logs/cron.log 2>&1
```

**Cron Syntax:** `minute hour day-of-month month day-of-week command`
- minute: 0-59
- hour: 0-23
- day-of-month: 1-31
- month: 1-12
- day-of-week: 0-7 (0 and 7 are Sunday)

**View logs:**
```bash
cat logs/cron.log
tail -f logs/cron.log  # Follow logs in real-time
```

**Troubleshooting cron:**
```bash
# List current cron jobs
crontab -l

# Check if cron service is running (Linux)
sudo service cron status

# Check system logs for cron errors (Linux)
grep CRON /var/log/syslog

# Check cron logs (Mac)
log show --predicate 'process == "cron"' --last 1h
```

### Windows - Task Scheduler

**Recommended: Use the Helper Script**

We provide a batch script that handles logging, error reporting, and directory management:

1. Open Task Scheduler (search in Start menu)
2. Click "Create Basic Task"
3. Name: "Price Checker"
4. Trigger: Daily at 9:00 AM
5. Action: "Start a program"
6. Program: `C:\path\to\price-checker\scripts\run-check.bat`
7. Finish and enable the task

The helper script automatically:
- Creates log directory if needed
- Adds timestamps to all log entries
- Logs errors to a separate file
- Tracks success/failure status

**Alternative: Direct Command via GUI**

If you prefer not to use the helper script:

1. Open Task Scheduler (search in Start menu)
2. Click "Create Basic Task"
3. Name: "Price Checker"
4. Trigger: Daily at 9:00 AM
5. Action: "Start a program"
6. Program: `cmd.exe`
7. Arguments: `/c cd /d "C:\path\to\price-checker" && npm run check >> logs\cron.log 2>&1`
8. Finish and enable the task

**Setup via PowerShell:**

```powershell
$action = New-ScheduledTaskAction -Execute 'cmd.exe' -Argument '/c cd /d "C:\path\to\price-checker" && npm run check >> logs\cron.log 2>&1'
$trigger = New-ScheduledTaskTrigger -Daily -At 9am
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "PriceChecker" -Description "Daily price check"
```

**View logs:**
```powershell
Get-Content logs\cron.log
Get-Content logs\cron.log -Wait  # Follow logs in real-time
```

### Cloud Deployment Options

**GitHub Actions:**

Create `.github/workflows/price-check.yml`:

```yaml
name: Price Check
on:
  schedule:
    - cron: '0 9 * * *'  # Daily at 9 AM UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  check-prices:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run check
```

**AWS Lambda (scheduled with EventBridge):**

Package your app and deploy with a CloudWatch Events rule for scheduling.

**Google Cloud Functions (scheduled with Cloud Scheduler):**

Deploy as a Cloud Function and use Cloud Scheduler to trigger it.

**Vercel/Netlify (scheduled with cron):**

Use their built-in cron job features for serverless functions.

### Docker + Cron

**Dockerfile:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "check"]
```

**docker-compose.yml with cron:**
```yaml
version: '3'
services:
  price-checker:
    build: .
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
```

Then use host cron to run: `0 9 * * * docker-compose run price-checker`

### Logging Best Practices

**Log rotation to prevent files from growing too large:**

```bash
# Linux - Create logrotate config
sudo nano /etc/logrotate.d/price-checker

# Add:
/path/to/price-checker/logs/*.log {
    daily
    rotate 7
    compress
    missingok
    notifempty
}
```

**Manual log cleanup:**
```bash
# Keep only last 100 lines
tail -n 100 logs/cron.log > logs/cron.log.tmp && mv logs/cron.log.tmp logs/cron.log

# Delete logs older than 7 days
find logs -name "*.log" -mtime +7 -delete
```

### Monitoring

**Email notifications on failure (Linux/Mac):**

```bash
# Install mailutils (Linux) or use built-in mail (Mac)
0 9 * * * cd /path/to/price-checker && npm run check >> logs/cron.log 2>&1 || echo "Price check failed" | mail -s "Price Checker Error" your@email.com
```

**Check last run status:**

```bash
# Add to end of cron job
... && echo "Success: $(date)" >> logs/status.log || echo "Failed: $(date)" >> logs/status.log
```

## How It Works

1. Uses Puppeteer to scrape product pages from multiple retailers
2. Auto-detects retailer from URL (Amazon, Best Buy, Walmart, Costco, GameStop, Micro Center, Target)
3. Uses site-specific selectors to extract price and product title
4. Validates URLs before scraping to prevent errors
5. Groups retailers by product in `data/products.json`
6. Tracks price history for each retailer (configurable)
7. Compares prices across all retailers
8. Shows best current price and triggers alerts when ANY retailer drops below threshold
9. Uses write queuing to prevent race conditions during concurrent updates

## Configuration

The app can be configured using environment variables:

```bash
# Scraping settings
MAX_RETRIES=3                      # Number of retry attempts (default: 3)
REQUEST_TIMEOUT=30000              # Request timeout in ms (default: 30000)
DELAY_BETWEEN_REQUESTS=2000        # Delay between requests in ms (default: 2000)

# Debug settings
DEBUG_SCRAPER=true                 # Enable debug mode with screenshots (default: false)

# Price history settings
ENABLE_PRICE_HISTORY=true          # Track price history (default: true)
MAX_HISTORY_ENTRIES=100            # Max history entries per retailer (default: 100)
```

**Example usage:**
```bash
DEBUG_SCRAPER=true npm run check
```

## Technical Details

### Currency Storage
Prices are stored as **integers (cents)** rather than floating-point numbers to avoid precision issues:
- `$249.99` is stored as `24999` (cents)
- `$199.00` is stored as `19900` (cents)
- This follows industry best practices (used by Stripe, PayPal, etc.)
- Prevents floating-point arithmetic errors in price calculations
- User-facing display automatically converts cents to dollars

### Data Structure
```json
{
  "id": "1234567890",
  "name": "Apple AirPods Pro 3",
  "targetPriceCents": 19900,
  "triggered": false,
  "retailers": [
    {
      "url": "https://www.amazon.com/...",
      "retailer": "Amazon",
      "currentPriceCents": 24999,
      "lastChecked": "2025-12-14T15:30:00.000Z",
      "priceHistory": [
        {
          "priceCents": 24999,
          "timestamp": "2025-12-14T15:30:00.000Z"
        }
      ]
    }
  ]
}
```

### Architecture
- **Scraper** (`src/scraper.js`): Multi-site web scraping with Puppeteer and stealth plugin
- **Storage** (`src/storage.js`): JSON-based product/retailer management with write queue for race condition prevention
- **Currency** (`src/currency.js`): Dollar/cent conversion utilities
- **Config** (`src/config.js`): Configuration management with environment variable support
- **CLI** (`src/cli.js`): Interactive command-line interface with URL validation
- **Checker** (`src/check-prices.js`): Automated price monitoring and history tracking

## Limitations

- **Terms of Service** - Web scraping may violate some retailers' Terms of Service. See disclaimer above.
- **Rate limiting** - Retailers may block automated requests if you check too frequently (use DELAY_BETWEEN_REQUESTS to adjust)
- **Selector brittleness** - Price selectors may break if retailers change their HTML structure
- **Notification methods** - Currently only supports console notifications (can be extended to email/SMS)
- **Special handling** - Some retailer pages may require special handling (geo-blocking, login walls, etc.)
- **Visualization** - Price history is stored but not yet visualized

## Future Enhancements

- Email/SMS/push notifications (Pushover, ntfy.sh, email)
- Price history graphs and visualization
- Support for more retailers (Newegg, eBay, B&H Photo, etc.)
- Web dashboard to visualize price trends
- Percentage-based alerts (e.g., "alert on 20% discount")
- Browser extension for one-click product tracking
- Export price data and history to CSV
- Price drop predictions using historical data
- Configurable notification preferences per product

## Deployment Options

### Local Cron Job
Simple and free, runs on your computer.

### Cloud Function
Deploy to AWS Lambda, Google Cloud Functions, or Vercel. Use their built-in schedulers.

### Small VPS
$5/month server gives you full control and ability to add features like a web dashboard.

## Troubleshooting

**Error: "Could not find price on page"**
- The retailer's HTML structure may have changed
- The product page may require login or location verification
- Try the URL in a regular browser first
- Check if the product is out of stock or unavailable

**Error: "Unsupported retailer"**
- Only Amazon, Best Buy, Walmart, Costco, GameStop, Micro Center, and Target are currently supported
- Make sure the URL is from a supported site
- Verify the URL format is correct (invalid URLs will be caught by validation)

**Puppeteer won't launch**
- Make sure you have Chromium dependencies installed
- On Linux: `apt-get install -y chromium-browser`
- On macOS: Puppeteer should work out of the box

**Prices seem wrong or outdated**
- Some retailers show different prices based on location
- Prices may vary if you're logged in vs logged out
- Run `npm run check` to refresh all prices

## License

MIT
