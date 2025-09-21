import { NextRequest, NextResponse } from 'next/server';
import { googleSheetsService } from '@/lib/google/sheets';

export async function GET(request: NextRequest) {
  try {
    const articles = await googleSheetsService.getAllArticles();
    
    // Get unique categories
    const categories = [...new Set(articles.map(article => article.category))];
    
    // Add cache control headers for 24-hour caching
    const response = NextResponse.json({ categories });
    response.headers.set('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    response.headers.set('CDN-Cache-Control', 's-maxage=86400');
    
    return response;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}