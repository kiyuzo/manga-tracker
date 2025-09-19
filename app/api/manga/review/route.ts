import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

type Body = {
  manga_id: number; // jikan id
  rating?: number | null;
  review?: string | null;
};

export async function POST(req: Request) {
  try {
    const body: Body = await req.json();
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(/(?:^|; )session=([^;]+)/);
    if (!match) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const raw = decodeURIComponent(match[1]);
    const session = JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
    const email = session.email;
    if (!email) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    // Ensure manga exists in manga table (manga_id is Jikan id)
    const findManga = await pool.query("SELECT id FROM manga WHERE manga_id = $1 LIMIT 1", [body.manga_id]);
    let mangaRowId: number;
    if (findManga.rows.length > 0) {
      mangaRowId = findManga.rows[0].id;
    } else {
      // create a placeholder title if none is provided in this API flow
      const insertM = await pool.query("INSERT INTO manga (manga_id, title, cover_url, status) VALUES ($1, $2, $3, $4) RETURNING id", [body.manga_id, `Manga ${body.manga_id}`, null, null]);
      mangaRowId = insertM.rows[0].id;
    }

    // Find user id
    const findUser = await pool.query("SELECT id FROM users WHERE email = $1 LIMIT 1", [email]);
    if (findUser.rows.length === 0) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const userId = findUser.rows[0].id;

    // Update existing user_manga row
    const update = await pool.query(
      `UPDATE user_manga SET rating = $1, review = $2, last_updated = now() WHERE user_id = $3 AND manga_id = $4 RETURNING id, user_id, manga_id, rating, review`,
      [body.rating ?? null, body.review ?? null, userId, mangaRowId]
    );

    if (update.rows.length > 0) {
      return NextResponse.json({ success: true, entry: update.rows[0] });
    }

    // Insert if none
    const insert = await pool.query(
      `INSERT INTO user_manga (user_id, manga_id, status, rating, review, last_updated) VALUES ($1, $2, $3, $4, $5, now()) RETURNING id, user_id, manga_id, rating, review`,
      [userId, mangaRowId, null, body.rating ?? null, body.review ?? null]
    );

    return NextResponse.json({ success: true, entry: insert.rows[0] });
  } catch (err) {
    console.error("/api/manga/review error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
