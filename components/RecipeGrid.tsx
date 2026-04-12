'use client';

import { useState, useMemo } from 'react';
import RecipeCard from '@/components/RecipeCard';
import { Recipe, CATEGORIES, Category } from '@/lib/supabase';

type RecipeWithStats = Recipe & {
  avg_rating?: number;
  comment_count?: number;
};

export default function RecipeGrid({
  recipes,
}: {
  recipes: RecipeWithStats[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    return recipes.filter((r) => {
      const matchesCategory =
        selectedCategory === 'all' || r.category === selectedCategory;
      const matchesSearch =
        searchQuery === '' ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.ingredients &&
          r.ingredients.some((ing) =>
            ing.toLowerCase().includes(searchQuery.toLowerCase())
          ));
      return matchesCategory && matchesSearch;
    });
  }, [recipes, selectedCategory, searchQuery]);

  // Count recipes per category for badge numbers
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: recipes.length };
    recipes.forEach((r) => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });
    return counts;
  }, [recipes]);

  return (
    <div>
      {/* Search bar */}
      <div className="mb-6">
        <div className="relative max-w-md mx-auto">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sage"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="8" cy="8" r="5" />
            <path d="M18 18l-4-4" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search recipes or ingredients…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-warm-white border border-sage-light rounded-full text-brown-dark placeholder-brown-light font-lato text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-brown-light hover:text-brown-dark"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full text-sm font-lato font-semibold transition-all border ${
            selectedCategory === 'all'
              ? 'bg-sage text-white border-sage shadow-sm'
              : 'bg-warm-white text-brown-medium border-sage-light hover:border-sage hover:text-sage'
          }`}
        >
          ✨ All Recipes
          <span className="ml-1.5 text-xs opacity-70">({categoryCounts.all || 0})</span>
        </button>
        {CATEGORIES.map((cat) => {
          const count = categoryCounts[cat.value] || 0;
          if (count === 0) return null;
          return (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-full text-sm font-lato font-semibold transition-all border ${
                selectedCategory === cat.value
                  ? 'bg-sage text-white border-sage shadow-sm'
                  : 'bg-warm-white text-brown-medium border-sage-light hover:border-sage hover:text-sage'
              }`}
            >
              {cat.emoji} {cat.label}
              <span className="ml-1.5 text-xs opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Recipe grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((recipe) => (
            <div key={recipe.id} className="fade-in">
              <RecipeCard
                recipe={recipe}
                avgRating={recipe.avg_rating}
                commentCount={recipe.comment_count}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🍽️</div>
          <p className="serif-heading text-brown-medium text-xl mb-2">No recipes found</p>
          <p className="text-brown-light font-lato text-sm">
            {searchQuery
              ? `No results for "${searchQuery}" — try a different search`
              : 'No recipes in this category yet'}
          </p>
        </div>
      )}
    </div>
  );
}
