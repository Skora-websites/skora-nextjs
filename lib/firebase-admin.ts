import "server-only";
import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";

// ── Lazy Initialization ────────────────────────────────
// We defer Admin SDK initialization so the app can be built
// even when Firebase credentials are not yet set in .env.
// When credentials are missing, API routes should return a
// user-friendly error rather than crashing the whole app.

let _initialized = false;
let _initError: string | null = null;

function ensureInitialized(): boolean {
  if (_initialized) return true;
  if (_initError) return false;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    _initError =
      "Firebase is not configured. Please set up FIREBASE_PROJECT_ID, " +
      "FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in your .env file.";
    console.warn(`[Firebase Admin] ${_initError}`);
    return false;
  }

  try {
    // Handle escaped newlines in private key
    privateKey = privateKey.replace(/\\n/g, "\n");

    const apps = getApps();
    if (!apps.length) {
      initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
        projectId,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    }

    _initialized = true;
    return true;
  } catch (e) {
    _initError = e instanceof Error ? e.message : "Unknown Firebase initialization error";
    console.warn("[Firebase Admin] Initialization failed:", _initError);
    return false;
  }
}

/**
 * Throws a generic "not configured" error. Used when Firebase Admin
 * is accessed but hasn't been initialized.
 */
function throwNotConfigured(service: string): never {
  throw new Error(
    `Firebase ${service} is unavailable because Firebase is not configured. ` +
    "Contact your administrator to set up Firebase credentials."
  );
}

/**
 * Get the Firebase Admin Auth instance. Throws if credentials are missing.
 */
export function getAdminAuth(): Auth {
  if (!ensureInitialized()) {
    throwNotConfigured("Authentication");
  }
  return getAuth();
}

/**
 * Get the Firebase Admin Firestore instance. Throws if credentials are missing.
 */
export function getAdminDb(): Firestore {
  if (!ensureInitialized()) {
    throwNotConfigured("Database");
  }
  return getFirestore();
}

/**
 * Get the Firebase Admin Storage instance. Throws if credentials are missing.
 */
export function getAdminStorage(): Storage {
  if (!ensureInitialized()) {
    throwNotConfigured("Storage");
  }
  return getStorage();
}

/**
 * Check whether Firebase Admin has been successfully initialized.
 * Use this in components/routes to check for Firebase availability.
 */
export function isFirebaseConfigured(): boolean {
  return ensureInitialized();
}
