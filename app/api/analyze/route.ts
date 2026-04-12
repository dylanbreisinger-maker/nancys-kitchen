import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import sharp from 'sharp';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
export const maxDuration = 60;

const VALID_CATEGORIES = ['chicken','beef','pork','fish','pasta','soup','salad','vegetarian','dessert','bread','drink','breakfast','appetizer','other'] as const;

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();
    if (!imageUrl) return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 });

    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) return NextResponse.json({ error: 'Could not fetch image' }, { status: 400 });

    const imageBuffer = Buffer.from(await imageRes.arrayBuffer());
    let imageBase64: string;
    const mediaType: 'image/jpeg' = 'image/jpeg';

    try {
      const jpegBuffer = await sharp(imageBuffer)
        .rotate()
        .resize({ width: 2000, withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
      imageBase64 = jpegBuffer.toString('base64');
    } catch (sharpError) {
      console.error('Sharp conversion failed:', sharpError);
      imageBase64 = imageBuffer.toString('base64');
    }

    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } },
          { type: 'text', text: `This is a handwritten recipe card from a home cook named Nancy Pavlik. Please carefully read her handwriting and extract the recipe information.\n\nReturn ONLY a valid JSON object with exactly these fields (no other text, no markdown):\n{\n  "title": "the recipe name",\n  "category": "one of exactly: chicken, beef, pork, fish, pasta, soup, salad, vegetarian, dessert, bread, drink, breakfast, appetizer, other",\n  "ingredients": ["ingredient 1", "ingredient 2", "..."],\n  "instructions": "the full cooking instructions as a single string, with line breaks between steps",\n  "servings": "serving size if mentioned, or empty string",\n  "notes": "any extra tips, notes, or comments Nancy wrote, or empty string"\n}\n\nIf you cannot read a word clearly, write [illegible]. Keep Nancy's voice and phrasing.` }
        ]
      }]
    });

    const rawText = message.content.filter((c) => c.type === 'text').map((c) => (c as {type:'text';text:string}).text).join('');

    let result;
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');
      result = JSON.parse(jsonMatch[0]);
    } catch {
      result = { title: 'Recipe Card', category: 'other', ingredients: [], instructions: rawText, servings: '', notes: '' };
    }

    if (!VALID_CATEGORIES.includes(result.category)) result.category = 'other';
    if (!Array.isArray(result.ingredients)) result.ingredients = result.ingredients ? String(result.ingredients).split('\n').filter(Boolean) : [];

    return NextResponse.json({
      title: result.title || 'Untitled Recipe',
      category: result.category,
      ingredients: result.ingredients,
      instructions: result.instructions || '',
      servings: result.servings || '',
      notes: result.notes || '',
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Analysis failed', details: String(error) }, { status: 500 });
  }
}
