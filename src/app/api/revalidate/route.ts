import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    // Verify the secret to ensure this is a valid revalidation request
    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json(
        { error: 'Invalid revalidation secret' },
        { status: 401 }
      );
    }

    // Revalidate the home page and all article pages
    revalidatePath('/');
    revalidatePath('/articles/[slug]', 'page');
    revalidatePath('/categories/[category]', 'page');
    
    // Also revalidate API routes
    revalidatePath('/api/articles');
    revalidatePath('/api/posts.json');
    revalidatePath('/api/categories');
    
    console.log('Cache revalidation triggered successfully');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Cache revalidated successfully',
      revalidatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error revalidating cache:', error);
    return NextResponse.json(
      { error: 'Failed to revalidate cache' },
      { status: 500 }
    );
  }
}