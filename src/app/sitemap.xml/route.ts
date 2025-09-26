import { NextResponse } from 'next/server';
import { googleSheetsService } from '@/lib/google/sheets';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://degennews.com';
  
  try {
    // Fetch all articles dynamically, forcing a refresh to ensure we get the latest data
    const articles = await googleSheetsService.getAllArticles(true);
    console.log(`Sitemap generation: Fetched ${articles.length} articles`);
    
    // Get unique categories
    const categories = [...new Set(articles.map(article => article.category))];
    console.log(`Sitemap generation: Found ${categories.length} unique categories`);
    
    // Build sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;
    
    // Add category pages
    categories.forEach(category => {
      const categorySlug = category.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '%26');
      sitemap += `
  <url>
    <loc>${baseUrl}/categories/${categorySlug}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });
    
    // Add all article pages
    articles.forEach(article => {
      sitemap += `
  <url>
    <loc>${baseUrl}/articles/${article.url}</loc>
    <lastmod>${article.date || new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    });
    
    sitemap += `
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 's-maxage=86400, stale-while-revalidate'
      }
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Return a basic sitemap with just the homepage in case of error
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    return new NextResponse(fallbackSitemap, {
      status: 500,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate'
      }
    });
  }
}