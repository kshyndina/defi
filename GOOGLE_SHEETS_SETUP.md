# Google Sheets Setup Guide for REKT News

This guide will help you set up Google Sheets as your database for the REKT news website. I'll explain this step by step like you're 5 years old.

## What You Need
- A Google account (free)
- Your computer
- 10 minutes of time

## Step 1: Create Your Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com)
2. Click "Blank spreadsheet"
3. Name it something like "REKT News Articles"
4. In the first row, create these columns:
   - Column A: `ID`
   - Column B: `Title`
   - Column C: `Content`
   - Column D: `Category`
   - Column E: `Tags`
   - Column F: `URL`
   - Column G: `Date`

## Step 2: Add Your Articles

Now add your articles. Each row is one article:

**Example:**
```
A1: ID
B1: Title
C1: Content
D1: Category
E1: Tags
F1: URL
G1: Date

A2: 1
B2: THE GREAT NPM HEIST THAT WASN'T
C2: A detailed analysis of the recent npm package security incident...
D2: npm - Developers - Phishing
E2: npm, security, developers, phishing
F2: the-great-npm-heist-that-wasnt
G2: 2025-09-15
```

**Important:**
- ID: Just a number (1, 2, 3...)
- Title: The article title in ALL CAPS (like REKT style)
- Content: The full article content (can include HTML)
- Category: Something like "DeFi - Phishing - Exchange"
- Tags: Comma-separated tags like "defi, phishing, exchange"
- URL: Should be just the slug (without /articles/ prefix)
- Date: YYYY-MM-DD format

## Step 3: Share Your Sheet

1. Click the "Share" button (top right)
2. Click "Get link"
3. Change "Restricted" to "Anyone with the link"
4. Copy the link - you'll see something like:
   ```
   https://docs.google.com/spreadsheets/d/1AbCdeFgHiJkLmNoPqRsTuVwXyZ/edit
   ```
5. Copy the part between `/d/` and `/edit` - this is your Sheet ID:
   ```
   1AbCdeFgHiJkLmNoPqRsTuVwXyZ
   ```

## Step 4: Get Google Cloud Credentials

This is the hardest part, but I'll make it simple:

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (click project dropdown → New Project)
3. Name it "REKT News" and click Create
4. Wait a minute for it to be created
5. In the search bar, type "Google Sheets API" and click on it
6. Click "Enable"
7. Go to "Credentials" in the left menu
8. Click "+ CREATE CREDENTIALS" → "Service account"
9. Fill in:
   - Service account name: `rekt-news-service`
   - Description: `Service account for REKT news website`
10. Click "Create and continue"
11. Skip the "Grant access" step (click Done)
12. Find your service account in the list and click on it
13. Go to the "Keys" tab
14. Click "Add Key" → "Create new key"
15. Select "JSON" and click Create
16. A JSON file will download - this is your credentials file
17. **IMPORTANT:** Keep this file secret! Don't share it with anyone!

## Step 5: Set Up Environment Variables

1. Copy the downloaded JSON file content
2. Create a file named `.env.local` in your project root
3. Copy the content from `.env.local.example` to `.env.local`
4. Add these lines to `.env.local`:

```env
GOOGLE_SHEETS_ID=YOUR_SHEET_ID_HERE
GOOGLE_APPLICATION_CREDENTIALS={"type":"service_account","project_id":"your-project-id","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
```

**How to fill this:**
- `GOOGLE_SHEETS_ID`: Paste the Sheet ID you copied in Step 3
- `GOOGLE_APPLICATION_CREDENTIALS`: Open the downloaded JSON file, copy everything, and paste it here (remove all line breaks)

**Example:**
```env
GOOGLE_SHEETS_ID=1AbCdeFgHiJkLmNoPqRsTuVwXyZ
GOOGLE_APPLICATION_CREDENTIALS={"type":"service_account","project_id":"rekt-news-12345","private_key_id":"abc123def456","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB\n...","client_email":"rekt-news-service@rekt-news-12345.iam.gserviceaccount.com","client_id":"123456789","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/rekt-news-service%40rekt-news-12345.iam.gserviceaccount.com"}
```

## Step 6: Add to Git Ignore

1. Open `.gitignore` file in your project
2. Add these lines:
   ```
   .env.local
   ```

## Step 7: Restart Your App

1. Stop your development server (Ctrl+C)
2. Start it again: `npm run dev`
3. Your app should now load articles from Google Sheets!

## Troubleshooting

**If you see "Loading articles..." forever:**
- Check your Sheet ID is correct
- Check your JSON credentials are correctly formatted
- Make sure your sheet is shared with "Anyone with the link"

**If you get permission errors:**
- Make sure you enabled the Google Sheets API
- Check your service account email is correct
- Try re-creating the service account key

**If articles don't appear:**
- Make sure your sheet has the exact column names (ID, Title, Content, etc.)
- Check that you have at least one row of data
- Make sure the sheet is published (share → anyone with link)

## Importing Your 100+ Articles

You have a CSV with 100+ articles. Here's how to import them:

1. In Google Sheets, click "File" → "Import"
2. Upload your CSV file
3. Choose "Replace spreadsheet" and click "Import data"
4. Make sure the columns match:
   - Number → ID
   - Article Name → Title
   - Clean Body → Content
   - Category → Category
   - Tags → Tags
   - URL → URL (remove /articles/ prefix, keep only the slug)
5. Clean up the data if needed

## Website Structure

Your website now has:
- **Homepage** (`/`) - Shows all articles with "You might also like" section
- **Article Detail** (`/articles/slug`) - Shows full article content
- **Categories** (`/categories`) - Lists all categories
- **Category Page** (`/categories/category-name`) - Shows articles from specific category

## Ready to Launch!

That's it! Your REKT news website is now connected to Google Sheets and ready to go! The website features:

- Minimalistic black design matching rekt.news
- Responsive layout that works on all devices
- Google Sheets as database (easy to update)
- Category filtering
- Clean article URLs
- Sample data included for testing

Just run `npm run dev` and your website will be live at `http://localhost:3000`!