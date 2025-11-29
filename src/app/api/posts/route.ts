import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// GET all posts or single post by ID
export async function GET(request: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const status = searchParams.get('status');
  const category = searchParams.get('category');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    if (id) {
      // Get single post with SEO metadata
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          categories(name, slug),
          seo_metadata(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    // Get all posts with filters
    let query = supabase
      .from('posts')
      .select(`
        *,
        categories(name, slug),
        seo_metadata(meta_title, meta_description)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (category) {
      query = query.eq('category_id', category);
    }

    const { data, error, count } = await query;

    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total: count,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error('GET posts error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// CREATE new post
export async function POST(request: NextRequest) {
  const supabase = createServerClient();
  
  try {
    const body = await request.json();
    const {
      title,
      slug,
      content,
      excerpt,
      featured_image,
      category_id,
      status = 'draft',
      post_type = 'ai_assisted',
      seo_score = 0,
      author_name,
      author_email,
      original_source,
      seo_metadata,
    } = body;

    // Validate required fields
    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: title, slug, content' },
        { status: 400 }
      );
    }

    // Check for duplicate slug
    const { data: existingPost } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingPost) {
      return NextResponse.json(
        { error: 'A post with this slug already exists' },
        { status: 409 }
      );
    }

    // Insert post
    const postData = {
      title,
      slug,
      content,
      excerpt,
      featured_image,
      category_id,
      status,
      post_type,
      seo_score,
      author_name,
      author_email,
      original_source,
      published_at: status === 'published' ? new Date().toISOString() : null,
    };

    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert(postData)
      .select()
      .single();

    if (postError) throw postError;

    // Insert SEO metadata if provided
    if (seo_metadata && post) {
      const { error: seoError } = await supabase
        .from('seo_metadata')
        .insert({
          post_id: post.id,
          meta_title: seo_metadata.meta_title,
          meta_description: seo_metadata.meta_description,
          keywords: seo_metadata.keywords,
          schema_markup: seo_metadata.schema_markup,
          canonical_url: `https://ghanainsider.com/de/${slug}`,
        });

      if (seoError) {
        console.error('SEO metadata insert error:', seoError);
      }
    }

    return NextResponse.json({ success: true, data: post }, { status: 201 });
  } catch (error) {
    console.error('POST create error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create post' },
      { status: 500 }
    );
  }
}

// UPDATE post
export async function PUT(request: NextRequest) {
  const supabase = createServerClient();
  
  try {
    const body = await request.json();
    const { id, seo_metadata, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Update published_at if status changes to published
    if (updateData.status === 'published') {
      const { data: currentPost } = await supabase
        .from('posts')
        .select('status, published_at')
        .eq('id', id)
        .single();

      if (currentPost?.status !== 'published' && !currentPost?.published_at) {
        updateData.published_at = new Date().toISOString();
      }
    }

    const { data: post, error: postError } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (postError) throw postError;

    // Update SEO metadata if provided
    if (seo_metadata) {
      const { error: seoError } = await supabase
        .from('seo_metadata')
        .upsert({
          post_id: id,
          ...seo_metadata,
        });

      if (seoError) {
        console.error('SEO metadata update error:', seoError);
      }
    }

    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    console.error('PUT update error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update post' },
      { status: 500 }
    );
  }
}

// DELETE post
export async function DELETE(request: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'Post ID is required' },
      { status: 400 }
    );
  }

  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete post' },
      { status: 500 }
    );
  }
}
