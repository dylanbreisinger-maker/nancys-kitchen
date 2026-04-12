import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

// GET /api/recipes — fetch all recipes
export async function GET() {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// POST /api/recipes — create a new recipe
export async function POST(req: NextRequest) {
  const supabase = createServerSupabase();

  try {
    const body = await req.json();
    const {
      title,
      category,
      image_url,
      ingredients,
      instructions,
      servings,
      notes,
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('recipes')
      .insert([
        {
          title: title.trim(),
          category: category || 'other',
          image_url: image_url || null,
          ingredients: Array.isArray(ingredients) ? ingredients : [],
          instructions: instructions || null,
          servings: servings || null,
          notes: notes || null,
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
