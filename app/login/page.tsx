import React from "react";
import GoogleAuth from "@/components/GoogleAuth";

export default function LoginPage() {
	return (
		<main className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="w-full max-w-md bg-white rounded-lg shadow p-8">
				<h1 className="text-2xl font-bold mb-4">Sign in</h1>
				<p className="mb-6 text-sm text-gray-600">Sign in with Google to save your manga list.</p>
				<div className="flex justify-center">
					<GoogleAuth />
				</div>
				<div className="mt-6 text-xs text-gray-400">
					By signing in you agree that a user record (name, email, created_at) will be stored in the app database.
				</div>
			</div>
		</main>
	);
}
