"use client";

import React, { useEffect, useState } from "react";
import { auth } from "@/components/firebase";
import { onAuthStateChanged, signOut as fbSignOut, type User as FirebaseUser } from "firebase/auth";

type Session = { uid?: string; email?: string; name?: string } | null;

function Navbar() {
  const [userSession, setUserSession] = useState<Session>(null);
  const [fbUser, setFbUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    // read session cookie (server-created session)
    try {
      const match = document.cookie.match(/(?:^|; )session=([^;]+)/);
      if (!match) return;
      const raw = decodeURIComponent(match[1]);
      const json = atob(raw);
      const session = JSON.parse(json) as Session;
      setUserSession(session);
    } catch {
      // ignore parse errors
    }
  }, []);

  useEffect(() => {
    // subscribe to firebase client auth to get profile picture / latest displayName/email
    const unsub = onAuthStateChanged(auth, (u) => {
      setFbUser(u);
    });
    return () => unsub();
  }, []);

  const username = (() => {
    // priority: firebase email -> session email -> derived from session.name
    const email = fbUser?.email ?? userSession?.email;
    if (email) return email.split("@")[0];
    const name = fbUser?.displayName ?? userSession?.name;
    if (name) return name.split(" ").slice(0, 2).join(" ");
    return null;
  })();

  const avatarUrl = fbUser?.photoURL ?? null;

  const initials = (() => {
    if (username) return username[0].toUpperCase();
    if (userSession?.name) return userSession.name.split(" ").map(s => s[0]).slice(0,2).join("").toUpperCase();
    if (userSession?.email) return userSession.email[0].toUpperCase();
    return "";
  })();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    } catch {
      // ignore
    }
    try {
      await fbSignOut(auth);
    } catch {
      // ignore
    }
    // clear cookie client-side as a fallback
    document.cookie = "session=; Path=/; Max-Age=0;";
    window.location.href = "/login";
  };

  return (
    <nav className="flex justify-between items-center px-8 py-4 border-b border-gray-200 bg-white">
      <div className="font-bold text-2xl tracking-wide">MangaTracker</div>
      <div className="flex items-center gap-6">
        <a href="/my-list" className="text-gray-800 font-medium hover:text-blue-600 transition-colors">My List</a>

        {username ? (
          <>
            <span className="text-gray-700 font-medium">{username}</span>
            <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">Log out</button>
            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden text-sm font-medium text-gray-700">
              {avatarUrl ? (
                // use plain img to avoid next/image hostname config
                <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
          </>
        ) : (
          <>
            <a href="/login" className="text-gray-800 font-medium hover:text-blue-600 transition-colors">Sign in</a>
            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              <svg width="24" height="24" fill="#bdbdbd" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4" />
                <ellipse cx="12" cy="17" rx="7" ry="5" />
              </svg>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;