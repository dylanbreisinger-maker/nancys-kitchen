import Link from 'next/link';

function HummingbirdSVG({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 80"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Hummingbird"
    >
      {/* Wings (slightly transparent, showing motion blur) */}
      <ellipse cx="38" cy="35" rx="18" ry="7" fill="#a8c5a0" opacity="0.5" transform="rotate(-20 38 35)" />
      <ellipse cx="38" cy="35" rx="18" ry="7" fill="#a8c5a0" opacity="0.3" transform="rotate(-30 38 35)" />
      <ellipse cx="38" cy="42" rx="16" ry="6" fill="#a8c5a0" opacity="0.4" transform="rotate(20 38 42)" />
      {/* Body */}
      <ellipse cx="45" cy="40" rx="14" ry="7" fill="#4a6741" />
      {/* Belly (lighter) */}
      <ellipse cx="45" cy="42" rx="10" ry="5" fill="#7aad70" opacity="0.6" />
      {/* Tail */}
      <path d="M32 42 L20 48 L32 45 L22 52 L33 47" fill="#2d4a2d" />
      {/* Head */}
      <circle cx="58" cy="36" r="7" fill="#4a6741" />
      {/* Iridescent throat */}
      <ellipse cx="58" cy="40" rx="5" ry="4" fill="#c96b2a" opacity="0.8" />
      {/* Eye */}
      <circle cx="61" cy="34" r="2" fill="#1a0f08" />
      <circle cx="61.7" cy="33.3" r="0.6" fill="white" />
      {/* Long beak */}
      <path d="M65 35 L88 28" stroke="#2c1810" strokeWidth="2" strokeLinecap="round" />
      {/* Flower the hummingbird is visiting */}
      <circle cx="92" cy="27" r="5" fill="#f5e0cc" />
      <circle cx="92" cy="27" r="2.5" fill="#c96b2a" />
      <ellipse cx="92" cy="21" rx="3" ry="4" fill="#e8874a" opacity="0.7" transform="rotate(-15 92 21)" />
      <ellipse cx="97" cy="24" rx="3" ry="4" fill="#e8874a" opacity="0.7" transform="rotate(75 97 24)" />
      <ellipse cx="97" cy="30" rx="3" ry="4" fill="#e8874a" opacity="0.7" transform="rotate(130 97 30)" />
      <ellipse cx="92" cy="33" rx="3" ry="4" fill="#e8874a" opacity="0.7" transform="rotate(180 92 33)" />
      <ellipse cx="87" cy="30" rx="3" ry="4" fill="#e8874a" opacity="0.7" transform="rotate(-130 87 30)" />
      {/* Stem */}
      <path d="M92 32 L92 55 Q88 60 84 65" stroke="#4a6741" strokeWidth="2" strokeLinecap="round" />
      <path d="M92 45 Q98 42 102 44" stroke="#4a6741" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-sage-dark mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left: tribute text */}
          <div className="text-center md:text-left">
            <div className="handwritten text-orange-warm text-2xl mb-1">
              In loving memory
            </div>
            <div className="serif-heading text-cream text-xl font-semibold">
              Nancy Pavlik
            </div>
            <div className="text-sage-light text-sm mt-1 font-lato">
              Beloved wife of George · These recipes fed our souls
            </div>
            <div className="text-sage-light/60 text-xs mt-3 font-lato">
              &quot;The secret ingredient is always love.&quot;
            </div>
          </div>

          {/* Center: hummingbird */}
          <div className="w-32 h-24 hummingbird-hover opacity-80">
            <HummingbirdSVG className="w-full h-full" />
          </div>

          {/* Right: links */}
          <div className="text-center md:text-right space-y-2">
            <Link
              href="/upload"
              className="block text-sage-light hover:text-orange-warm transition-colors text-sm font-lato"
            >
              Add a Recipe
            </Link>
            <div className="text-sage-light/50 text-xs font-lato mt-4">
              Made with love for the Pavlik family
            </div>
          </div>
        </div>

        <div className="border-t border-sage-light/20 mt-8 pt-4 text-center">
          <p className="text-sage-light/40 text-xs font-lato">
            Nancy&apos;s Kitchen · A Pavlik Family Recipe Collection
          </p>
        </div>
      </div>
    </footer>
  );
}
