import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import sharp from 'sharp';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { recipeId, imageUrl, direction } = await req.json();
    if (!recipeId || !imageUrl) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const imageRes = await fetch(imageUrl.split('?')[0]);
    if (!imageRes.ok) return NextResponse.json({ error: 'Could not fetch image' }, { status: 400 });

    const imageBuffer = Buffer.from(await imageRes.arrayBuffer());
    const degrees = direction === 'left' ? 270 : 90;
    const rotatedBuffer = await sharp(imageBuffer).rotate(degrees).jpeg({ quality: 90 }).toBuffer();

    const urlParts = imageUrl.split('/recipe-images/');
    if (urlParts.length < 2) return NextResponse.json({ error: 'Bad image URL' }, { status: 400 });
    const filePath = urlParts[1].split('?')[0];

    const supabase = createServerSupabase();
    const { error: uploadError } = await supabase.storage.from('recipe-images').update(filePath, rotatedBuffer, { contentType: 'image/jpeg', upsert: true });
    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

    const newUrl = `${imageUrl.split('?')[0]}?t=${Date.now()}`;
    await supabase.from('recipes').update({ image_url: newUrl, updated_at: new Date().toISOString() }).eq('id', recipeId);

    return NextResponse.json({ imageUrl: newUrl });
  } catch (error) {
    console.error('Rotate error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
