import { NextResponse } from 'next/server';
import { googleSheetsService } from '@/lib/google/sheets';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://degennews.com';
  
  try {
    const articles = await googleSheetsService.getAllArticles();
    console.log(`Total articles fetched for sitemap: ${articles.length}`);
    const categories = await fetchCategories();
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/" />
  </url>
  
  <!-- Categories -->
  <url>
    <loc>${baseUrl}/categories</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/categories" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/categories" />
  </url>
  
  <!-- Category Pages -->
  ${categories.map(category => {
    const slug = category.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-');
    return `
  <url>
    <loc>${baseUrl}/categories/${slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/categories/${slug}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/categories/${slug}" />
  </url>`;
  }).join('')}
  
  <!-- Articles -->
  ${articles.map(article => {
    const slug = article.url.split('/').pop();
    return `
  <url>
    <loc>${baseUrl}/articles/${slug}</loc>
    <lastmod>${new Date(article.date || new Date()).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
    <news:news>
      <news:publication>
        <news:name>DUF</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${new Date(article.date || new Date()).toISOString()}</news:publication_date>
      <news:title>${article.title.replace(/&/g, '&amp;')}</news:title>
    </news:news>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/articles/${slug}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/articles/${slug}" />
  </url>`;
  }).join('')}
  
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 's-maxage=86400, stale-while-revalidate'
      }
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><urlset></urlset>', {
      status: 500,
      headers: {
        'Content-Type': 'application/xml'
      }
    });
  }
}

async function fetchCategories(): Promise<string[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/categories`);
    const data = await response.json();
    return data.categories || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}