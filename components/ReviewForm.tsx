"use client";

import React, { useState } from "react";

export default function ReviewForm({ mangaId, initialRating, initialReview, onSaved }: { mangaId: number; initialRating?: number | null; initialReview?: string | null; onSaved?: (entry: unknown) => void }) {
  const [rating, setRating] = useState<number | "">(initialRating ?? "");
  const [review, setReview] = useState<string>(initialReview ?? "");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/manga/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manga_id: mangaId, rating: rating === "" ? null : Number(rating), review: review || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed");
      setMsg("Saved");
      onSaved?.(data.entry);
    } catch (err) {
      setMsg((err as Error).message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm">Rating</label>
        <select value={rating} onChange={(e) => setRating(e.target.value === "" ? "" : Number(e.target.value))} className="border rounded px-2 py-1">
          <option value="">--</option>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <button type="submit" disabled={loading} className="ml-2 bg-blue-600 text-white px-3 py-1 rounded">{loading ? "Saving..." : "Save"}</button>
      </div>
      <div>
        <label className="text-sm">Review</label>
        <textarea value={review} onChange={(e) => setReview(e.target.value)} className="w-full border rounded p-2 mt-1" rows={4} />
      </div>
      {msg && <div className="text-sm text-green-600">{msg}</div>}
    </form>
  );
}
