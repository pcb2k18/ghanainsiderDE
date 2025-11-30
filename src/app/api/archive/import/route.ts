import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
import { importFromArchive } from '@/lib/ai/formatter';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  const supabase = createServerClient();
  let importRecordId: string | null = null;

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

    // Check if this archive URL has been imported before
    const { data: previousImports } = await supabase
      .from('archive_imports')
      .select('id, post_id, import_status')
      .eq('archive_url', archiveUrl)
      .order('created_at', { ascending: false })
      .limit(1);

    const previousImport = previousImports?.[0];

    // If previously imported, check if the post still exists
    if (previousImport?.post_id) {
      const { data: existingPost } = await supabase
        .from('posts')
        .select('id, title, slug, status')
        .eq('id', previousImport.post_id)
        .single();

      if (existingPost) {
        // Post still exists - don't re-import
        return NextResponse.json({
          success: false,
          message: `This archive URL was already imported as: "${existingPost.title}" (${existingPost.slug})`,
          existing_post: existingPost,
        }, { status: 409 }); // 409 Conflict
      }
      // Post was deleted - allow re-import
    }

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
    importRecordId = importRecord?.id || null;

    // Fetch content from archive.org
    const response = await fetch(archiveUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch archive: ${response.status}`);
    }

    const htmlContent = await response.text();

    // Process with scraper (NO AI - saves costs!)
    const extractedContent = await importFromArchive(htmlContent, originalUrl);

    // Check if post with this slug already exists (from a different archive URL)
    const { data: existingPost } = await supabase
      .from('posts')
      .select('id, title, slug, status')
      .eq('slug', extractedContent.slug)
      .single();

    if (existingPost) {
      // Post with this slug exists from a different source - mark as failed
      await supabase
        .from('archive_imports')
        .update({
          import_status: 'failed' as const,
          error_message: 'Post with this slug already exists from a different source',
        })
        .eq('id', importRecord.id);

      return NextResponse.json({
        success: false,
        message: `A post with the slug "${extractedContent.slug}" already exists: "${existingPost.title}"`,
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
        featured_image: extractedContent.featured_image,
        category_id: category?.id || null,
        status: 'published' as const,
        post_type: 'ai_assisted' as const,
        original_source: archiveUrl,
        published_at: new Date().toISOString(), // Set current date for published imports
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

      // Revalidate paths to show new post
      revalidatePath('/de');
      revalidatePath('/de', 'page');
      revalidatePath('/sitemap.xml');
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

    // If we have an import record, mark it as failed
    if (error instanceof Error && importRecordId) {
      try {
        await supabase
          .from('archive_imports')
          .update({
            import_status: 'failed' as const,
            error_message: error.message,
          })
          .eq('id', importRecordId);
      } catch (updateError) {
        console.error('Failed to update import record:', updateError);
      }
    }

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
