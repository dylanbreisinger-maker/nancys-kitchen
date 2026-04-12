import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Allow up to 60 seconds for Claude to analyze the image
export const maxDuration = 60;

const VALID_CATEGORIES = [
  'chicken', 'beef', 'pork', 'fish', 'pasta', 'soup',
  'salad', 'vegetarian', 'dessert', 'bread', 'drink',
  'breakfast', 'appetizer', 'other',
] as const;

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 });
    }

    // Fetch the image from Supabase storage and convert to base64
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) {
      return NextResponse.json({ error: 'Could not fetch image' }, { status: 400 });
    }

    const imageBuffer = await imageRes.arrayBuffer();
    let imageBase64 = Buffer.from(imageBuffer).toString('base64');
    let mediaType: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg';

    // Handle HEIC files — we need to convert to JPEG for Claude
    const isHeic =
      imageUrl.toLowerCase().includes('.heic') ||
      imageUrl.toLowerCase().includes('.heif');

    if (isHeic) {
      try {
        // Dynamic import to avoid issues with build
        const heicConvert = (await import('heic-convert')).default;
        const outputBuffer = await heicConvert({
          buffer: Buffer.from(imageBuffer),
          format: 'JPEG',
          quality: 0.9,
        });
        imageBase64 = outputBuffer.toString('base64');
        mediaType = 'image/jpeg';
      } catch (convertError) {
        console.error('HEIC conversion failed, trying raw:', convertError);
        // Try sending as-is — Claude may handle it
      }
    } else if (imageUrl.toLowerCase().includes('.png')) {
      mediaType = 'image/png';
    } else if (imageUrl.toLowerCase().includes('.webp')) {
      mediaType = 'image/webp';
    }

    // Ask Claude to analyze the recipe card
    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: `This is a handwritten recipe card from a home cook named Nancy Pavlik.
Please carefully read her handwriting and extract the recipe information.

Return ONLY a valid JSON object with exactly these fields (no other text, no markdown):
{
  "title": "the recipe name",
  "category": "one of exactly: chicken, beef, pork, fish, pasta, soup, salad, vegetarian, dessert, bread, drink, breakfast, appetizer, other",
  "ingredients": ["ingredient 1", "ingredient 2", "..."],
  "instructions": "the full cooking instructions as a single string, with line breaks between steps",
  "servings": "serving size if mentioned, or empty string",
  "notes": "any extra tips, notes, or comments Nancy wrote, or empty string"
}

Guidelines:
- If you cannot read a word clearly, write [illegible] as a placeholder
- Choose the most appropriate single category based on the main ingredient or dish type
- Keep Nancy's voice and phrasing in the instructions — don't rewrite them
- If there is no recipe visible (blank, unreadable, not a recipe), set title to "Unreadable Recipe" and all other fields to empty strings or empty arrays`,
            },
          ],
        },
      ],
    });

    // Extract the text content
    const rawText = message.content
      .filter((c) => c.type === 'text')
      .map((c) => (c as { type: 'text'; text: string }).text)
      .join('');

    // Parse the JSON — handle cases where Claude adds extra text
    let result;
    try {
      // Try to extract JSON from the response
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');
      result = JSON.parse(jsonMatch[0]);
    } catch {
      // Fallback if parsing fails
      result = {
        title: 'Recipe Card',
        category: 'other',
        ingredients: [],
        instructions: rawText,
        servings: '',
        notes: '',
      };
    }

    // Validate and sanitize the category
    if (!VALID_CATEGORIES.includes(result.category)) {
      result.category = 'other';
    }

    // Ensure ingredients is an array
    if (!Array.isArray(result.ingredients)) {
      result.ingredients = result.ingredients
        ? String(result.ingredients).split('\n').filter(Boolean)
        : [];
    }

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
    return NextResponse.json(
      { error: 'Analysis failed', details: String(error) },
      { status: 500 }
    );
  }
}
