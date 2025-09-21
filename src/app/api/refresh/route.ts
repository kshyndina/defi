import { NextResponse } from 'next/server';
import { googleSheetsService } from '@/lib/google/sheets';
import { revalidatePath } from 'next/cache';

const REFRESH_CODE = 'c2xpLSbW0dHgPc6v65Q4';

export async function POST() {
  try {
    // Force a fresh fetch from Google Sheets
    await googleSheetsService.getAllArticles(true); // true = forceRefresh
    
    // Revalidate all relevant paths
    revalidatePath('/');
    revalidatePath('/articles/[slug]', 'page');
    revalidatePath('/categories/[category]', 'page');
    revalidatePath('/api/articles');
    revalidatePath('/api/posts.json');
    revalidatePath('/api/categories');
    
    return NextResponse.json({
      message: 'Articles refreshed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error refreshing articles:', error);
    return NextResponse.json({
      error: 'Failed to refresh articles',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}