import { NextResponse } from 'next/server';
import { googleSheetsService } from '@/lib/google/sheets';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://degennews.com';
  
  try {
    const articles = await googleSheetsService.getAllArticles();
    // Include all articles in the JSON feed, not just a limited number
    const latestArticles = articles;
    
    const posts = latestArticles.map(article => {
      const slug = article.url.split('/').pop();
      const articleUrl = `${baseUrl}/articles/${slug}`;
      
      return {
        id: article.id,
        title: article.title,
        description: article.preview,
        content: article.content,
        url: articleUrl,
        category: article.category,
        tags: article.tags,
        publishedAt: article.date,
        updatedAt: article.date,
        author: {
          name: 'DUF',
          url: baseUrl
        },
        images: [
          {
            url: `${baseUrl}/api/og?title=${encodeURIComponent(article.title)}`,
            title: article.title,
            width: 1200,
            height: 630
          }
        ],
        // Additional metadata for AI/LLM consumption
        summary: article.preview,
        keywords: article.tags.join(', '),
        readingTime: Math.ceil(article.content.length / 200), // Rough estimate
        wordCount: article.content.length,
        language: 'en',
        // AI-friendly metadata
        aiContext: {
          topic: article.category,
          focus: article.tags.slice(0, 3).join(', '),
          audience: 'crypto traders, security researchers, degens',
          type: 'educational content, news analysis'
        }
      };
    });

    return NextResponse.json({
      posts,
      metadata: {
        total: posts.length,
        generatedAt: new Date().toISOString(),
        feedUrl: `${baseUrl}/api/posts.json`,
        rssUrl: `${baseUrl}/rss.xml`,
        sitemapUrl: `${baseUrl}/sitemap.xml`,
        siteInfo: {
          name: 'DUF',
          description: 'Latest crypto security news, trading insights, whale watching strategies, and market analysis for degens.',
          url: baseUrl,
          language: 'en',
          lastUpdated: new Date().toISOString()
        }
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=1800, stale-while-revalidate',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (error) {
    console.error('Error generating JSON feed:', error);
    return NextResponse.json(
      { error: 'Failed to generate posts feed' },
      { status: 500 }
    );
  }
}