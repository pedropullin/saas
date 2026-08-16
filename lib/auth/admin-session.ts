/**
 * DEMO-ONLY authentication.
 *
 * This project has no backend. The admin login below checks a hard-coded
 * credential pair entirely in the browser and stores a session flag in
 * sessionStorage. It exists purely to gate the /admin prototype behind a
 * login screen for demonstration purposes — it provides no real security
 * and must never be treated as an authentication system.
 */

const SESSION_KEY = "veyro-admin-session";

const DEMO_CREDENTIALS = {
  username: "peeale12",
  password: "veyro",
};

export function verifyAdminCredentials(username: string, password: string): boolean {
  return (
    username.trim().toLowerCase() === DEMO_CREDENTIALS.username &&
    password === DEMO_CREDENTIALS.password
  );
}

export function setAdminSession(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(SESSION_KEY, "1");
}

export function clearAdminSession(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SESSION_KEY);
}

export function hasAdminSession(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(SESSION_KEY) === "1";
}
