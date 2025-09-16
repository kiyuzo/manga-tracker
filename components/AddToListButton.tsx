"use client";

import React, { useState } from "react";

export default function AddToListButton({ mangaId, title, coverUrl }: { mangaId: number; title: string; coverUrl?: string }) {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleAdd = async (s: "reading" | "completed" | "dropped") => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/manga/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manga_id: mangaId, title, cover_url: coverUrl, status: s }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed");
      setStatus(s);
      setMessage("Added to your list");
    } catch (err) {
      const msg = (err as Error)?.message ?? "Error";
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="inline-flex items-center gap-2">
        <label className="text-sm text-gray-600">Status</label>
        <select
          className="border rounded px-2 py-1"
          value={status ?? ""}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleAdd(e.target.value as "reading" | "completed" | "dropped")}
          disabled={loading}
        >
          <option value="">Select</option>
          <option value="reading">Reading</option>
          <option value="completed">Completed</option>
          <option value="dropped">Dropped</option>
        </select>
      </div>
      {loading ? <div className="text-sm text-gray-500">Saving...</div> : message && <div className="text-sm text-green-600">{message}</div>}
    </div>
  );
}
