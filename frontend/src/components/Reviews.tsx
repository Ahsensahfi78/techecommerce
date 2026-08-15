"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";

import { api, ApiError, getToken, getUser } from "@/lib/api";
import { formatDateTime, initials } from "@/lib/format";
import { Spinner, Stars } from "@/components/ui";
import type { Review, User } from "@/lib/types";

const textareaClass =
  "w-full resize-none rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

export function ReviewsSection({ productId }: { productId: number }) {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const user = getUser() as User | null;

  const load = () => {
    setReviews(null);
    setError(null);
    api<Review[]>(`/api/products/${productId}/reviews`)
      .then(setReviews)
      .catch((e) => setError(e.message));
  };

  useEffect(load, [productId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!getToken()) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      await api(`/api/products/${productId}/reviews`, {
        method: "POST",
        body: { rating, comment },
        auth: true,
      });
      setComment("");
      setRating(5);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const removeReview = async (reviewId: number) => {
    try {
      await api(`/api/reviews/${reviewId}`, { method: "DELETE", auth: true });
      load();
    } catch {
      /* ignore */
    }
  };

  return (
    <section className="mt-16 border-t border-slate-200 pt-10">
      <h2 className="text-lg font-bold text-slate-900">Customer reviews</h2>
      {!error && reviews && (
        <p className="mt-1 text-sm text-slate-500">
          {reviews.length} review{reviews.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Write a review */}
      {getToken() && user ? (
        <form
          onSubmit={submit}
          className="mt-6 rounded-2xl border border-slate-200 bg-white p-5"
        >
          <h3 className="text-sm font-bold text-slate-900">Write a review</h3>
          <div className="mt-3 flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRating(r)}
                aria-label={`${r} star`}
                className="transition-transform hover:scale-110"
              >
                <svg
                  viewBox="0 0 24 24"
                  className={`h-8 w-8 ${
                    r <= rating
                      ? "fill-amber-400 text-amber-400"
                      : "fill-slate-200 text-slate-200"
                  }`}
                >
                  <path d="M12 2l2.9 6.26 6.6.57-5 4.36 1.5 6.45L12 16.9 5.99 19.64l1.5-6.45-5-4.36 6.6-.57L12 2z" />
                </svg>
              </button>
            ))}
            <span className="text-sm font-semibold text-slate-700">{rating}/5</span>
          </div>

          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What did you like or dislike about this product?"
            className={`${textareaClass} mt-3`}
          />

          {formError && (
            <p className="mt-2 text-sm text-rose-600">{formError}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-50"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit review
          </button>
        </form>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-500">
          <Link href={`/login?redirect=${encodeURIComponent(`/products/${productId}`)}`} className="font-semibold text-indigo-600 hover:text-indigo-700">
            Sign in
          </Link>{" "}
          to write a review.
        </div>
      )}

      {/* Review list */}
      {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
      {!error && !reviews && <div className="mt-6"><Spinner /></div>}
      {!error && reviews && reviews.length === 0 && (
        <p className="mt-6 text-sm text-slate-400">
          No reviews yet. Be the first to review this product!
        </p>
      )}

      <ul className="mt-6 space-y-4">
        {reviews?.map((r) => (
          <li
            key={r.id}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-semibold text-white">
                  {initials(r.user_name)}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {r.user_name}
                    {user && r.user_id === user.id && (
                      <span className="ml-2 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">
                        You
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatDateTime(r.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Stars rating={r.rating} />
                {user && (r.user_id === user.id || user.is_admin) && (
                  <button
                    onClick={() => removeReview(r.id)}
                    className="grid h-8 w-8 place-items-center rounded-full text-slate-300 hover:bg-rose-50 hover:text-rose-600"
                    aria-label="Delete review"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            {r.comment && (
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {r.comment}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
