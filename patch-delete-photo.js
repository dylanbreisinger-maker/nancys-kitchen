const fs = require('fs');

// 1. Add delete API route
fs.mkdirSync('app/api/recipes/[id]', { recursive: true });

// 2. Patch the recipe detail client
const path = 'app/recipe/[id]/RecipeDetailClient.tsx';
let c = fs.readFileSync(path, 'utf8');

// Add useRouter import
c = c.replace(
  "'use client';\n\nimport { useState } from 'react';",
  "'use client';\n\nimport { useState } from 'react';\nimport { useRouter } from 'next/navigation';"
);

// Add router and deleting state
c = c.replace(
  '  const [rotating, setRotating] = useState(false);',
  '  const [rotating, setRotating] = useState(false);\n  const [deleting, setDeleting] = useState(false);\n  const [extraPhotos, setExtraPhotos] = useState<string[]>([]);\n  const [addingPhoto, setAddingPhoto] = useState(false);\n  const router = useRouter();'
);

// Add handleDelete and handleAddPhoto functions before handleRotate
c = c.replace(
  '  async function handleRotate',
  `  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this recipe? This cannot be undone.')) return;
    setDeleting(true);
    try {
      const res = await fetch('/api/recipes/' + recipe.id, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      router.push('/');
    } catch (e) {
      alert('Could not delete recipe. Please try again.');
      setDeleting(false);
    }
  }

  async function handleAddPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAddingPhoto(true);
    try {
      const { supabase } = await import('@/lib/supabase');
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = \`recipe-extra-\${Date.now()}.\${ext}\`;
      const { error } = await supabase.storage.from('recipe-images').upload(\`extras/\${fileName}\`, file);
      if (error) throw error;
      const { data } = supabase.storage.from('recipe-images').getPublicUrl(\`extras/\${fileName}\`);
      setExtraPhotos(prev => [...prev, data.publicUrl]);
    } catch (e) {
      alert('Could not upload photo. Please try again.');
    } finally {
      setAddingPhoto(false);
    }
  }

  async function handleRotate`
);

// Add delete button next to edit button
c = c.replace(
  `          <button
            onClick={() => setEditOpen(true)}
            className="flex-shrink-0 flex items-center gap-2 bg-sage-muted hover:bg-sage text-sage hover:text-white border border-sage-light font-lato text-sm font-semibold px-5 py-2.5 rounded-full transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Recipe
          </button>`,
  `          <div className="flex gap-2">
            <button
              onClick={() => setEditOpen(true)}
              className="flex-shrink-0 flex items-center gap-2 bg-sage-muted hover:bg-sage text-sage hover:text-white border border-sage-light font-lato text-sm font-semibold px-5 py-2.5 rounded-full transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Recipe
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-shrink-0 flex items-center gap-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 font-lato text-sm font-semibold px-5 py-2.5 rounded-full transition-all disabled:opacity-50"
            >
              {deleting ? '…' : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Delete
                </>
              )}
            </button>
          </div>`
);

// Add extra photos section after the notes section, before CommentSection
c = c.replace(
  '        {/* Comments section */}\n        <CommentSection',
  `        {/* Extra photos */}
        <div className="mt-6">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="serif-heading text-brown-dark text-lg font-semibold">Additional Photos</h3>
            <label className="cursor-pointer flex items-center gap-1.5 bg-sage-muted hover:bg-sage text-sage hover:text-white border border-sage-light font-lato text-xs font-semibold px-3 py-1.5 rounded-full transition-all">
              {addingPhoto ? '…' : '+ Add Photo'}
              <input type="file" accept="image/*" className="hidden" onChange={handleAddPhoto} disabled={addingPhoto} />
            </label>
          </div>
          {extraPhotos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {extraPhotos.map((url, i) => (
                <div key={i} className="relative h-40 rounded-2xl overflow-hidden border border-orange-light cursor-zoom-in" onClick={() => window.open(url, '_blank')}>
                  <img src={url} alt={\`Extra photo \${i+1}\`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
          {extraPhotos.length === 0 && (
            <p className="text-brown-light font-lato text-sm italic">No extra photos yet — add the back of the recipe card or a photo of the finished dish!</p>
          )}
        </div>

        {/* Comments section */}
        <CommentSection`
);

fs.writeFileSync(path, c);
console.log('SUCCESS!');
