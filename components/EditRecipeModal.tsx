'use client';

import { useState } from 'react';
import { Recipe, CATEGORIES, Category } from '@/lib/supabase';

export default function EditRecipeModal({
  recipe,
  onClose,
  onSave,
}: {
  recipe: Recipe;
  onClose: () => void;
  onSave: (updated: Partial<Recipe>) => Promise<void>;
}) {
  const [title, setTitle] = useState(recipe.title);
  const [category, setCategory] = useState<Category>(recipe.category);
  const [ingredients, setIngredients] = useState(
    (recipe.ingredients || []).join('\n')
  );
  const [instructions, setInstructions] = useState(recipe.instructions || '');
  const [servings, setServings] = useState(recipe.servings || '');
  const [notes, setNotes] = useState(recipe.notes || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    if (!title.trim()) {
      setError('Please enter a recipe title.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave({
        title: title.trim(),
        category,
        ingredients: ingredients
          .split('\n')
          .map((i) => i.trim())
          .filter(Boolean),
        instructions: instructions.trim(),
        servings: servings.trim(),
        notes: notes.trim(),
      });
      onClose();
    } catch {
      setError('Could not save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brown-dark/60 backdrop-blur-sm">
      <div className="bg-warm-white rounded-3xl shadow-recipe-hover w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-sage px-6 py-5 rounded-t-3xl flex items-center justify-between">
          <div>
            <div className="handwritten text-orange-warm text-lg">Edit Recipe</div>
            <h2 className="serif-heading text-cream text-xl font-semibold">
              Make corrections if needed
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-sage-light hover:text-cream transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-lato">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-brown-dark font-lato font-semibold text-sm mb-1.5">
              Recipe Title *
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-cream border border-sage-light rounded-xl text-brown-dark font-lato text-sm focus:outline-none focus:ring-2 focus:ring-sage/30"
              placeholder="e.g. Grandma's Apple Pie"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-brown-dark font-lato font-semibold text-sm mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full px-4 py-2.5 bg-cream border border-sage-light rounded-xl text-brown-dark font-lato text-sm focus:outline-none focus:ring-2 focus:ring-sage/30"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.emoji} {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Servings */}
          <div>
            <label className="block text-brown-dark font-lato font-semibold text-sm mb-1.5">
              Servings (optional)
            </label>
            <input
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              className="w-full px-4 py-2.5 bg-cream border border-sage-light rounded-xl text-brown-dark font-lato text-sm focus:outline-none focus:ring-2 focus:ring-sage/30"
              placeholder="e.g. Serves 6-8"
            />
          </div>

          {/* Ingredients */}
          <div>
            <label className="block text-brown-dark font-lato font-semibold text-sm mb-1.5">
              Ingredients
              <span className="text-brown-light font-normal ml-1">(one per line)</span>
            </label>
            <textarea
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              rows={8}
              className="w-full px-4 py-2.5 bg-cream border border-sage-light rounded-xl text-brown-dark font-lato text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 resize-y"
              placeholder={"2 cups flour\n1 cup sugar\n3 eggs\n..."}
            />
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-brown-dark font-lato font-semibold text-sm mb-1.5">
              Instructions
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={8}
              className="w-full px-4 py-2.5 bg-cream border border-sage-light rounded-xl text-brown-dark font-lato text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 resize-y"
              placeholder="Step 1: Preheat oven to 350°F..."
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-brown-dark font-lato font-semibold text-sm mb-1.5">
              Nancy&apos;s Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 bg-cream border border-sage-light rounded-xl text-brown-dark font-lato text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 resize-y"
              placeholder="Any extra tips, variations, or notes..."
            />
          </div>
        </div>

        {/* Footer buttons */}
        <div className="px-6 py-4 border-t border-orange-light flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-2.5 text-brown-medium hover:text-brown-dark font-lato font-semibold text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-sage hover:bg-sage-dark text-white font-lato font-bold text-sm rounded-full transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            {saving ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving…
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
