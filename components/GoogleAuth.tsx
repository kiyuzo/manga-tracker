"use client";
import { auth } from "./firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";

type UserRow = {
  id: number;
  name: string;
  email: string;
  created_at: string;
};

export default function GoogleAuthButton() {
  const [fbUser, setFbUser] = useState<FirebaseUser | null>(null);
  const [dbUser, setDbUser] = useState<UserRow | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFbUser(user);
      if (user) {
        // register/fetch user in our DB
        setLoading(true);
        try {
          const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: user.displayName, email: user.email }),
          });
          const data = await res.json();
          if (data?.user) setDbUser(data.user);
        } catch (e) {
          console.error("Register fetch failed", e);
        } finally {
          setLoading(false);
        }
      } else {
        setDbUser(null);
      }
    });
    return () => unsub();
  }, []);

  // redirect to home after successful DB registration when on /login
  useEffect(() => {
    if (dbUser && pathname === "/login") {
      router.replace("/");
    }
  }, [dbUser, pathname, router]);

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      // send id token to server to create session cookie and register user
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      });
      // onAuthStateChanged will handle DB registration/fetch
    } catch (err) {
      console.error("Sign in failed", err);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setFbUser(null);
    setDbUser(null);
    // clear server session
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  if (loading) return <button className="px-4 py-2 rounded bg-gray-200">Loading...</button>;

  return fbUser && dbUser ? (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 relative rounded-full overflow-hidden">
        <Image src={fbUser.photoURL ?? "/vercel.svg"} alt={fbUser.displayName || "avatar"} fill className="object-cover" />
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