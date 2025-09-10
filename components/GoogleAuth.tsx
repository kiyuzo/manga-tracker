"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/components/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";

type UserRow = {
  id: number;
  name: string;
  email: string;
  created_at: string;
};

export default function GoogleAuth() {
  const router = useRouter();
  const [fbUser, setFbUser] = useState<FirebaseUser | null>(null);
  const [dbUser, setDbUser] = useState<UserRow | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFbUser(user);
      if (user) {
        // If user is already signed in on client, ensure server session exists.
        setLoading(true);
        try {
          const idToken = await user.getIdToken();
          const res = await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
            credentials: "same-origin",
          });
          const data = await res.json();
          if (data?.user) setDbUser(data.user);
          // after server session exists, redirect to home (if on /login)
          if (res.ok && window.location.pathname === "/login") router.replace("/");
        } catch (e) {
          console.error("session exchange failed", e);
        } finally {
          setLoading(false);
        }
      } else {
        setDbUser(null);
      }
    });
    return () => unsub();
  }, [router]);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();

      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
        credentials: "same-origin",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("session API error", err);
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (data?.user) setDbUser(data.user);

      // redirect to home
      router.replace("/");
    } catch (err) {
      console.error("Sign in failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
      await fbSignOut(auth);
      setDbUser(null);
      setFbUser(null);
      router.replace("/login");
    } catch (err) {
      console.error("Sign out failed", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <button className="px-4 py-2 rounded bg-gray-200">Loading...</button>;

  return fbUser && dbUser ? (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 relative rounded-full overflow-hidden">
        {/* use plain img if you prefer; next/image requires config for external hosts */}
        <img src={fbUser.photoURL ?? "/vercel.svg"} alt={fbUser.displayName || "avatar"} className="object-cover w-full h-full" />
      </div>
      <div className="text-sm">
        <div className="font-medium">{dbUser.name}</div>
        <div className="text-xs text-gray-500">{dbUser.email}</div>
      </div>
      <button onClick={handleSignOut} className="ml-3 text-sm text-red-500">Sign out</button>
    </div>
  ) : (
    <button onClick={handleSignIn} className="bg-blue-600 text-white px-4 py-2 rounded">
      Sign in with Google
    </button>
  );
}