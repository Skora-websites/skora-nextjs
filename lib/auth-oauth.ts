"use client";

import { auth } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  isSignInWithEmailLink,
  OAuthProvider,
} from "firebase/auth";

// ── Google OAuth ────────────────────────────────────────

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

/**
 * Sign in with Google using a popup window.
 * On success, exchanges the Firebase ID token for a session cookie.
 * Returns the user info on success, or throws on error.
 */
export async function signInWithGoogle(): Promise<{ success: boolean }> {
  const authInstance = auth;
  if (!authInstance) {
    throw new Error("Firebase Auth is not initialized on the client");
  }

  const result = await signInWithPopup(authInstance, googleProvider);
  const idToken = await result.user.getIdToken();

  // Exchange Firebase ID token for a session cookie
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create session");
  }

  return { success: true };
}

/**
 * Sign in with Google using redirect (better for mobile).
 * Call this, then call `handleRedirectResult` on the return page.
 */
export async function signInWithGoogleRedirect(): Promise<void> {
  const authInstance = auth;
  if (!authInstance) {
    throw new Error("Firebase Auth is not initialized on the client");
  }
  await signInWithRedirect(authInstance, googleProvider);
}

/**
 * Handle the result of a redirect sign-in.
 * Call this on the page the user is redirected back to.
 */
export async function handleRedirectResult(): Promise<{ success: boolean } | null> {
  const authInstance = auth;
  if (!authInstance) return null;

  const result = await getRedirectResult(authInstance);
  if (!result) return null;

  const idToken = await result.user.getIdToken();

  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create session");
  }

  return { success: true };
}

// ── GitHub OAuth (future) ───────────────────────────────

const githubProvider = new OAuthProvider("github.com");
githubProvider.setCustomParameters({
  prompt: "select_account",
});

/**
 * Sign in with GitHub using a popup window.
 */
export async function signInWithGitHub(): Promise<{ success: boolean }> {
  const authInstance = auth;
  if (!authInstance) {
    throw new Error("Firebase Auth is not initialized on the client");
  }

  const result = await signInWithPopup(authInstance, githubProvider);
  const idToken = await result.user.getIdToken();

  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create session");
  }

  return { success: true };
}
