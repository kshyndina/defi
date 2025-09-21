import { google } from 'googleapis';
import { marked } from 'marked';
import { Article } from '@/types/article';

export class GoogleSheetsService {
  private sheets: any;
  private spreadsheetId: string;
  private lastFetchTime: number = 0;
  private cachedArticles: Article[] = [];

  constructor() {
    this.spreadsheetId = process.env.SHEET_ID || '';
    
    // Initialize Google Sheets API
    let credentials;
    try {
      // Check if GOOGLE_APPLICATION_CREDENTIALS is available
      if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        throw new Error('GOOGLE_APPLICATION_CREDENTIALS environment variable is not set');
      }
      
      credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    } catch (error) {
      console.error('Error with GOOGLE_APPLICATION_CREDENTIALS:', error);
      throw new Error('Invalid or missing GOOGLE_APPLICATION_CREDENTIALS. Please check your .env.local file.');
    }
    
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      credentials,
    });

    this.sheets = google.sheets({ version: 'v4', auth });
  }

  clearCache() {
    this.cachedArticles = [];
    this.lastFetchTime = 0;
  }

  async getAllArticles(forceRefresh: boolean = false): Promise<Article[]> {
    try {
      if (!this.spreadsheetId) {
        throw new Error('Google Sheets ID not configured');
      }

      // Check if we should use cached data
      const now = Date.now();
      const cacheAge = now - this.lastFetchTime;
      const cacheValid = !forceRefresh && this.cachedArticles.length > 0 && cacheAge < 86400000; // 24 hours

      if (cacheValid) {
        console.log('Using cached articles data');
        return this.cachedArticles;
      }

      console.log('Fetching fresh articles from Google Sheets');
      
      // Use Next.js fetch with caching for API calls
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Crypto Articles for Dexcelerate!A2:G', // Skip header row, include up to column G for date
      }, forceRefresh ? {
        // Bypass cache when forceRefresh is true
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      } : {
        // Add caching options for normal requests
        headers: {
          'Cache-Control': 's-maxage=86400, stale-while-revalidate',
        },
      });

      const rows = response.data.values || [];
      
      // Skip header row if it contains CSV headers
      const dataRows = rows.length > 0 && rows[0][1] === 'Article Name' ? rows.slice(1) : rows;
      
      const articles = await Promise.all(dataRows.map(async (row: string[], index: number) => {
        const title = row[1] || '';
        const content = row[2] || '';
        const category = row[3] || '';
        const tags = row[4] ? row[4].split(',').map(tag => tag.trim()) : [];
        const urlSlug = row[5] || this.slugify(title);
        const date = row[6] || new Date().toISOString().split('T')[0];
        
        return {
          id: row[0] || `article-${index}`,
          title,
          content: await marked.parse(content), // Convert markdown to HTML
          preview: await this.getContentPreview(content), // Add preview
          category,
          tags,
          url: urlSlug,
          date,
        };
      }));
      
      // Sort articles by date (newest first)
      this.cachedArticles = articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      this.lastFetchTime = now;
      
      return this.cachedArticles;
    } catch (error) {
      console.error('Error fetching articles from Google Sheets:', error);
      throw new Error('Failed to fetch articles from Google Sheets');
    }
  }

  async getArticlesByCategory(category: string, forceRefresh: boolean = false): Promise<Article[]> {
    const allArticles = await this.getAllArticles(forceRefresh);
    return allArticles.filter(article =>
      article.category.toLowerCase().includes(category.toLowerCase())
    );
  }

  async getArticleByUrl(url: string, forceRefresh: boolean = false): Promise<Article | null> {
    console.log('GoogleSheetsService: getArticleByUrl called with url:', url);
    
    const allArticles = await this.getAllArticles(forceRefresh);
    console.log('GoogleSheetsService: Total articles fetched:', allArticles.length);
    
    // Check if the URL contains a path (category/slug) or just a slug
    const slug = url.includes('/') ? url.split('/').pop() : url;
    console.log('GoogleSheetsService: Extracted slug:', slug);
    
    // Log all article URLs for debugging
    console.log('GoogleSheetsService: All article URLs:');
    allArticles.forEach(article => {
      console.log(`- ${article.title}: ${article.url}`);
    });
    
    const foundArticle = allArticles.find(article => {
      const articleSlug = article.url.includes('/') ? article.url.split('/').pop() : article.url;
      console.log(`GoogleSheetsService: Comparing article slug "${articleSlug}" with requested slug "${slug}"`);
      return articleSlug === slug;
    });
    
    console.log('GoogleSheetsService: Article found:', foundArticle ? 'Yes' : 'No');
    if (foundArticle) {
      console.log('GoogleSheetsService: Found article title:', foundArticle.title);
    }
    
    return foundArticle || null;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private async getContentPreview(content: string, maxLength: number = 150): Promise<string> {
    // First convert markdown to HTML
    const htmlContent = await marked.parse(content);
    
    // Strip all HTML tags, especially h1 tags which are used for titles
    let plainText = htmlContent
      .replace(/<h[1-6][^>]*>.*?<\/h[1-6]>/gi, '') // Remove all header tags
      .replace(/<[^>]+>/g, '') // Remove all other HTML tags
      .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
      .trim();
    
    // Get first few sentences
    const sentences = plainText.split('. ').slice(0, 2);
    let preview = sentences.join('. ');
    
    // Ensure we don't end in the middle of a sentence if we're close to maxLength
    if (preview.length > maxLength - 20) {
      // Try to end at a sentence boundary
      const lastSentenceEnd = preview.lastIndexOf('.');
      if (lastSentenceEnd > maxLength * 0.7) {
        preview = preview.substring(0, lastSentenceEnd + 1);
      } else {
        preview = preview.substring(0, maxLength) + '...';
      }
    }
    
    return preview;
  }
}

export const googleSheetsService = new GoogleSheetsService();