import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(/(?:^|; )session=([^;]+)/);
    if (!match) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const raw = decodeURIComponent(match[1]);
    const session = JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
    const email = session.email;
    if (!email) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    const userRes = await pool.query("SELECT id FROM users WHERE email = $1 LIMIT 1", [email]);
    if (userRes.rows.length === 0) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const userId = userRes.rows[0].id;

    const list = await pool.query(
      `SELECT um.id as entry_id, m.manga_id, m.title, m.cover_url, um.status, um.rating, um.review, um.last_updated
       FROM user_manga um
       JOIN manga m ON um.manga_id = m.id
       WHERE um.user_id = $1
       ORDER BY um.last_updated DESC`,
      [userId]
    );

    return NextResponse.json({ list: list.rows });
  } catch (err) {
    console.error("/api/manga/mylist error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
