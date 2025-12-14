# Quick Start Guide - Price Checker

**Get notified when products go on sale across multiple retailers!**

This guide will help you set up and use the Multi-Retailer Price Checker, even if you're not technical. Follow these steps carefully, and you'll be tracking prices in about 10 minutes.

---

## ⚠️ Important: Read This First

**Legal Notice:** This tool scrapes public retailer websites, which may violate some retailers' Terms of Service. This tool is for **personal use only**. By using it, you accept full responsibility for ensuring your use complies with all applicable laws and retailer policies. The authors are not responsible for any consequences. **Use at your own risk.**

---

## What This Tool Does

Imagine you want to buy AirPods, but they're expensive. You could check Amazon, Best Buy, Walmart, and other stores every day to see if the price drops... or you could use this tool to do it automatically!

**This tool:**
- Checks prices at 7 different stores (Amazon, Best Buy, Walmart, Costco, GameStop, Micro Center, Target)
- Remembers your target price ("I want to pay less than $200")
- Alerts you when ANY store drops below your target price
- Shows you which store has the best deal
- Keeps a history of price changes

---

## Step 1: Prerequisites (What You Need First)

Before starting, you need to install some software on your computer:

### Install Node.js

Node.js is free software that lets you run this price checker.

1. Go to [https://nodejs.org](https://nodejs.org)
2. Download the **LTS version** (the one labeled "Recommended for Most Users")
3. Run the installer and click "Next" through all the steps
4. When it asks about "Tools for Native Modules," you can skip this (uncheck the box)

**To verify it installed correctly:**
- On **Windows**: Open "Command Prompt" (search for it in Start menu)
- On **Mac**: Open "Terminal" (search for it in Spotlight)
- Type: `node --version` and press Enter
- You should see something like `v20.10.0` (the numbers might be different)

---

## Step 2: Download the Price Checker

### Option A: If You Know How to Use Git
```bash
git clone <repository-url>
cd price-checker
```

### Option B: Download as ZIP (Easier for Beginners)
1. Download the price checker files (usually as a ZIP file from GitHub or wherever you got this)
2. Extract the ZIP file to a folder on your computer
   - Right-click the ZIP file → "Extract All"
   - Pick a location you'll remember (like your Documents folder)
3. Remember where you saved it!

---

## Step 3: Install the Price Checker

Now we need to set up the price checker:

### On Windows:
1. Open "Command Prompt" or "PowerShell"
2. Navigate to where you saved the price checker:
   - Type: `cd ` (with a space after cd)
   - Then drag the folder into the window (this will paste the path)
   - Press Enter
3. Type: `npm install` and press Enter
4. Wait 1-2 minutes while it downloads everything it needs
5. You'll see a lot of text scrolling by - this is normal!

### On Mac:
1. Open "Terminal"
2. Navigate to where you saved the price checker:
   - Type: `cd ` (with a space after cd)
   - Then drag the folder into the Terminal window (this will paste the path)
   - Press Enter
3. Type: `npm install` and press Enter
4. Wait 1-2 minutes while it downloads everything it needs

**Success looks like:**
- You'll see text like "added 150 packages"
- No big red "ERROR" messages
- You're back at the command prompt

---

## Step 4: Add Your First Product

Let's track a product! We'll use AirPods as an example.

1. In your Command Prompt/Terminal (from Step 3), type:
   ```bash
   npm run add
   ```

2. You'll see:
   ```
   📦 Add New Price Alert

   ⚠️  Reminder: Please ensure your use complies with retailer Terms of Service.
      This tool is for personal use only. See README for details.

   Product name (e.g., "Apple AirPods Pro 3"):
   ```

3. Type the product name and press Enter:
   ```
   Apple AirPods Pro 3
   ```

4. Enter your target price (how much you want to pay):
   ```
   Target price (alert when ANY retailer drops below): $199
   ```

5. Now add retailer URLs one at a time:

   **Finding the URL:**
   - Go to Amazon.com (or Best Buy, Walmart, etc.)
   - Search for your product
   - Click on the product
   - Copy the URL from your browser's address bar
   - Paste it into the terminal

   **Example:**
   ```
   Retailer URL #1 (or press Enter to finish): https://www.amazon.com/Apple-AirPods-Pro-3/dp/B0FQFB8FMG/
   ⏳ Fetching price...
   ✓ Found: Amazon - $249.99

   Retailer URL #2 (or press Enter to finish): https://www.bestbuy.com/site/apple-airpods-pro-3/6376563.p
   ⏳ Fetching price...
   ✓ Found: Best Buy - $239.99

   Retailer URL #3 (or press Enter to finish): [just press Enter to finish]
   ```

6. You'll see a summary:
   ```
   ✓ Price tracking enabled for "Apple AirPods Pro 3"
     Target Price: $199.00
     Tracking 2 retailer(s):

     ⏳ Best Buy: $239.99
     ⏳ Amazon: $249.99

     💰 Best current price: Best Buy at $239.99
   ```

**Congratulations!** 🎉 You're now tracking prices!

---

## Step 5: Check Prices

To check if prices have changed:

```bash
npm run check
```

This will:
- Visit each retailer's website
- Check the current price
- Compare to your target price
- Show you the best deal
- Alert you if any price is below your target

**What you'll see:**
```
Checking 1 product(s) across multiple retailers...

📦 Apple AirPods Pro 3
   Target: $199.00

   Checking Amazon...
   ⏳ Amazon: $249.99
   Checking Best Buy...
   ⏳ Best Buy: $239.99

   💰 BEST PRICE: Best Buy at $239.99
   🔗 https://www.bestbuy.com/site/apple-airpods-pro-3/6376563.p
   ⏳ Waiting for $40.99 price drop

✓ Price check complete!
```

**If a price drops below your target, you'll see:**
```
🔔 PRICE ALERT TRIGGERED! 🔔
✅ Price dropped below $199.00!
```

---

## Step 6: Set Up Automatic Checks (Optional)

Instead of manually running `npm run check` every day, you can automate it:

**💡 Tip:** We provide helper scripts that make this easier! They automatically handle logging and error tracking.

- **Windows:** Use `scripts\run-check.bat`
- **Mac/Linux:** Use `scripts/run-check.sh`

### Easy Method: Using Helper Scripts

**Windows:**
1. Open Task Scheduler → Create Basic Task
2. Name: "Price Checker", trigger: Daily at 9 AM
3. Action: "Start a program"
4. Program: `C:\path\to\your\price-checker\scripts\run-check.bat` (use your actual path)
5. Done! Logs will be in the `logs` folder.

**Mac/Linux:**
1. Make script executable: `chmod +x scripts/run-check.sh`
2. Edit crontab: `crontab -e`
3. Add this line: `0 9 * * * /absolute/path/to/price-checker/scripts/run-check.sh`
4. Save and exit. Logs will be in the `logs` folder.

### Advanced Method: Manual Setup

If you want more control, follow these detailed steps:

### On Windows (Task Scheduler):

**What is Task Scheduler?** It's Windows' built-in tool to run programs automatically.

1. **Find your folder path:**
   - Open File Explorer
   - Navigate to your price-checker folder
   - Click on the address bar and copy the path (e.g., `C:\Users\YourName\Documents\price-checker`)

2. **Open Task Scheduler:**
   - Press Windows key and type "Task Scheduler"
   - Click on "Task Scheduler" app

3. **Create a new task:**
   - Click "Create Basic Task..." in the right panel
   - Name: `Price Checker`
   - Description: `Automatically check prices daily`
   - Click "Next"

4. **Set the schedule:**
   - Trigger: Select "Daily"
   - Click "Next"
   - Start date: Today's date
   - Time: `9:00:00 AM` (or your preferred time)
   - Recur every: `1 days`
   - Click "Next"

5. **Set the action:**
   - Action: Select "Start a program"
   - Click "Next"
   - Program/script: `cmd.exe`
   - Add arguments: `/c cd /d "C:\Users\YourName\Documents\price-checker" && npm run check >> logs\cron.log 2>&1`
     - **IMPORTANT:** Replace `C:\Users\YourName\Documents\price-checker` with YOUR actual path
   - Click "Next"

6. **Finish setup:**
   - Check "Open the Properties dialog..."
   - Click "Finish"

7. **Optional - Additional settings:**
   - In the Properties dialog that opens:
   - Go to "Conditions" tab
   - Uncheck "Start the task only if the computer is on AC power" (so it runs on battery too)
   - Click "OK"

8. **Create the logs folder:**
   - Open Command Prompt
   - Navigate to your price-checker folder
   - Type: `mkdir logs`

9. **Test it:**
   - In Task Scheduler, find your "Price Checker" task
   - Right-click it and select "Run"
   - Check `logs\cron.log` to see if it worked

**To view logs later:**
- Open `logs\cron.log` with Notepad

**To edit or delete the task:**
- Open Task Scheduler
- Find "Price Checker" in the task list
- Right-click → "Properties" to edit, or "Delete" to remove

**Common schedules:**
- Daily at 9 AM (covered above)
- Twice daily: Create two tasks, one at 9 AM and one at 9 PM
- Weekly: Choose "Weekly" as trigger instead of "Daily"

### On Mac/Linux (cron):

**What is cron?** It's a built-in scheduler on Mac and Linux that runs commands automatically.

1. **Find your folder path:**
   - Open Terminal
   - Navigate to your price-checker folder: `cd /path/to/price-checker`
   - Type: `pwd` and press Enter
   - Copy the path it shows (e.g., `/Users/yourname/Documents/price-checker`)

2. **Edit your crontab:**
   - Type: `crontab -e`
   - If asked to choose an editor, press `1` for nano (easiest)

3. **Add the cron job:**
   - If using nano, just start typing at the bottom
   - If using vim, press `i` first to enter insert mode
   - Add this line (replace `/Users/yourname/price-checker` with YOUR path from step 1):
   ```
   0 9 * * * cd /Users/yourname/price-checker && npm run check >> /Users/yourname/price-checker/logs/cron.log 2>&1
   ```

4. **Save and exit:**
   - **Nano:** Press `Ctrl+X`, then `Y`, then Enter
   - **Vim:** Press `Esc`, type `:wq`, press Enter

5. **Create the logs folder:**
   ```bash
   mkdir logs
   ```

6. **Verify it was added:**
   ```bash
   crontab -l
   ```
   You should see your cron job listed.

**What this does:** Checks prices every day at 9:00 AM and saves the output to `logs/cron.log`

**Common schedules:**
- `0 9 * * *` - Every day at 9:00 AM
- `0 9,21 * * *` - Every day at 9:00 AM and 9:00 PM
- `0 */6 * * *` - Every 6 hours
- `0 9 * * 1` - Every Monday at 9:00 AM
- `0 9 1 * *` - First day of every month at 9:00 AM

**To view logs later:**
```bash
cat logs/cron.log
```

**To remove the cron job:**
```bash
crontab -e
# Delete the line, then save and exit
```

---

## Common Commands Reference

Here are the commands you'll use most often:

| Command | What It Does |
|---------|-------------|
| `npm run add` | Add a new product to track |
| `npm run list` | See all products you're tracking |
| `npm run check` | Check prices now |
| `npm run append` | Add more retailers to an existing product |
| `npm run remove` | Stop tracking a product |

---

## Tips for Success

### Finding Product URLs

**Good URLs:**
- Direct product page: ✅ `https://www.amazon.com/Apple-AirPods/dp/B0FQFB8FMG/`
- With tracking parameters: ✅ `https://www.bestbuy.com/site/apple-airpods/6376563.p?skuId=6376563`

**Bad URLs:**
- Search results: ❌ `https://www.amazon.com/s?k=airpods`
- Category pages: ❌ `https://www.bestbuy.com/site/headphones/cat09012`

**Tip:** Make sure you're on the actual product page with the price visible!

### How Often to Check

- **Manual checking:** Once or twice a day is reasonable
- **Automatic checking:** Once per day is best
- **Don't check too often!** Retailers may block you if you check every few minutes

### What If It Doesn't Work?

**"Could not find price on page":**
- The website may have changed
- Try the URL in a regular browser first
- Make sure the product is in stock

**"Unsupported retailer":**
- Only these stores work: Amazon, Best Buy, Walmart, Costco, GameStop, Micro Center, Target
- Make sure you copied the full URL

**"Invalid URL format":**
- Make sure you copied the entire URL from your browser
- Check for extra spaces at the beginning or end

---

## Viewing Your Tracked Products

To see everything you're tracking:

```bash
npm run list
```

You'll see:
```
📋 Tracked Products (1)

[1734188400000] Apple AirPods Pro 3
  Target Price: $199.00
  Status: ⏳ Monitoring
  Retailers (2):

    ⏳ Best Buy: $239.99 (checked: 12/14/2025, 3:30:00 PM)
       https://www.bestbuy.com/site/apple-airpods-pro-3/6376563.p
    ⏳ Amazon: $249.99 (checked: 12/14/2025, 3:30:05 PM)
       https://www.amazon.com/Apple-AirPods/dp/B0FQFB8FMG/

    💰 Best price: Best Buy at $239.99
```

---

## Advanced: Configuration

You can customize how the price checker works using environment variables.

### Windows:
```cmd
set DEBUG_SCRAPER=true
npm run check
```

### Mac/Linux:
```bash
DEBUG_SCRAPER=true npm run check
```

### Available Settings:

| Setting | What It Does | Default |
|---------|-------------|---------|
| `DEBUG_SCRAPER=true` | Save screenshots for debugging | false |
| `MAX_RETRIES=5` | How many times to retry if it fails | 3 |
| `DELAY_BETWEEN_REQUESTS=3000` | Wait time between stores (milliseconds) | 2000 |
| `ENABLE_PRICE_HISTORY=false` | Turn off price history tracking | true |

---

## Need More Help?

- **Full documentation:** See `README.md` for technical details
- **Configuration options:** See the Configuration section in README.md
- **Common errors:** See the Troubleshooting section in README.md

---

## Quick Troubleshooting

### Nothing happens when I run a command
- Make sure you're in the right folder (the price-checker folder)
- Try `cd` to the folder again

### "npm: command not found"
- Node.js isn't installed correctly
- Go back to Step 1 and reinstall Node.js
- Restart your Command Prompt/Terminal after installing

### Prices seem wrong
- Clear the data and re-add products
- Some stores show different prices based on your location
- Make sure you're using the exact product page URL

### It's taking forever
- Be patient! Each retailer check takes 3-5 seconds
- If you're tracking 3 products across 5 retailers, that's 15 checks = about 1 minute

---

## Data Location

All your tracked products are stored in:
```
price-checker/data/products.json
```

**Backup tip:** Copy this file to save your tracked products! If you reinstall or move the price checker, you can restore this file.

---

## Staying Safe and Responsible

**Remember:**
- This tool visits retailer websites automatically
- Some retailers don't allow this in their Terms of Service
- Use this tool for **personal use only**
- Don't check prices more than a few times per day
- Don't use this for commercial purposes or to resell data
- Be respectful of retailer resources

**You are responsible for how you use this tool. Use it ethically!**

---

## What's Next?

Now that you're set up:

1. **Add more products** - Track everything you're interested in buying
2. **Add more retailers** - Use `npm run append` to add more stores for existing products
3. **Set up automation** - Let it run daily so you never miss a deal
4. **Share responsibly** - If you tell friends about this, remind them about the Terms of Service

**Happy price tracking! 🎉💰**
