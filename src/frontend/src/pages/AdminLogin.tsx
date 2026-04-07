import { useNavigate } from "@tanstack/react-router";
import { Loader2, Lock, User } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useActor } from "../hooks/useActor";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "rjun0016";
const SESSION_KEY = "giftnAura_admin_session";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { actor, isFetching: actorLoading } = useActor();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (localStorage.getItem(SESSION_KEY) === "true") {
      navigate({ to: "/admin/dashboard", replace: true });
    }
  }, [navigate]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      setError("Invalid username or password");
      return;
    }

    if (!actor) {
      setError("Backend not ready. Please wait and try again.");
      return;
    }

    setIsLoading(true);
    try {
      // Verify backend recognizes this actor as admin before granting access.
      // The actor in useActor() is already initialized with the admin token,
      // so this call will return true if the token is valid.
      const isAdmin = await actor.isCallerAdmin();
      if (!isAdmin) {
        setError("Admin verification failed. Please try again.");
        setIsLoading(false);
        return;
      }
      localStorage.setItem(SESSION_KEY, "true");
      navigate({ to: "/admin/dashboard", replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? `Login failed: ${err.message}`
          : "Login failed. Please try again.",
      );
      setIsLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{
        background: "linear-gradient(160deg, #F5F0E8 0%, #EDE4D3 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-sm"
      >
        <div className="bg-white rounded-3xl shadow-card p-8 md:p-10">
          {/* Brand */}
          <div className="text-center mb-8">
            <img
              src="/assets/generated/giftnAura-logo-cropped.dim_440x200.png"
              alt="giftNaura"
              className="h-20 w-auto object-contain mx-auto mb-4"
              style={{ maxWidth: "220px" }}
            />
            <p className="text-muted-foreground text-sm">Admin Portal</p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] text-gold font-semibold uppercase tracking-[0.18em]">
              Secure Login
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              data-ocid="login.error_state"
              className="mb-5 p-3.5 rounded-2xl bg-destructive/8 border border-destructive/20 text-center"
            >
              <p className="text-sm font-semibold text-destructive">{error}</p>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                data-ocid="login.input"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-muted/30 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-colors"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                data-ocid="login.input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-muted/30 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-colors"
              />
            </div>
            <button
              type="submit"
              data-ocid="login.submit_button"
              disabled={isLoading || actorLoading}
              className="w-full flex items-center justify-center gap-2 bg-gold hover:bg-gold-hover text-white font-semibold py-3.5 px-6 rounded-full transition-colors shadow-gold disabled:opacity-60 disabled:cursor-not-allowed text-sm mt-2"
            >
              {isLoading || actorLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              {actorLoading
                ? "Connecting..."
                : isLoading
                  ? "Verifying..."
                  : "Login"}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-7">
            Protected admin area
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-5">
          <a href="/" className="hover:text-gold transition-colors">
            ← Back to home
          </a>
        </p>
      </motion.div>
    </div>
  );
}
