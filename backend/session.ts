// A lightweight, anonymous session identifier stored in a cookie. This lets
// us group a visitor's activity (page visits, referral submissions, ALBA
// messages) together without requiring any login or account system.
// It is NOT tied to a real identity — just a random ID per browser.

import { cookies } from "next/headers";
import { randomUUID } from "crypto";

const SESSION_COOKIE_NAME = "anra_session_id";

export async function getOrCreateSessionId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (existing) return existing;

  const newId = randomUUID();
  cookieStore.set(SESSION_COOKIE_NAME, newId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
  return newId;
}