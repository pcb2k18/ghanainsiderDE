import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
import { importFromArchive } from '@/lib/ai/formatter';

export async function POST(request: NextRequest) {
  const supabase = createServerClient();

  try {
    const body = await request.json();
    const { archiveUrl } = body;

    if (!archiveUrl) {
      return NextResponse.json(
        { error: 'Archive URL is required' },
        { status: 400 }
      );
    }

    // Validate archive.org URL format
    const archiveMatch = archiveUrl.match(
      /web\.archive\.org\/web\/\d+\/(https?:\/\/.+)/
    );
    
    if (!archiveMatch) {
      return NextResponse.json(
        { error: 'Invalid archive.org URL format' },
        { status: 400 }
      );
    }

    const originalUrl = archiveMatch[1];

    // Create import record
    const { data: importRecord, error: importError } = await supabase
      .from('archive_imports')
      .insert({
        archive_url: archiveUrl,
        original_url: originalUrl,
        import_status: 'processing' as const,
      })
      .select()
      .single();

    if (importError) throw importError;

    // Fetch content from archive.org
    const response = await fetch(archiveUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch archive: ${response.status}`);
    }

    const htmlContent = await response.text();

    // Process with scraper (NO AI - saves costs!)
    const extractedContent = await importFromArchive(htmlContent, originalUrl);

    // Check if post with this slug already exists
    const { data: existingPost } = await supabase
      .from('posts')
      .select('id, title, slug, status')
      .eq('slug', extractedContent.slug)
      .single();

    if (existingPost) {
      // Post already exists - update import record and return
      await supabase
        .from('archive_imports')
        .update({
          import_status: 'skipped' as const,
          post_id: existingPost.id,
          error_message: 'Post with this slug already exists',
        })
        .eq('id', importRecord.id);

      return NextResponse.json({
        success: false,
        message: `Post already exists: "${existingPost.title}" (${existingPost.slug})`,
        existing_post: existingPost,
      }, { status: 409 }); // 409 Conflict
    }

    // Get category ID
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', extractedContent.category_slug)
      .single();

    // Create post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        title: extractedContent.title,
        slug: extractedContent.slug,
        content: extractedContent.content,
        excerpt: extractedContent.excerpt,
        category_id: category?.id || null,
        status: 'draft' as const,
        post_type: 'ai_assisted' as const,
        original_source: archiveUrl,
        published_at: extractedContent.published_at,
      })
      .select()
      .single();

    if (postError) throw postError;

    // Create SEO metadata
    if (post) {
      await supabase.from('seo_metadata').insert({
        post_id: post.id,
        meta_title: extractedContent.meta_title,
        meta_description: extractedContent.meta_description,
        keywords: extractedContent.keywords,
        canonical_url: `https://ghanainsider.com/de/${extractedContent.slug}`,
      });

      // Update import record
      await supabase
        .from('archive_imports')
        .update({
          import_status: 'completed' as const,
          post_id: post.id,
        })
        .eq('id', importRecord.id);
    }

    return NextResponse.json({
      success: true,
      data: {
        import_id: importRecord.id,
        post,
        extracted: extractedContent,
      },
    });
  } catch (error) {
    console.error('Archive import error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to import from archive' },
      { status: 500 }
    );
  }
}

// GET import history
export async function GET(request: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  try {
    let query = supabase
      .from('archive_imports')
      .select(`
        *,
        posts(title, slug, status)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (status) {
      query = query.eq('import_status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('GET imports error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch imports' },
      { status: 500 }
    );
  }
}
