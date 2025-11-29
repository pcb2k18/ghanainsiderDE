import { NextRequest, NextResponse } from 'next/server';
import { formatContentWithAI, calculateSeoScore } from '@/lib/ai/formatter';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rawContent, categorySlug } = body;

    if (!rawContent || !categorySlug) {
      return NextResponse.json(
        { error: 'Missing required fields: rawContent, categorySlug' },
        { status: 400 }
      );
    }

    // Format content using AI
    const formattedContent = await formatContentWithAI({
      rawContent,
      categorySlug,
    });

    // Calculate SEO score
    const seoResult = calculateSeoScore(formattedContent);
    formattedContent.seo_score = seoResult.score;

    return NextResponse.json({
      success: true,
      data: formattedContent,
      seo_checks: seoResult.checks,
    });
  } catch (error) {
    console.error('Format API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to format content' },
      { status: 500 }
    );
  }
}
