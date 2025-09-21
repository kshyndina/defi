import { NextRequest, NextResponse } from 'next/server';
import { googleSheetsService } from '@/lib/google/sheets';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const url = searchParams.get('url');

    let articles;
    if (url) {
      // Single article request
      const article = await googleSheetsService.getArticleByUrl(url);
      return NextResponse.json({ article });
    } else if (category) {
      // Category filter
      articles = await googleSheetsService.getArticlesByCategory(category);
    } else {
      // All articles
      articles = await googleSheetsService.getAllArticles();
    }

    // Add cache control headers for 24-hour caching
    const response = NextResponse.json({ articles });
    response.headers.set('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    response.headers.set('CDN-Cache-Control', 's-maxage=86400');
    
    return response;
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}