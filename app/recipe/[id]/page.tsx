import { notFound } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase';
import RecipeDetailClient from './RecipeDetailClient';

export const revalidate = 30;

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from('recipes')
    .select('title, category')
    .eq('id', params.id)
    .single();

  if (!data) return { title: "Recipe Not Found | Nancy's Kitchen" };

  return {
    title: `${data.title} | Nancy's Kitchen`,
    description: `A ${data.category} recipe from Nancy Pavlik's handwritten collection.`,
  };
}

export default async function RecipePage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabase();

  // Fetch recipe
  const { data: recipe, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !recipe) notFound();

  // Fetch comments
  const { data: comments } = await supabase
    .from('comments')
    .select('*')
    .eq('recipe_id', params.id)
    .order('created_at', { ascending: false });

  return (
    <RecipeDetailClient
      recipe={recipe}
      comments={comments || []}
    />
  );
}
