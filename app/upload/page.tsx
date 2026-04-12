'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CATEGORIES, Category, supabase } from '@/lib/supabase';

type AnalysisResult = {
  title: string;
  category: Category;
  ingredients: string[];
  instructions: string;
  servings: string;
  notes: string;
};

type UploadFile = {
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'analyzing' | 'review' | 'saving' | 'done' | 'error';
  result?: AnalysisResult;
  error?: string;
  recipeId?: string;
  // Editable fields
  editTitle?: string;
  editCategory?: Category;
  editIngredients?: string;
  editInstructions?: string;
  editServings?: string;
  editNotes?: string;
};

export default function UploadPage() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Process dropped or selected files
  const addFiles = useCallback((incoming: FileList | File[]) => {
    const arr = Array.from(incoming);
    const valid = arr.filter((f) =>
      f.type === 'image/heic' ||
      f.type === 'image/heif' ||
      f.type.startsWith('image/') ||
      f.name.toLowerCase().endsWith('.heic') ||
      f.name.toLowerCase().endsWith('.heif')
    );

    const newFiles: UploadFile[] = valid.map((f) => ({
      file: f,
      preview: URL.createObjectURL(f),
      status: 'pending',
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) {
      addFiles(e.dataTransfer.files);
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) {
      addFiles(e.target.files);
    }
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  // Upload a single file: upload to Supabase → analyze with Claude → show for review
  async function processFile(index: number) {
    const item = files[index];
    if (!item || item.status !== 'pending') return;

    // Step 1: Upload file to Supabase Storage
    setFiles((prev) =>
      prev.map((f, i) => i === index ? { ...f, status: 'uploading' } : f)
    );

    const ext = item.file.name.split('.').pop() || 'jpg';
    const fileName = `recipe-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('recipe-images')
      .upload(`originals/${fileName}`, item.file);

    if (uploadError) {
      setFiles((prev) =>
        prev.map((f, i) => i === index ? { ...f, status: 'error', error: 'Upload failed. Check your Supabase storage settings.' } : f)
      );
      return;
    }

    const { data: urlData } = supabase.storage
      .from('recipe-images')
      .getPublicUrl(`originals/${fileName}`);
    const imageUrl = urlData.publicUrl;

    // Step 2: Analyze with Claude
    setFiles((prev) =>
      prev.map((f, i) => i === index ? { ...f, status: 'analyzing' } : f)
    );

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, fileName }),
      });

      if (!res.ok) throw new Error('Analysis failed');
      const result: AnalysisResult = await res.json();

      setFiles((prev) =>
        prev.map((f, i) =>
          i === index
            ? {
                ...f,
                status: 'review',
                result,
                editTitle: result.title,
                editCategory: result.category,
                editIngredients: result.ingredients.join('\n'),
                editInstructions: result.instructions,
                editServings: result.servings,
                editNotes: result.notes,
                preview: imageUrl, // use the hosted URL now
              }
            : f
        )
      );
    } catch {
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index
            ? {
                ...f,
                status: 'error',
                error: 'Claude could not read this image. You can still save it and add details manually.',
                result: {
                  title: item.file.name.replace(/\.[^.]+$/, ''),
                  category: 'other',
                  ingredients: [],
                  instructions: '',
                  servings: '',
                  notes: '',
                },
                editTitle: item.file.name.replace(/\.[^.]+$/, ''),
                editCategory: 'other',
                editIngredients: '',
                editInstructions: '',
                editServings: '',
                editNotes: '',
                preview: imageUrl,
              }
            : f
        )
      );
    }
  }

  // Save the reviewed/edited recipe to the database
  async function saveRecipe(index: number) {
    const item = files[index];
    if (!item) return;

    setFiles((prev) =>
      prev.map((f, i) => i === index ? { ...f, status: 'saving' } : f)
    );

    try {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: item.editTitle || 'Untitled Recipe',
          category: item.editCategory || 'other',
          image_url: item.preview,
          ingredients: (item.editIngredients || '')
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
          instructions: item.editInstructions || '',
          servings: item.editServings || '',
          notes: item.editNotes || '',
        }),
      });

      if (!res.ok) throw new Error('Save failed');
      const saved = await res.json();

      setFiles((prev) =>
        prev.map((f, i) => i === index ? { ...f, status: 'done', recipeId: saved.id } : f)
      );
    } catch {
      setFiles((prev) =>
        prev.map((f, i) => i === index ? { ...f, status: 'error', error: 'Failed to save recipe.' } : f)
      );
    }
  }

  function updateField(index: number, field: string, value: string) {
    setFiles((prev) =>
      prev.map((f, i) => i === index ? { ...f, [field]: value } : f)
    );
  }

  const pendingCount = files.filter((f) => f.status === 'pending').length;
  const doneCount = files.filter((f) => f.status === 'done').length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Page header */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sage hover:text-sage-dark font-lato text-sm font-semibold mb-4 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Back to Kitchen
        </Link>
        <div className="handwritten text-orange text-xl mb-1">Add Recipes</div>
        <h1 className="serif-heading text-brown-dark text-3xl sm:text-4xl font-bold mb-3">
          Upload Nancy&apos;s Recipe Cards
        </h1>
        <p className="text-brown-medium font-lato text-sm leading-relaxed max-w-2xl">
          Upload photos of Nancy&apos;s handwritten recipe cards — HEIC files from your iPhone work perfectly.
          Our AI will read her handwriting, transcribe the recipe, and suggest a category. You can
          review and correct everything before saving.
        </p>
      </div>

      {/* Drop zone */}
      <div
        className={`drop-zone rounded-3xl p-10 text-center cursor-pointer transition-all mb-8 ${
          dragOver ? 'drag-over bg-sage-muted' : 'bg-warm-white'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="text-5xl mb-4">📸</div>
        <h2 className="serif-heading text-brown-dark text-xl font-semibold mb-2">
          Drop your recipe photos here
        </h2>
        <p className="text-brown-medium font-lato text-sm mb-4">
          or click to browse files
        </p>
        <p className="text-brown-light font-lato text-xs">
          Supports HEIC (iPhone), JPG, PNG · You can upload multiple at once
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.heic,.heif"
          multiple
          className="hidden"
          onChange={handleFileInput}
        />
      </div>

      {/* Process all pending button */}
      {pendingCount > 0 && (
        <div className="flex items-center justify-between bg-sage-muted rounded-2xl px-6 py-4 mb-6 border border-sage-light">
          <div>
            <p className="font-lato font-semibold text-sage-dark">
              {pendingCount} photo{pendingCount !== 1 ? 's' : ''} ready to process
            </p>
            <p className="font-lato text-xs text-brown-medium">
              Claude will read each recipe card and transcribe it for you
            </p>
          </div>
          <button
            onClick={() => files.forEach((_, i) => processFile(i))}
            className="bg-sage hover:bg-sage-dark text-white font-lato font-bold px-6 py-2.5 rounded-full transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
            </svg>
            Analyze All with AI
          </button>
        </div>
      )}

      {/* Success summary */}
      {doneCount > 0 && (
        <div className="bg-sage-muted border border-sage-light rounded-2xl px-6 py-4 mb-6 flex items-center justify-between">
          <p className="font-lato font-semibold text-sage-dark">
            ✅ {doneCount} recipe{doneCount !== 1 ? 's' : ''} saved to Nancy&apos;s Kitchen!
          </p>
          <Link
            href="/"
            className="text-sage font-lato text-sm font-bold hover:underline"
          >
            View All Recipes →
          </Link>
        </div>
      )}

      {/* File cards */}
      <div className="space-y-6">
        {files.map((item, index) => (
          <div
            key={index}
            className="bg-warm-white rounded-3xl border border-orange-light shadow-recipe overflow-hidden"
          >
            {/* Card header */}
            <div className="flex items-start gap-4 p-5 border-b border-orange-light/60">
              {/* Thumbnail */}
              <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-sage-muted">
                {item.preview ? (
                  <Image
                    src={item.preview}
                    alt="Recipe photo"
                    fill
                    className="object-cover"
                    unoptimized={item.preview.startsWith('blob:')}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">📄</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-lato font-semibold text-brown-dark text-sm truncate">
                  {item.file.name}
                </p>
                <p className="font-lato text-xs text-brown-light">
                  {(item.file.size / 1024 / 1024).toFixed(1)} MB
                </p>

                {/* Status badge */}
                <div className="mt-2">
                  {item.status === 'pending' && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-lato font-semibold text-brown-medium bg-cream px-3 py-1 rounded-full border border-brown-light/30">
                      ⏳ Ready to analyze
                    </span>
                  )}
                  {item.status === 'uploading' && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-lato font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                      <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Uploading photo…
                    </span>
                  )}
                  {item.status === 'analyzing' && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-lato font-semibold text-orange bg-orange-muted px-3 py-1 rounded-full border border-orange-light">
                      <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Claude is reading the handwriting…
                    </span>
                  )}
                  {(item.status === 'review' || item.status === 'error') && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-lato font-semibold text-sage bg-sage-muted px-3 py-1 rounded-full border border-sage-light">
                      ✏️ {item.status === 'error' ? 'Review & fill in manually' : 'Review AI results'}
                    </span>
                  )}
                  {item.status === 'saving' && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-lato font-semibold text-sage bg-sage-muted px-3 py-1 rounded-full border border-sage-light">
                      <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Saving…
                    </span>
                  )}
                  {item.status === 'done' && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-lato font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                      ✅ Saved to Nancy&apos;s Kitchen
                    </span>
                  )}
                </div>

                {/* Error message */}
                {item.status === 'error' && item.error && (
                  <p className="text-red-600 font-lato text-xs mt-1">{item.error}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {item.status === 'pending' && (
                  <button
                    onClick={() => processFile(index)}
                    className="bg-sage text-white font-lato text-xs font-bold px-4 py-2 rounded-full hover:bg-sage-dark transition-colors"
                  >
                    Analyze
                  </button>
                )}
                {item.status === 'done' && item.recipeId && (
                  <Link
                    href={`/recipe/${item.recipeId}`}
                    className="bg-orange text-white font-lato text-xs font-bold px-4 py-2 rounded-full hover:bg-orange-warm transition-colors"
                  >
                    View
                  </Link>
                )}
                {(item.status === 'pending' || item.status === 'error') && (
                  <button
                    onClick={() => removeFile(index)}
                    className="text-brown-light hover:text-brown-dark transition-colors p-1"
                    aria-label="Remove"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Review / edit form (shown after AI analysis) */}
            {(item.status === 'review' || item.status === 'error') && (
              <div className="p-5">
                <p className="font-lato text-xs text-brown-medium mb-4 italic">
                  {item.status === 'error'
                    ? '⚠️ The AI had trouble reading this one. Please fill in the details below.'
                    : '✨ Review what Claude found — you can make any corrections before saving.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {/* Title */}
                  <div>
                    <label className="block font-lato font-semibold text-brown-dark text-xs mb-1">
                      Recipe Title
                    </label>
                    <input
                      value={item.editTitle || ''}
                      onChange={(e) => updateField(index, 'editTitle', e.target.value)}
                      className="w-full px-3 py-2 bg-cream border border-sage-light rounded-lg text-brown-dark font-lato text-sm focus:outline-none focus:ring-2 focus:ring-sage/30"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block font-lato font-semibold text-brown-dark text-xs mb-1">
                      Category
                    </label>
                    <select
                      value={item.editCategory || 'other'}
                      onChange={(e) => updateField(index, 'editCategory', e.target.value)}
                      className="w-full px-3 py-2 bg-cream border border-sage-light rounded-lg text-brown-dark font-lato text-sm focus:outline-none focus:ring-2 focus:ring-sage/30"
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
                    <label className="block font-lato font-semibold text-brown-dark text-xs mb-1">
                      Servings (optional)
                    </label>
                    <input
                      value={item.editServings || ''}
                      onChange={(e) => updateField(index, 'editServings', e.target.value)}
                      placeholder="e.g. Serves 6"
                      className="w-full px-3 py-2 bg-cream border border-sage-light rounded-lg text-brown-dark font-lato text-sm focus:outline-none focus:ring-2 focus:ring-sage/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {/* Ingredients */}
                  <div>
                    <label className="block font-lato font-semibold text-brown-dark text-xs mb-1">
                      Ingredients <span className="font-normal text-brown-light">(one per line)</span>
                    </label>
                    <textarea
                      value={item.editIngredients || ''}
                      onChange={(e) => updateField(index, 'editIngredients', e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 bg-cream border border-sage-light rounded-lg text-brown-dark font-lato text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 resize-y"
                    />
                  </div>

                  {/* Instructions */}
                  <div>
                    <label className="block font-lato font-semibold text-brown-dark text-xs mb-1">
                      Instructions
                    </label>
                    <textarea
                      value={item.editInstructions || ''}
                      onChange={(e) => updateField(index, 'editInstructions', e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 bg-cream border border-sage-light rounded-lg text-brown-dark font-lato text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 resize-y"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="mb-5">
                  <label className="block font-lato font-semibold text-brown-dark text-xs mb-1">
                    Nancy&apos;s Notes (optional)
                  </label>
                  <textarea
                    value={item.editNotes || ''}
                    onChange={(e) => updateField(index, 'editNotes', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-cream border border-sage-light rounded-lg text-brown-dark font-lato text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 resize-y"
                  />
                </div>

                <button
                  onClick={() => saveRecipe(index)}
                  className="w-full sm:w-auto bg-orange hover:bg-orange-warm text-white font-lato font-bold px-8 py-3 rounded-full transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Save to Nancy&apos;s Kitchen
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty state */}
      {files.length === 0 && (
        <div className="text-center py-8 text-brown-light font-lato text-sm">
          <p>Select some photos above to get started ↑</p>
        </div>
      )}
    </div>
  );
}
