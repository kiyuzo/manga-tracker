import { NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin";
import { pool } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();
    if (!idToken) return NextResponse.json({ error: "Missing idToken" }, { status: 400 });

    // verify id token
  const decoded = await admin.auth().verifyIdToken(idToken);
  const { name, email, uid } = decoded as { name?: string; email?: string; uid: string };

    if (!email || !name) return NextResponse.json({ error: "Invalid token payload" }, { status: 400 });

    // register or fetch user in DB
    const find = await pool.query("SELECT id, name, email, created_at FROM users WHERE email = $1 LIMIT 1", [email]);
    let user = null;
    if (find.rows.length > 0) {
      user = find.rows[0];
    } else {
      const insert = await pool.query(
        "INSERT INTO users (name, email, created_at) VALUES ($1, $2, now()) RETURNING id, name, email, created_at",
        [name, email]
      );
      user = insert.rows[0];
    }

    // create a simple session cookie (not a secure session manager; for demo)
    const session = { uid: uid, email: user.email };
    const cookie = Buffer.from(JSON.stringify(session)).toString("base64");

    const res = NextResponse.json({ user });
    res.headers.set("Set-Cookie", `session=${cookie}; Path=/; HttpOnly; SameSite=Lax`);
    return res;
  } catch (err) {
    console.error("Session error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
