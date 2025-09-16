import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

type Body = {
  manga_id: number;
  title: string;
  cover_url?: string;
  status: "reading" | "completed" | "dropped";
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

    // Ensure manga exists in manga table
    const findManga = await pool.query("SELECT id FROM manga WHERE manga_id = $1 LIMIT 1", [body.manga_id]);
    let mangaRowId: number;
    if (findManga.rows.length > 0) {
      mangaRowId = findManga.rows[0].id;
    } else {
      const insert = await pool.query(
        "INSERT INTO manga (manga_id, title, cover_url, status) VALUES ($1, $2, $3, $4) RETURNING id",
        [body.manga_id, body.title, body.cover_url || null, null]
      );
      mangaRowId = insert.rows[0].id;
    }

    // Find user by email
    const findUser = await pool.query("SELECT id FROM users WHERE email = $1 LIMIT 1", [email]);
    if (findUser.rows.length === 0) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const userId = findUser.rows[0].id;

    // Try update first (handles cases where unique constraint doesn't exist)
    const update = await pool.query(
      `UPDATE user_manga SET status = $1, last_updated = now() WHERE user_id = $2 AND manga_id = $3 RETURNING id, user_id, manga_id, status`,
      [body.status, userId, mangaRowId]
    );

    if (update.rows.length > 0) {
      return NextResponse.json({ success: true, entry: update.rows[0] });
    }

    // Fallback to insert
    const insert = await pool.query(
      `INSERT INTO user_manga (user_id, manga_id, status, last_updated) VALUES ($1, $2, $3, now()) RETURNING id, user_id, manga_id, status`,
      [userId, mangaRowId, body.status]
    );

    return NextResponse.json({ success: true, entry: insert.rows[0] });
  } catch (err) {
    console.error("/api/manga/add error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
