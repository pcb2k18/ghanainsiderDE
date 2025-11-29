import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// GET all authors
export async function GET(request: NextRequest) {
  const supabase = createServerClient();

  try {
    const { data, error } = await supabase
      .from('authors')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('GET authors error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch authors' },
      { status: 500 }
    );
  }
}

// POST create new author
export async function POST(request: NextRequest) {
  const supabase = createServerClient();

  try {
    const body = await request.json();
    const { name, email, bio, avatar_url, is_default } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // If setting as default, unset other defaults first
    if (is_default) {
      await supabase
        .from('authors')
        .update({ is_default: false })
        .eq('is_default', true);
    }

    const { data, error } = await supabase
      .from('authors')
      .insert({
        name,
        email,
        bio,
        avatar_url,
        is_default: is_default || false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('POST author error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create author' },
      { status: 500 }
    );
  }
}

// PUT update author
export async function PUT(request: NextRequest) {
  const supabase = createServerClient();

  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Author ID is required' },
        { status: 400 }
      );
    }

    // If setting as default, unset other defaults first
    if (updateData.is_default) {
      await supabase
        .from('authors')
        .update({ is_default: false })
        .eq('is_default', true)
        .neq('id', id);
    }

    const { data, error } = await supabase
      .from('authors')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('PUT author error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update author' },
      { status: 500 }
    );
  }
}

// DELETE author
export async function DELETE(request: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'Author ID is required' },
      { status: 400 }
    );
  }

  try {
    // Check if author is default
    const { data: author } = await supabase
      .from('authors')
      .select('is_default')
      .eq('id', id)
      .single();

    if (author?.is_default) {
      return NextResponse.json(
        { error: 'Cannot delete default author' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('authors')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Author deleted' });
  } catch (error) {
    console.error('DELETE author error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete author' },
      { status: 500 }
    );
  }
}
