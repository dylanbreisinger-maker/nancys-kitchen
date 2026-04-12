import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

// GET /api/recipes/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
  }
  return NextResponse.json(data);
}

// PUT /api/recipes/[id] — update a recipe
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabase();

  try {
    const body = await req.json();
    const {
      title,
      category,
      ingredients,
      instructions,
      servings,
      notes,
    } = body;

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (title !== undefined) updates.title = title;
    if (category !== undefined) updates.category = category;
    if (ingredients !== undefined) updates.ingredients = ingredients;
    if (instructions !== undefined) updates.instructions = instructions;
    if (servings !== undefined) updates.servings = servings;
    if (notes !== undefined) updates.notes = notes;

    const { data, error } = await supabase
      .from('recipes')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// DELETE /api/recipes/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabase();
  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
