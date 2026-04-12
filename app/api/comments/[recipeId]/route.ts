import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

// GET /api/comments/[recipeId] — fetch all comments for a recipe
export async function GET(
  _req: NextRequest,
  { params }: { params: { recipeId: string } }
) {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('recipe_id', params.recipeId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data || []);
}

// POST /api/comments/[recipeId] — add a new comment
export async function POST(
  req: NextRequest,
  { params }: { params: { recipeId: string } }
) {
  const supabase = createServerSupabase();

  try {
    const body = await req.json();
    const { author_name, comment_text, rating, photo_url } = body;

    if (!author_name?.trim()) {
      return NextResponse.json({ error: 'Author name is required' }, { status: 400 });
    }
    if (!comment_text?.trim()) {
      return NextResponse.json({ error: 'Comment text is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          recipe_id: params.recipeId,
          author_name: author_name.trim(),
          comment_text: comment_text.trim(),
          rating: rating || null,
          photo_url: photo_url || null,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
