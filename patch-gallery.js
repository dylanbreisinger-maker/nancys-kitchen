const fs = require('fs');
const path = 'app/recipe/[id]/RecipeDetailClient.tsx';
let c = fs.readFileSync(path, 'utf8');

// Replace extraPhotos as string array with objects that track URL
c = c.replace(
  "  const [extraPhotos, setExtraPhotos] = useState<string[]>([]);",
  "  const [extraPhotos, setExtraPhotos] = useState<{url: string; rotating: boolean}[]>([]);\n  const [activePhoto, setActivePhoto] = useState(0);"
);

// Replace handleAddPhoto to use new object format
c = c.replace(
  "      setExtraPhotos(prev => [...prev, data.publicUrl]);",
  "      setExtraPhotos(prev => [...prev, { url: data.publicUrl, rotating: false }]);"
);

// Replace the entire original image view section and extra photos section with unified gallery
c = c.replace(
  `        <div className="bg-warm-white rounded-3xl p-4 shadow-recipe border border-orange-light/50">
            <div className="flex items-center justify-between mb-3">
              <p className="text-brown-light font-lato text-xs italic">Click the image to enlarge</p>
              <div className="flex items-center gap-2">
                <span className="text-brown-light font-lato text-xs">Rotate:</span>
                <button onClick={() => handleRotate('left')} disabled={rotating} className="bg-sage-muted hover:bg-sage text-sage hover:text-white border border-sage-light font-lato text-xs font-semibold px-3 py-1.5 rounded-full transition-all disabled:opacity-50">
                  {rotating ? '…' : '↺ Left'}
                </button>
                <button onClick={() => handleRotate('right')} disabled={rotating} className="bg-sage-muted hover:bg-sage text-sage hover:text-white border border-sage-light font-lato text-xs font-semibold px-3 py-1.5 rounded-full transition-all disabled:opacity-50">
                  {rotating ? '…' : 'Right ↻'}
                </button>
              </div>
            </div>
            <div
              className="relative rounded-2xl overflow-hidden cursor-zoom-in"
              style={{ maxHeight: '70vh' }}
              onClick={() => setImageLarge(true)}
            >
              <Image
                src={recipe.image_url}
                alt={\`Nancy's handwritten recipe for \${recipe.title}\`}
                width={800}
                height={600}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>`,
  `<div className="bg-warm-white rounded-3xl p-4 shadow-recipe border border-orange-light/50">
            {/* All photos in one gallery */}
            {(() => {
              const allPhotos = [
                { url: recipe.image_url!, isMain: true },
                ...extraPhotos.map(p => ({ url: p.url, isMain: false }))
              ];
              const current = allPhotos[activePhoto];
              const isCurrentRotating = activePhoto === 0 ? rotating : extraPhotos[activePhoto - 1]?.rotating;

              async function rotateExtra(idx: number, direction: 'left' | 'right') {
                const photo = extraPhotos[idx];
                if (!photo || photo.rotating) return;
                setExtraPhotos(prev => prev.map((p, i) => i === idx ? { ...p, rotating: true } : p));
                try {
                  const res = await fetch('/api/rotate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ recipeId: recipe.id, imageUrl: photo.url, direction }),
                  });
                  if (!res.ok) throw new Error('failed');
                  const { imageUrl } = await res.json();
                  setExtraPhotos(prev => prev.map((p, i) => i === idx ? { url: imageUrl, rotating: false } : p));
                } catch {
                  setExtraPhotos(prev => prev.map((p, i) => i === idx ? { ...p, rotating: false } : p));
                }
              }

              return (
                <>
                  {/* Top bar */}
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-brown-light font-lato text-xs italic">
                      {allPhotos.length > 1 ? \`Photo \${activePhoto + 1} of \${allPhotos.length} — click to enlarge\` : 'Click to enlarge'}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-brown-light font-lato text-xs">Rotate:</span>
                      <button
                        onClick={() => activePhoto === 0 ? handleRotate('left') : rotateExtra(activePhoto - 1, 'left')}
                        disabled={isCurrentRotating}
                        className="bg-sage-muted hover:bg-sage text-sage hover:text-white border border-sage-light font-lato text-xs font-semibold px-3 py-1.5 rounded-full transition-all disabled:opacity-50"
                      >
                        {isCurrentRotating ? '…' : '↺ Left'}
                      </button>
                      <button
                        onClick={() => activePhoto === 0 ? handleRotate('right') : rotateExtra(activePhoto - 1, 'right')}
                        disabled={isCurrentRotating}
                        className="bg-sage-muted hover:bg-sage text-sage hover:text-white border border-sage-light font-lato text-xs font-semibold px-3 py-1.5 rounded-full transition-all disabled:opacity-50"
                      >
                        {isCurrentRotating ? '…' : 'Right ↻'}
                      </button>
                      <label className="cursor-pointer bg-orange-muted hover:bg-orange text-orange hover:text-white border border-orange-light font-lato text-xs font-semibold px-3 py-1.5 rounded-full transition-all">
                        + Photo
                        <input type="file" accept="image/*" className="hidden" onChange={handleAddPhoto} disabled={addingPhoto} />
                      </label>
                    </div>
                  </div>

                  {/* Main image display */}
                  <div
                    className="relative rounded-2xl overflow-hidden cursor-zoom-in mb-3"
                    style={{ maxHeight: '65vh' }}
                    onClick={() => setImageLarge(true)}
                  >
                    <img
                      src={current.url}
                      alt={\`Recipe card photo \${activePhoto + 1}\`}
                      className="w-full h-auto object-contain"
                    />
                  </div>

                  {/* Thumbnail strip (only shown when multiple photos) */}
                  {allPhotos.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {allPhotos.map((photo, i) => (
                        <button
                          key={i}
                          onClick={() => setActivePhoto(i)}
                          className={\`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all \${activePhoto === i ? 'border-sage shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'}\`}
                        >
                          <img src={photo.url} alt={\`Thumbnail \${i+1}\`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </div>`
);

// Remove the old separate extra photos section
c = c.replace(
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

        `,
  '        '
);

fs.writeFileSync(path, c);
console.log('SUCCESS!');
