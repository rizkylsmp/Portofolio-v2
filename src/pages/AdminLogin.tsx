// ==========================================
// Admin Login Page - Password + MFA PIN
// ==========================================

import { useState, useEffect, useRef } from "react";
import {
  isSetupDone,
  setupCredentials,
  login,
  getLockoutInfo,
} from "../services/authService";
import { MdLock, MdVpnKey, MdVisibility, MdVisibilityOff, MdShield, MdWarning } from "react-icons/md";

interface Props {
  onAuthenticated: () => void;
}

const AdminLogin = ({ onAuthenticated }: Props) => {
  const [isSetup, setIsSetup] = useState(false); // true = first-time setup mode
  const [step, setStep] = useState<"password" | "pin">("password");

  // Fields
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // State
  const [error, setError] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  const [loading, setLoading] = useState(false);

  const pinInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsSetup(!isSetupDone());
  }, []);

  // Lockout timer
  useEffect(() => {
    const info = getLockoutInfo();
    if (info.locked) {
      setLockoutRemaining(info.remainingMs);
    }

    if (lockoutRemaining <= 0) return;

    const interval = setInterval(() => {
      const updated = getLockoutInfo();
      if (!updated.locked) {
        setLockoutRemaining(0);
        setError("");
      } else {
        setLockoutRemaining(updated.remainingMs);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutRemaining]);

  // Focus management
  useEffect(() => {
    if (step === "password") passwordInputRef.current?.focus();
    if (step === "pin") pinInputRef.current?.focus();
  }, [step]);

  const formatTime = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // ---- Setup flow ----
  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (step === "password") {
      if (password.length < 6) {
        setError("Password minimal 6 karakter.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Password tidak cocok.");
        return;
      }
      setStep("pin");
      return;
    }

    // PIN step
    if (!/^\d{6}$/.test(pin)) {
      setError("PIN harus 6 digit angka.");
      return;
    }
    if (pin !== confirmPin) {
      setError("PIN tidak cocok.");
      return;
    }

    setLoading(true);
    await setupCredentials(password, pin);
    setLoading(false);
    onAuthenticated();
  };

  // ---- Login flow ----
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (lockoutRemaining > 0) return;

    if (step === "password") {
      if (!password) {
        setError("Masukkan password.");
        return;
      }
      setStep("pin");
      return;
    }

    // PIN step → verify both
    if (!pin) {
      setError("Masukkan PIN.");
      return;
    }

    setLoading(true);
    const result = await login(password, pin);
    setLoading(false);

    if (result.success) {
      onAuthenticated();
    } else {
      setError(result.error || "Login gagal.");
      if (result.attemptsLeft !== undefined) {
        setAttemptsLeft(result.attemptsLeft);
      }
      if (result.error?.includes("terkunci")) {
        setLockoutRemaining(getLockoutInfo().remainingMs);
      }
      // Reset to password step on failure
      setStep("password");
      setPin("");
    }
  };

  const isLocked = lockoutRemaining > 0;

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 text-accent mb-4">
            <MdShield size={32} />
          </div>
          <h1 className="text-2xl font-bold text-accent">
            {isSetup ? "Setup Admin" : "Admin Login"}
          </h1>
          <p className="text-text-secondary text-sm mt-2">
            {isSetup
              ? "Buat password dan PIN untuk mengamankan admin panel."
              : "Masukkan kredensial untuk mengakses admin panel."}
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface-secondary border border-border rounded-2xl p-8 shadow-xl">
          {/* Step Indicator */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                step === "password"
                  ? "bg-accent text-surface"
                  : "bg-accent/10 text-accent"
              }`}
            >
              <MdLock size={14} />
              Password
            </div>
            <div className="flex-1 h-px bg-border" />
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                step === "pin"
                  ? "bg-accent text-surface"
                  : "bg-accent/10 text-text-muted"
              }`}
            >
              <MdVpnKey size={14} />
              PIN
            </div>
          </div>

          {/* Lockout Warning */}
          {isLocked && (
            <div className="flex items-center gap-3 p-4 mb-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
              <MdWarning size={20} />
              <div className="text-sm">
                <p className="font-medium">Akun terkunci</p>
                <p>Coba lagi dalam {formatTime(lockoutRemaining)}</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && !isLocked && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
              <MdWarning size={16} className="shrink-0" />
              <span>{error}</span>
              {attemptsLeft !== null && attemptsLeft > 0 && (
                <span className="ml-auto text-xs whitespace-nowrap">
                  {attemptsLeft} percobaan tersisa
                </span>
              )}
            </div>
          )}

          <form onSubmit={isSetup ? handleSetup : handleLogin}>
            {/* Password Step */}
            {step === "password" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      ref={passwordInputRef}
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password..."
                      className="w-full px-4 py-3 pr-12 bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
                      disabled={isLocked}
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                    </button>
                  </div>
                </div>

                {isSetup && (
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">
                      Konfirmasi Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ketik ulang password..."
                      className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
                      autoComplete="off"
                    />
                  </div>
                )}
              </div>
            )}

            {/* PIN Step */}
            {step === "pin" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    PIN 6 Digit
                  </label>
                  <input
                    ref={pinInputRef}
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setPin(val);
                    }}
                    placeholder="● ● ● ● ● ●"
                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text-primary text-center text-xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
                    disabled={isLocked}
                    autoComplete="off"
                  />
                  <p className="text-text-muted text-xs mt-1.5">
                    {isSetup
                      ? "PIN ini akan digunakan sebagai faktor kedua (MFA) saat login."
                      : "Masukkan 6 digit PIN Anda."}
                  </p>
                </div>

                {isSetup && (
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">
                      Konfirmasi PIN
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      value={confirmPin}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                        setConfirmPin(val);
                      }}
                      placeholder="● ● ● ● ● ●"
                      className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text-primary text-center text-xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
                      autoComplete="off"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              {step === "pin" && (
                <button
                  type="button"
                  onClick={() => { setStep("password"); setPin(""); setConfirmPin(""); setError(""); }}
                  className="px-4 py-3 border border-border rounded-xl text-text-secondary hover:bg-surface-tertiary transition-colors cursor-pointer"
                >
                  Kembali
                </button>
              )}
              <button
                type="submit"
                disabled={isLocked || loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-accent text-surface rounded-xl font-medium hover:bg-accent-hover transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-surface/30 border-t-surface rounded-full animate-spin" />
                ) : step === "password" ? (
                  <>
                    <MdLock size={18} />
                    {isSetup ? "Lanjut ke PIN" : "Lanjut"}
                  </>
                ) : (
                  <>
                    <MdVpnKey size={18} />
                    {isSetup ? "Buat Akun" : "Login"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-text-muted text-xs mt-6">
          🔒 Data tersimpan lokal di browser. Tidak ada data yang dikirim ke server.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
