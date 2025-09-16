"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type Entry = {
    entry_id: number;
    manga_id: number;
    title: string;
    cover_url?: string | null;
    status?: string | null;
    rating?: number | null;
    review?: string | null;
    last_updated?: string | null;
};

export default function MyList() {
    const [list, setList] = useState<Entry[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await fetch("/api/manga/mylist", { credentials: "same-origin" });
                if (!res.ok) throw new Error((await res.json()).error || "Failed to fetch");
                const data = await res.json();
                if (!mounted) return;
                setList(data.list || []);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    if (loading) return <div className="p-6">Loading your list...</div>;
    if (error) return <div className="p-6 text-red-600">{error}</div>;

    if (!list || list.length === 0)
        return (
            <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow p-6 mt-6">
                <div className="flex flex-col items-center justify-center text-gray-400 py-8">
                    <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="4" y="4" width="16" height="16" rx="2" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                        <line x1="12" y1="8" x2="12" y2="16" />
                    </svg>
                    <span className="text-center">Your manga list is empty.<br />Add some manga to get started!</span>
                </div>
            </div>
        );

    return (
        <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">My List</h2>
            <ul className="space-y-4">
                {list.map((item) => (
                    <li key={item.entry_id} className="flex items-center gap-4 border-b pb-4">
                        <div className="w-16 h-24 bg-gray-100 rounded overflow-hidden">
                            {item.cover_url ? (
                                // use img to avoid next/image host config issues
                                // cover_url is expected to be a full URL from Jikan or stored value
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={item.cover_url} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                            )}
                        </div>

                        <div className="flex-1">
                            <Link href={`/manga/${item.manga_id}`} className="font-medium hover:underline">
                                {item.title}
                            </Link>
                            <div className="text-sm text-gray-500">Status: {item.status ?? "-"}</div>
                        </div>

                        <div className="text-sm text-gray-500 text-right">
                            <div>Rating: {item.rating ?? "-"}</div>
                            <div className="text-xs">Updated: {item.last_updated ? new Date(item.last_updated).toLocaleString() : "-"}</div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}