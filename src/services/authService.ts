// ==========================================
// Auth Service - Password + MFA PIN (No Backend)
// ==========================================
// Credentials are hashed with SHA-256 and stored in localStorage.
// First visit → setup flow. After that → login required.
// Session lives in sessionStorage (expires on tab close).
// Brute-force protection: lockout after 5 failed attempts.

const KEYS = {
  PASSWORD_HASH: "admin_pw_hash",
  PIN_HASH: "admin_pin_hash",
  SETUP_DONE: "admin_setup_done",
  SESSION: "admin_session",
  FAIL_COUNT: "admin_fail_count",
  LOCKOUT_UNTIL: "admin_lockout_until",
} as const;

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const SESSION_TOKEN = () => crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);

// ---- Hashing ----

async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ---- Setup ----

export function isSetupDone(): boolean {
  return localStorage.getItem(KEYS.SETUP_DONE) === "true";
}

export async function setupCredentials(password: string, pin: string): Promise<void> {
  const pwHash = await sha256(password);
  const pinHash = await sha256(pin);
  localStorage.setItem(KEYS.PASSWORD_HASH, pwHash);
  localStorage.setItem(KEYS.PIN_HASH, pinHash);
  localStorage.setItem(KEYS.SETUP_DONE, "true");
}

// ---- Lockout ----

export function getLockoutInfo(): { locked: boolean; remainingMs: number } {
  const until = Number(localStorage.getItem(KEYS.LOCKOUT_UNTIL) || "0");
  if (!until) return { locked: false, remainingMs: 0 };
  const remaining = until - Date.now();
  if (remaining <= 0) {
    // Lockout expired
    localStorage.removeItem(KEYS.LOCKOUT_UNTIL);
    localStorage.removeItem(KEYS.FAIL_COUNT);
    return { locked: false, remainingMs: 0 };
  }
  return { locked: true, remainingMs: remaining };
}

function recordFailedAttempt(): { locked: boolean; attemptsLeft: number } {
  const count = Number(localStorage.getItem(KEYS.FAIL_COUNT) || "0") + 1;
  localStorage.setItem(KEYS.FAIL_COUNT, String(count));
  if (count >= MAX_ATTEMPTS) {
    localStorage.setItem(KEYS.LOCKOUT_UNTIL, String(Date.now() + LOCKOUT_DURATION_MS));
    return { locked: true, attemptsLeft: 0 };
  }
  return { locked: false, attemptsLeft: MAX_ATTEMPTS - count };
}

function clearFailedAttempts(): void {
  localStorage.removeItem(KEYS.FAIL_COUNT);
  localStorage.removeItem(KEYS.LOCKOUT_UNTIL);
}

// ---- Authentication ----

export async function verifyPassword(password: string): Promise<boolean> {
  const storedHash = localStorage.getItem(KEYS.PASSWORD_HASH);
  if (!storedHash) return false;
  const inputHash = await sha256(password);
  return inputHash === storedHash;
}

export async function verifyPin(pin: string): Promise<boolean> {
  const storedHash = localStorage.getItem(KEYS.PIN_HASH);
  if (!storedHash) return false;
  const inputHash = await sha256(pin);
  return inputHash === storedHash;
}

export async function login(
  password: string,
  pin: string
): Promise<{ success: boolean; error?: string; attemptsLeft?: number }> {
  // Check lockout first
  const lockout = getLockoutInfo();
  if (lockout.locked) {
    const mins = Math.ceil(lockout.remainingMs / 60000);
    return { success: false, error: `Terlalu banyak percobaan. Coba lagi dalam ${mins} menit.` };
  }

  const pwOk = await verifyPassword(password);
  const pinOk = await verifyPin(pin);

  if (!pwOk || !pinOk) {
    const result = recordFailedAttempt();
    if (result.locked) {
      return { success: false, error: "Terlalu banyak percobaan gagal. Akun terkunci selama 5 menit." };
    }
    return {
      success: false,
      error: "Password atau PIN salah.",
      attemptsLeft: result.attemptsLeft,
    };
  }

  // Success
  clearFailedAttempts();
  const token = SESSION_TOKEN();
  sessionStorage.setItem(KEYS.SESSION, token);
  return { success: true };
}

// ---- Session ----

export function isAuthenticated(): boolean {
  return !!sessionStorage.getItem(KEYS.SESSION);
}

export function logout(): void {
  sessionStorage.removeItem(KEYS.SESSION);
}

// ---- Change credentials ----

export async function changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
  const ok = await verifyPassword(currentPassword);
  if (!ok) return false;
  const hash = await sha256(newPassword);
  localStorage.setItem(KEYS.PASSWORD_HASH, hash);
  return true;
}

export async function changePin(currentPin: string, newPin: string): Promise<boolean> {
  const ok = await verifyPin(currentPin);
  if (!ok) return false;
  const hash = await sha256(newPin);
  localStorage.setItem(KEYS.PIN_HASH, hash);
  return true;
}

// ---- Reset (nuclear option) ----

export function resetAuth(): void {
  Object.values(KEYS).forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
}
