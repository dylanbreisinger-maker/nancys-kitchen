'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Recipe, CATEGORIES } from '@/lib/supabase';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3 h-3 ${star <= rating ? 'star-filled' : 'star-empty'}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function RecipeCard({
  recipe,
  avgRating,
  commentCount,
}: {
  recipe: Recipe;
  avgRating?: number;
  commentCount?: number;
}) {
  const category = CATEGORIES.find((c) => c.value === recipe.category);

  return (
    <Link href={`/recipe/${recipe.id}`}>
      <article className="recipe-card bg-warm-white rounded-2xl overflow-hidden shadow-recipe hover:shadow-recipe-hover cursor-pointer border border-orange-light/50">
        {/* Recipe image */}
        <div className="relative h-48 bg-sage-muted overflow-hidden">
          {recipe.image_url ? (
            <Image
              src={recipe.image_url}
              alt={`Handwritten recipe for ${recipe.title}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-40">
              <svg className="w-12 h-12 text-sage" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
              <span className="text-sage text-xs font-lato">Recipe Card</span>
            </div>
          )}
          {/* Category badge overlay */}
          <div className="absolute top-3 left-3">
            <span className="category-badge text-xs">
              {category?.emoji} {category?.label || recipe.category}
            </span>
          </div>
        </div>

        {/* Card content */}
        <div className="p-4">
          <h3 className="serif-heading text-brown-dark font-semibold text-lg leading-snug mb-2 line-clamp-2">
            {recipe.title}
          </h3>

          {/* Preview of recipe */}
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <p className="text-brown-medium text-xs font-lato leading-relaxed line-clamp-2 mb-3">
              {recipe.ingredients.slice(0, 4).join(' · ')}
              {recipe.ingredients.length > 4 ? ` · +${recipe.ingredients.length - 4} more` : ''}
            </p>
          )}

          {/* Footer: rating + comments */}
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-orange-light/60">
            <div className="flex items-center gap-1.5">
              {avgRating ? (
                <>
                  <StarRating rating={Math.round(avgRating)} />
                  <span className="text-brown-light text-xs font-lato">
                    {avgRating.toFixed(1)}
                  </span>
                </>
              ) : (
                <span className="text-brown-light text-xs font-lato italic">No reviews yet</span>
              )}
            </div>

            {commentCount !== undefined && commentCount > 0 && (
              <div className="flex items-center gap-1 text-brown-light">
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-lato">{commentCount}</span>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
