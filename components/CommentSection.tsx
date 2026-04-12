'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Comment, supabase } from '@/lib/supabase';

function StarPicker({
  rating,
  onChange,
}: {
  rating: number;
  onChange: (r: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110"
          aria-label={`${star} star`}
        >
          <svg
            className={`w-6 h-6 ${
              star <= (hovered || rating) ? 'star-filled' : 'star-empty'
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function CommentCard({ comment }: { comment: Comment }) {
  const date = new Date(comment.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-cream rounded-2xl p-5 border border-orange-light/60">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar circle with initials */}
          <div className="w-10 h-10 rounded-full bg-sage flex items-center justify-center flex-shrink-0">
            <span className="text-cream font-lato font-bold text-sm">
              {comment.author_name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-lato font-bold text-brown-dark text-sm">
              {comment.author_name}
            </div>
            <div className="text-brown-light text-xs font-lato">{date}</div>
          </div>
        </div>
        {comment.rating && (
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`w-4 h-4 ${star <= comment.rating! ? 'star-filled' : 'star-empty'}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        )}
      </div>

      <p className="text-brown-dark font-lato text-sm leading-relaxed mb-3">
        {comment.comment_text}
      </p>

      {comment.photo_url && (
        <div className="relative h-40 rounded-xl overflow-hidden mt-3">
          <Image
            src={comment.photo_url}
            alt="Photo shared with comment"
            fill
            className="object-cover"
          />
        </div>
      )}
    </div>
  );
}

export default function CommentSection({
  recipeId,
  initialComments,
}: {
  recipeId: string;
  initialComments: Comment[];
}) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [authorName, setAuthorName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(0);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!authorName.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!commentText.trim()) {
      setError('Please write a comment.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      let photoUrl: string | null = null;

      // Upload photo if provided
      if (photoFile) {
        const ext = photoFile.name.split('.').pop() || 'jpg';
        const fileName = `comment-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('recipe-images')
          .upload(`comments/${fileName}`, photoFile);

        if (!uploadError) {
          const { data } = supabase.storage
            .from('recipe-images')
            .getPublicUrl(`comments/${fileName}`);
          photoUrl = data.publicUrl;
        }
      }

      // Post comment
      const res = await fetch(`/api/comments/${recipeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_name: authorName.trim(),
          comment_text: commentText.trim(),
          rating: rating || null,
          photo_url: photoUrl,
        }),
      });

      if (!res.ok) throw new Error('Failed to post comment');
      const newComment: Comment = await res.json();

      setComments((prev) => [newComment, ...prev]);
      setAuthorName('');
      setCommentText('');
      setRating(0);
      setPhotoFile(null);
      setPhotoPreview(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch {
      setError('Could not post your comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-12">
      {/* Section header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 h-px bg-orange-light" />
        <h2 className="serif-heading text-brown-dark text-2xl font-semibold whitespace-nowrap">
          Family Memories &amp; Reviews
        </h2>
        <div className="flex-1 h-px bg-orange-light" />
      </div>

      {/* Add comment form */}
      <div className="bg-warm-white rounded-3xl p-6 sm:p-8 border border-orange-light/60 shadow-recipe mb-8">
        <h3 className="handwritten text-sage text-xl mb-4">
          Share your memory or make this recipe?
        </h3>

        {success && (
          <div className="bg-sage-muted border border-sage-light text-sage-dark px-4 py-3 rounded-xl text-sm font-lato mb-4">
            ✅ Your comment was posted! Thank you for sharing.
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-lato mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-brown-dark font-lato font-semibold text-sm mb-1.5">
                Your Name *
              </label>
              <input
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Aunt Maria"
                className="w-full px-4 py-2.5 bg-cream border border-sage-light rounded-xl text-brown-dark font-lato text-sm focus:outline-none focus:ring-2 focus:ring-sage/30"
              />
            </div>
            <div>
              <label className="block text-brown-dark font-lato font-semibold text-sm mb-1.5">
                Rating (optional)
              </label>
              <StarPicker rating={rating} onChange={setRating} />
            </div>
          </div>

          <div>
            <label className="block text-brown-dark font-lato font-semibold text-sm mb-1.5">
              Your Comment *
            </label>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={4}
              placeholder="Share a memory about this dish, how it turned out when you made it, or what it means to you…"
              className="w-full px-4 py-2.5 bg-cream border border-sage-light rounded-xl text-brown-dark font-lato text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 resize-y"
            />
          </div>

          {/* Photo upload */}
          <div>
            <label className="block text-brown-dark font-lato font-semibold text-sm mb-1.5">
              Add a Photo (optional)
            </label>
            {photoPreview ? (
              <div className="relative">
                <div className="relative h-40 rounded-xl overflow-hidden">
                  <Image src={photoPreview} alt="Preview" fill className="object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                  className="absolute top-2 right-2 bg-white/80 rounded-full p-1 text-brown-dark hover:bg-white text-xs"
                >
                  ✕ Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full px-4 py-3 bg-cream border-2 border-dashed border-sage-light rounded-xl text-brown-light hover:border-sage hover:text-sage font-lato text-sm transition-colors"
              >
                📷 Click to upload a photo of your dish
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-3 bg-orange hover:bg-orange-warm text-white font-lato font-bold rounded-full transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Posting…
              </>
            ) : (
              'Post Comment'
            )}
          </button>
        </form>
      </div>

      {/* Existing comments */}
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((c) => (
            <CommentCard key={c.id} comment={c} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-brown-light font-lato">
          <div className="text-4xl mb-3">💬</div>
          <p>No comments yet — be the first to share a memory!</p>
        </div>
      )}
    </div>
  );
}
