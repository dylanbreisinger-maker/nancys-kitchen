const fs = require('fs');
const path = 'app/recipe/[id]/RecipeDetailClient.tsx';
let c = fs.readFileSync(path, 'utf8');

// Add rotating state
c = c.replace(
  '  const [imageLarge, setImageLarge] = useState(false);',
  '  const [imageLarge, setImageLarge] = useState(false);\n  const [rotating, setRotating] = useState(false);'
);

// Add handleRotate function before handleSave
c = c.replace(
  '  async function handleSave',
  `  async function handleRotate(direction: 'left' | 'right') {
    if (!recipe.image_url || rotating) return;
    setRotating(true);
    try {
      const res = await fetch('/api/rotate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId: recipe.id, imageUrl: recipe.image_url, direction }),
      });
      if (!res.ok) throw new Error('Rotate failed');
      const { imageUrl } = await res.json();
      setRecipe((prev) => ({ ...prev, image_url: imageUrl }));
    } catch (e) {
      alert('Could not rotate the image. Please try again.');
    } finally {
      setRotating(false);
    }
  }

  async function handleSave`
);

// Add rotate buttons above the image
c = c.replace(
  `            <p className="text-brown-light font-lato text-xs mb-3 text-center italic">
              Click the image to enlarge
            </p>`,
  `            <div className="flex items-center justify-between mb-3">
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
            </div>`
);

fs.writeFileSync(path, c);
console.log('SUCCESS: Rotate buttons added!');
