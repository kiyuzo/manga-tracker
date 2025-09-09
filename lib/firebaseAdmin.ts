import admin from "firebase-admin";
import type { ServiceAccount } from "firebase-admin";

// Support either raw JSON string or base64-encoded JSON in env
const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_B64 || process.env.FIREBASE_SERVICE_ACCOUNT_B64;

let serviceAccountJson: string | undefined = rawJson;
if (!serviceAccountJson && b64) {
  try {
    serviceAccountJson = Buffer.from(b64, "base64").toString("utf8");
  } catch {
    throw new Error("Invalid base64 in FIREBASE_SERVICE_ACCOUNT_JSON_B64");
  }
}

if (!serviceAccountJson) {
  throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_JSON_B64 in environment");
}

let serviceAccount: ServiceAccount | Record<string, unknown>;
try {
  serviceAccount = JSON.parse(serviceAccountJson);
} catch (e) {
  throw new Error("Failed to parse Firebase service account JSON: " + (e as Error).message);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
