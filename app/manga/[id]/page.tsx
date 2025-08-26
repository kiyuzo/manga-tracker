import { notFound } from "next/navigation";

interface MangaDetail {
  mal_id: number;
  title: string;
  synopsis?: string;
  images?: {
    webp?: { image_url?: string };
    jpg?: { image_url?: string };
  };
  authors?: { name: string }[];
  chapters?: number;
  volumes?: number;
  status?: string;
  score?: number;
  // Add more fields as needed
}

export default async function MangaDetailPage({ params }: { params: { id: string } }) {
  const res = await fetch(`https://api.jikan.moe/v4/manga/${params.id}`);
  if (!res.ok) return notFound();
  const data = await res.json();
  const manga: MangaDetail = data.data;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="flex gap-8">
        <img
          src={manga.images?.webp?.image_url || manga.images?.jpg?.image_url || "/vercel.svg"}
          alt={manga.title}
          className="w-48 h-auto rounded shadow"
        />
        <div>
          <h1 className="text-3xl font-bold mb-2">{manga.title}</h1>
          <p className="mb-4 text-gray-700">{manga.synopsis || "No synopsis available."}</p>
          <div className="text-sm text-gray-500">
            <div>Status: {manga.status || "Unknown"}</div>
            <div>Chapters: {manga.chapters ?? "?"}</div>
            <div>Volumes: {manga.volumes ?? "?"}</div>
            <div>Score: {manga.score ?? "?"}</div>
            <div>
              Authors:{" "}
              {manga.authors && manga.authors.length > 0
                ? manga.authors.map(a => a.name).join(", ")
                : "Unknown"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}