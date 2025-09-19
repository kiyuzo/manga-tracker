import { notFound } from "next/navigation";
import Image from "next/image";
import AddToListButton from "@/components/AddToListButton";
import ReviewForm from "@/components/ReviewForm";

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
}

export default async function MangaDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const res = await fetch(`https://api.jikan.moe/v4/manga/${id}`);
  if (!res.ok) return notFound();
  const data = await res.json();
  const manga: MangaDetail = data.data;

  const imageUrl = manga.images?.webp?.image_url ?? manga.images?.jpg?.image_url ?? "/vercel.svg";

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="flex gap-6">
        <Image
          src={imageUrl}
          alt={manga.title}
          width={192}
          height={288}
          className="w-48 h-auto rounded shadow"
          unoptimized={imageUrl === "/vercel.svg"}
        />

        <div>
          <h1 className="text-3xl font-bold mb-2">{manga.title}</h1>
          <p className="mb-4 text-gray-700">{manga.synopsis || "No synopsis available."}</p>

          {/* Add to list UI (client only) */}
          <div className="mb-4">
            {/* manga.mal_id is the Jikan id */}
            {/* cover_url uses imageUrl computed above */}
            <AddToListButton mangaId={manga.mal_id} title={manga.title} coverUrl={imageUrl} />
          </div>

          <div className="mb-4">
            {/* client-only review form */}
            <ReviewForm mangaId={manga.mal_id} initialRating={null} initialReview={null} />
          </div>

          <div className="text-sm text-gray-500 space-y-1">
            <div>Status: {manga.status || "Unknown"}</div>
            <div>Chapters: {manga.chapters ?? "?"}</div>
            <div>Volumes: {manga.volumes ?? "?"}</div>
            <div>Score: {manga.score ?? "?"}</div>
            <div>
              Authors: {manga.authors && manga.authors.length > 0 ? manga.authors.map((a) => a.name).join(", ") : "Unknown"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}