# REKT News Website

A minimalistic crypto security news website inspired by rekt.news, built with Next.js 15 and Google Sheets as the database.

## Features

- **Minimalistic Design**: Clean black background with white text, matching rekt.news aesthetic
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile devices
- **Google Sheets Integration**: Easy-to-use database that anyone can manage
- **Category Filtering**: Browse articles by security incident categories
- **Clean URLs**: SEO-friendly article URLs
- **Sample Data**: Includes sample articles for immediate testing
- **Fast Loading**: Optimized for performance with Next.js 15

## Website Structure

- **Homepage** (`/`) - Shows all articles with "You might also like" section
- **Article Detail** (`/articles/slug`) - Shows full article content with formatting
- **Categories** (`/categories`) - Lists all available categories
- **Category Page** (`/categories/category-name`) - Shows articles from specific category

## Quick Start

1. **Install dependencies** (already done):
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** and go to `http://localhost:3000`

The website will work immediately with sample data. To use your own articles, follow the Google Sheets setup instructions below.

## Google Sheets Setup

Follow the step-by-step guide in `GOOGLE_SHEETS_SETUP.md` to connect your own Google Sheet with articles. The process takes about 10 minutes and requires:

- A Google account (free)
- Google Cloud project (free tier)
- Your article data in CSV format

### Quick Setup Summary:

1. Create a Google Sheet with columns: ID, Title, Content, Category, Tags, URL, Date
2. Share the sheet with "Anyone with the link"
3. Create Google Cloud credentials
4. Set up environment variables in `.env.local`
5. Import your 100+ articles from CSV

## Sample Data

The website includes 6 sample articles covering various crypto security incidents:
- npm package security incidents
- Exchange phishing attacks
- DeFi protocol breaches
- Supply chain attacks
- Flash loan exploits
- Malware threats

## Technical Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Database**: Google Sheets API
- **UI Components**: Custom components with shadcn/ui base
- **Icons**: Lucide React

## Project Structure

```
src/
├── app/
│   ├── api/articles/          # API routes for articles
│   ├── articles/[slug]/       # Article detail pages
│   ├── categories/            # Categories listing
│   ├── categories/[category]/ # Category pages
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Homepage
├── components/
│   ├── news/                 # News-related components
│   │   ├── ArticleCard.tsx   # Individual article card
│   │   ├── ArticleDetail.tsx # Full article view
│   │   ├── ArticleList.tsx   # List of articles
│   │   ├── Footer.tsx        # Website footer
│   │   └── Header.tsx        # Navigation header
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── google/
│   │   └── sheets.ts         # Google Sheets integration
│   └── utils.ts              # Utility functions
└── types/
    └── article.ts            # TypeScript interfaces
```

## Customization

### Colors and Styling
- Edit `src/app/globals.css` for custom styles
- Modify Tailwind classes in components for layout changes
- Update colors in `tailwind.config.ts`

### Content Structure
- Modify article card layout in `src/components/news/ArticleCard.tsx`
- Update article detail view in `src/components/news/ArticleDetail.tsx`
- Change homepage layout in `src/app/page.tsx`

### Adding New Features
- Add new API routes in `src/app/api/`
- Create new pages in `src/app/`
- Add new components in `src/components/`

## Deployment

The website is ready for deployment on any platform that supports Next.js:

1. **Vercel** (recommended):
   ```bash
   npm run build
   ```
   Then deploy to Vercel

2. **Other platforms**:
   - Set up environment variables in your hosting platform
   - Build the project: `npm run build`
   - Start the production server: `npm start`

## Environment Variables

Create a `.env.local` file based on `.env.local.example`:

```env
GOOGLE_SHEETS_ID=your-sheet-id-here
GOOGLE_APPLICATION_CREDENTIALS=your-json-credentials-here
```

## Troubleshooting

### Common Issues

**Articles not loading:**
- Check Google Sheets ID in environment variables
- Verify Google Cloud credentials are correctly formatted
- Ensure sheet is shared with "Anyone with the link"

**Build errors:**
- Run `npm run lint` to check for code issues
- Ensure all dependencies are installed: `npm install`
- Check TypeScript errors in your IDE

**Styling issues:**
- Verify Tailwind CSS is properly configured
- Check for conflicting styles in components
- Ensure responsive classes are correctly applied

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the Google Sheets setup guide
3. Verify environment variables are correctly set
4. Check browser console for JavaScript errors

## License

This project is open source and available under the MIT License.

---

**Ready to launch!** Your crypto security news website is now complete and ready to use with either sample data or your own Google Sheets database.