import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase client (uses anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client (uses service key for full access)
export function createServerSupabase() {
  return createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { persistSession: false } }
  );
}

// Types
export type Category =
  | 'chicken'
  | 'beef'
  | 'pork'
  | 'fish'
  | 'pasta'
  | 'soup'
  | 'salad'
  | 'vegetarian'
  | 'dessert'
  | 'bread'
  | 'drink'
  | 'breakfast'
  | 'appetizer'
  | 'other';

export type Recipe = {
  id: string;
  title: string;
  category: Category;
  image_url: string | null;
  transcribed_text: string | null;
  ingredients: string[] | null;
  instructions: string | null;
  servings: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Comment = {
  id: string;
  recipe_id: string;
  author_name: string;
  comment_text: string;
  photo_url: string | null;
  rating: number | null;
  created_at: string;
};

export const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: 'chicken', label: 'Chicken', emoji: '🍗' },
  { value: 'beef', label: 'Beef', emoji: '🥩' },
  { value: 'pork', label: 'Pork', emoji: '🐷' },
  { value: 'fish', label: 'Fish', emoji: '🐟' },
  { value: 'pasta', label: 'Pasta', emoji: '🍝' },
  { value: 'soup', label: 'Soup', emoji: '🍲' },
  { value: 'salad', label: 'Salad', emoji: '🥗' },
  { value: 'vegetarian', label: 'Vegetarian', emoji: '🥦' },
  { value: 'dessert', label: 'Dessert', emoji: '🍰' },
  { value: 'bread', label: 'Bread', emoji: '🍞' },
  { value: 'drink', label: 'Drinks', emoji: '🥤' },
  { value: 'breakfast', label: 'Breakfast', emoji: '🍳' },
  { value: 'appetizer', label: 'Appetizers', emoji: '🥨' },
  { value: 'other', label: 'Other', emoji: '✨' },
];
