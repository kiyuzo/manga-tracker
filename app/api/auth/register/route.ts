import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email } = body;

    if (!email || !name) {
      return NextResponse.json({ error: "Missing name or email" }, { status: 400 });
    }

    // check if user exists
    const find = await pool.query("SELECT id, name, email, created_at FROM users WHERE email = $1 LIMIT 1", [email]);
    if (find.rows.length > 0) {
      return NextResponse.json({ user: find.rows[0] }, { status: 200 });
    }

    // insert new user
    const insert = await pool.query(
      "INSERT INTO users (name, email, created_at) VALUES ($1, $2, now()) RETURNING id, name, email, created_at",
      [name, email]
    );

    return NextResponse.json({ user: insert.rows[0] }, { status: 201 });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
