'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Recipe, Comment, CATEGORIES } from '@/lib/supabase';
import EditRecipeModal from '@/components/EditRecipeModal';
import CommentSection from '@/components/CommentSection';

export default function RecipeDetailClient({
  recipe: initialRecipe,
  comments,
}: {
  recipe: Recipe;
  comments: Comment[];
}) {
  const [recipe, setRecipe] = useState(initialRecipe);
  const [editOpen, setEditOpen] = useState(false);
  const [view, setView] = useState<'typed' | 'original'>('typed');
  const [imageLarge, setImageLarge] = useState(false);

  const category = CATEGORIES.find((c) => c.value === recipe.category);

  async function handleSave(updates: Partial<Recipe>) {
    const res = await fetch(`/api/recipes/${recipe.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Save failed');
    const updated = await res.json();
    setRecipe(updated);
  }

  return (
    <>
      {/* Edit modal */}
      {editOpen && (
        <EditRecipeModal
          recipe={recipe}
          onClose={() => setEditOpen(false)}
          onSave={handleSave}
        />
      )}

      {/* Image lightbox */}
      {imageLarge && recipe.image_url && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setImageLarge(false)}
        >
          <div className="relative max-w-3xl w-full max-h-[90vh]">
            <Image
              src={recipe.image_url}
              alt="Original handwritten recipe"
              width={900}
              height={700}
              className="rounded-2xl object-contain w-full h-auto"
            />
            <button
              className="absolute top-3 right-3 bg-white/90 rounded-full p-2 text-brown-dark text-sm"
              onClick={() => setImageLarge(false)}
            >
              ✕ Close
            </button>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sage hover:text-sage-dark font-lato text-sm font-semibold mb-6 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Back to All Recipes
        </Link>

        {/* Title + meta row */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6">
          <div className="flex-1">
            <span className="category-badge mb-3 inline-flex">
              {category?.emoji} {category?.label}
            </span>
            <h1 className="serif-heading text-brown-dark text-3xl sm:text-4xl font-bold leading-tight">
              {recipe.title}
            </h1>
            {recipe.servings && (
              <p className="text-brown-medium font-lato text-sm mt-2">
                🍽️ {recipe.servings}
              </p>
            )}
          </div>
          <button
            onClick={() => setEditOpen(true)}
            className="flex-shrink-0 flex items-center gap-2 bg-sage-muted hover:bg-sage text-sage hover:text-white border border-sage-light font-lato text-sm font-semibold px-5 py-2.5 rounded-full transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Recipe
          </button>
        </div>

        {/* View toggle */}
        {recipe.image_url && (
          <div className="flex gap-1 p-1 bg-sage-muted rounded-full w-fit mb-6 border border-sage-light/30">
            <button
              onClick={() => setView('typed')}
              className={`px-5 py-2 rounded-full font-lato text-sm font-semibold transition-all ${
                view === 'typed'
                  ? 'bg-white text-sage shadow-sm'
                  : 'text-brown-medium hover:text-sage'
              }`}
            >
              📝 Typed Recipe
            </button>
            <button
              onClick={() => setView('original')}
              className={`px-5 py-2 rounded-full font-lato text-sm font-semibold transition-all ${
                view === 'original'
                  ? 'bg-white text-sage shadow-sm'
                  : 'text-brown-medium hover:text-sage'
              }`}
            >
              ✍️ Nancy&apos;s Handwriting
            </button>
          </div>
        )}

        {/* Main content area */}
        {view === 'original' && recipe.image_url ? (
          /* Original handwritten image view */
          <div className="bg-warm-white rounded-3xl p-4 shadow-recipe border border-orange-light/50">
            <p className="text-brown-light font-lato text-xs mb-3 text-center italic">
              Click the image to enlarge
            </p>
            <div
              className="relative rounded-2xl overflow-hidden cursor-zoom-in"
              style={{ maxHeight: '70vh' }}
              onClick={() => setImageLarge(true)}
            >
              <Image
                src={recipe.image_url}
                alt={`Nancy's handwritten recipe for ${recipe.title}`}
                width={800}
                height={600}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        ) : (
          /* Typed recipe view */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ingredients column */}
            <div className="bg-warm-white rounded-3xl p-6 shadow-recipe border border-orange-light/50">
              <h2 className="serif-heading text-brown-dark text-xl font-semibold mb-4 flex items-center gap-2">
                <span>🧺</span> Ingredients
              </h2>
              {recipe.ingredients && recipe.ingredients.length > 0 ? (
                <ul className="space-y-2">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange mt-2 flex-shrink-0" />
                      <span className="text-brown-dark font-lato text-sm leading-relaxed">
                        {ing}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-brown-light font-lato text-sm italic">
                  No ingredients listed — click &quot;Edit Recipe&quot; to add them.
                </p>
              )}

              {/* Original image thumbnail (when in typed view) */}
              {recipe.image_url && (
                <div className="mt-6 pt-5 border-t border-orange-light">
                  <p className="text-brown-light font-lato text-xs mb-2">
                    Original card:
                  </p>
                  <div
                    className="relative h-32 rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => { setView('original'); setImageLarge(false); }}
                  >
                    <Image
                      src={recipe.image_url}
                      alt="Nancy's handwriting"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-sage/20 flex items-center justify-center">
                      <span className="text-white font-lato text-xs font-bold bg-sage/70 px-3 py-1 rounded-full">
                        View Handwriting
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Instructions column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-warm-white rounded-3xl p-6 shadow-recipe border border-orange-light/50">
                <h2 className="serif-heading text-brown-dark text-xl font-semibold mb-4 flex items-center gap-2">
                  <span>📋</span> Instructions
                </h2>
                {recipe.instructions ? (
                  <div className="prose prose-sm max-w-none">
                    {recipe.instructions.split('\n').filter(Boolean).map((step, i) => (
                      <p key={i} className="text-brown-dark font-lato text-sm leading-relaxed mb-3">
                        {step}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-brown-light font-lato text-sm italic">
                    No instructions yet — click &quot;Edit Recipe&quot; to add them.
                  </p>
                )}
              </div>

              {/* Nancy's notes */}
              {recipe.notes && (
                <div className="bg-orange-muted rounded-3xl p-6 border border-orange-light shadow-recipe">
                  <h2 className="handwritten text-orange text-xl mb-3">
                    ✍️ A Note from Nancy
                  </h2>
                  <p className="text-brown-medium font-lato text-sm leading-relaxed italic">
                    &ldquo;{recipe.notes}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Comments section */}
        <CommentSection recipeId={recipe.id} initialComments={comments} />
      </div>
    </>
  );
}
