import Link from 'next/link';
import { createServerSupabase, Recipe } from '@/lib/supabase';
import RecipeGrid from '@/components/RecipeGrid';

// Revalidate every 60 seconds so new recipes appear quickly
export const revalidate = 60;

async function getRecipesWithStats() {
  const supabase = createServerSupabase();

  // Fetch all recipes
  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !recipes) return [];

  // Fetch aggregate comment stats
  const { data: stats } = await supabase
    .from('comments')
    .select('recipe_id, rating');

  // Build stats map
  const statsMap: Record<string, { total: number; count: number; commentCount: number }> = {};
  if (stats) {
    stats.forEach((s) => {
      if (!statsMap[s.recipe_id]) {
        statsMap[s.recipe_id] = { total: 0, count: 0, commentCount: 0 };
      }
      statsMap[s.recipe_id].commentCount++;
      if (s.rating) {
        statsMap[s.recipe_id].total += s.rating;
        statsMap[s.recipe_id].count++;
      }
    });
  }

  return recipes.map((r: Recipe) => ({
    ...r,
    avg_rating: statsMap[r.id]?.count
      ? statsMap[r.id].total / statsMap[r.id].count
      : undefined,
    comment_count: statsMap[r.id]?.commentCount || 0,
  }));
}

export default async function HomePage() {
  const recipes = await getRecipesWithStats();

  return (
    <div>
      {/* ── Hero tribute section ── */}
      <section className="relative bg-sage overflow-hidden">
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #a8c5a0 1px, transparent 1px),
                              radial-gradient(circle at 75% 75%, #a8c5a0 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Text */}
            <div className="flex-1 text-center md:text-left">
              <p className="handwritten text-orange-warm text-xl sm:text-2xl mb-2 opacity-90">
                Welcome to
              </p>
              <h1 className="serif-heading text-cream text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                Nancy&apos;s Kitchen
              </h1>
              <div className="w-20 h-1 bg-orange rounded-full mb-5 mx-auto md:mx-0" />
              <p className="text-sage-light font-lato text-base sm:text-lg leading-relaxed max-w-lg mx-auto md:mx-0">
                This is a collection of beloved recipes written by hand by{' '}
                <strong className="text-cream">Nancy Pavlik</strong> — a woman
                who filled every home with warmth, every table with food, and
                every heart with love. Nancy always wore green and orange,
                watched cardinals at the feeder, and smiled widest when cooking
                for her husband George and her family.
              </p>
              <p className="text-sage-light/70 font-lato text-sm mt-4 italic max-w-lg mx-auto md:mx-0">
                These recipes are her handwriting, her wisdom, and a little
                piece of her — preserved forever for all of us.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center md:justify-start">
                <a
                  href="#recipes"
                  className="bg-orange hover:bg-orange-warm text-white font-lato font-bold px-7 py-3 rounded-full transition-colors shadow-sm"
                >
                  Browse All Recipes
                </a>
                <Link
                  href="/upload"
                  className="bg-transparent border-2 border-sage-light text-sage-light hover:border-cream hover:text-cream font-lato font-bold px-7 py-3 rounded-full transition-colors"
                >
                  Add a Recipe
                </Link>
              </div>
            </div>

            {/* Stats card */}
            <div className="flex-shrink-0 bg-sage-dark/40 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-sage-light/20 text-center min-w-[200px]">
              <div className="handwritten text-orange-warm text-5xl sm:text-6xl font-bold mb-1">
                {recipes.length}
              </div>
              <div className="serif-heading text-cream text-lg mb-4">
                {recipes.length === 1 ? 'Recipe' : 'Recipes'}
              </div>
              <div className="floral-divider">
                <span className="text-sage-light/60 text-xs font-lato">from Nancy&apos;s collection</span>
              </div>
              <div className="mt-4 space-y-1">
                <div className="text-sage-light/60 text-xs font-lato">Made with</div>
                <div className="text-cream text-sm font-lato">💚 Love &amp; 🧡 Care</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Divider with floral motif ── */}
      <div className="flex items-center gap-4 max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-sage-light to-transparent" />
        <span className="text-sage-light text-xl">🌿</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-sage-light to-transparent" />
      </div>

      {/* ── Recipes section ── */}
      <section id="recipes" className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        {recipes.length === 0 ? (
          /* Empty state — no recipes uploaded yet */
          <div className="text-center py-16 sm:py-24">
            <div className="text-7xl mb-6">📸</div>
            <h2 className="serif-heading text-brown-dark text-3xl font-semibold mb-3">
              Ready for Nancy&apos;s Recipes
            </h2>
            <p className="text-brown-medium font-lato text-base max-w-md mx-auto mb-8 leading-relaxed">
              Upload photos of Nancy&apos;s handwritten recipe cards and our AI will
              read them, transcribe them, and organize them for the whole family.
            </p>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 bg-orange hover:bg-orange-warm text-white font-lato font-bold px-8 py-4 rounded-full transition-colors shadow-sm text-lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              Upload First Recipe
            </Link>
          </div>
        ) : (
          <RecipeGrid recipes={recipes} />
        )}
      </section>
    </div>
  );
}
