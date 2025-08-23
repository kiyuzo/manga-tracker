"use client";
import React, { useState, useEffect, ChangeEvent } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;

interface Manga {
    mal_id: number;
    title: string;
    images?: {
        jpg?: {
            image_url?: string;
        };
        webp?: {
            image_url?: string;
        };
    };
}

function SearchBar() {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<Manga[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            setError(null);
            return;
        }

        const controller = new AbortController();
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${API_URL}?q=${encodeURIComponent(query)}`, {
                    signal: controller.signal,
                });
                const data = await res.json();
                // Filter titles that start with the query (case-insensitive)
                const filtered = (data.data || []).filter((manga: Manga) =>
                    manga.title.toLowerCase().startsWith(query.toLowerCase())
                );
                setResults(filtered);
            } catch (err) {
                if (err instanceof DOMException && err.name === "AbortError") return;
                setError("Failed to fetch results.");
            } finally {
                setLoading(false);
            }
        };

        // Debounce API call
        const timeout = setTimeout(fetchData, 400);

        return () => {
            controller.abort();
            clearTimeout(timeout);
        };
    }, [query]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
    };

    return (
        <div className="flex flex-col items-center w-full max-w-md relative">
            <form
                onSubmit={e => e.preventDefault()}
                className="flex items-center w-full bg-gray-100 rounded-lg px-3 py-2 shadow-sm"
            >
                <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    type="text"
                    className="bg-transparent outline-none w-full text-gray-700 placeholder-gray-400"
                    placeholder="Search manga..."
                    value={query}
                    onChange={handleChange}
                    autoComplete="off"
                />
                {loading && (
                    <span className="ml-2 text-gray-400 text-sm">...</span>
                )}
            </form>
            {/* Dropdown results, absolutely positioned */}
            {(error || results.length > 0) && (
                <div className="absolute left-0 top-full mt-2 w-full z-20">
                    {error && <div className="text-red-500 bg-white rounded shadow p-2">{error}</div>}
                    {results.length > 0 && (
                        <ul className="bg-white rounded shadow max-h-64 overflow-y-auto border">
                            {results.map((manga, idx) => (
                                <li
                                    key={`${manga.mal_id}-${idx}`}
                                    className="flex items-center gap-4 px-4 py-2 border-b last:border-b-0"
                                >
                                    <img
                                        src={
                                            manga.images?.webp?.image_url ||
                                            manga.images?.jpg?.image_url ||
                                            "/vercel.svg"
                                        }
                                        alt={manga.title}
                                        className="w-12 h-16 object-cover rounded"
                                    />
                                    <span className="font-medium">{manga.title}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

export default SearchBar;