import { useNavigate } from "@tanstack/react-router";
import { Loader2, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, clear, identity, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const { actor, isFetching } = useActor();
  const [adminCheckDone, setAdminCheckDone] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(false);

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (!isAuthenticated || !actor || isFetching || adminCheckDone) return;
    setCheckingAdmin(true);
    actor
      .isCallerAdmin()
      .then((result) => {
        setIsAdmin(result);
        setAdminCheckDone(true);
        setCheckingAdmin(false);
        if (result) {
          navigate({ to: "/admin", replace: true });
        }
      })
      .catch(() => {
        setAdminCheckDone(true);
        setCheckingAdmin(false);
      });
  }, [isAuthenticated, actor, isFetching, adminCheckDone, navigate]);

  const isLoading =
    isLoggingIn || isInitializing || isFetching || checkingAdmin;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(to bottom, #E9DDCB, #E3D3BE)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-sm"
      >
        <div className="bg-white rounded-3xl shadow-card p-8 md:p-10">
          {/* Brand */}
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              gift<span className="text-gold">Naura</span>
            </h1>
            <p className="text-muted-foreground text-sm">Admin Portal</p>
          </div>

          {/* Gold divider */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-gold font-medium uppercase tracking-wider">
              Secure Login
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Access denied state */}
          {isAuthenticated && adminCheckDone && !isAdmin && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              data-ocid="login.error_state"
              className="mb-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex gap-3"
            >
              <ShieldAlert className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">
                  Access Denied
                </p>
                <p className="text-xs text-destructive/80 mt-1">
                  This is an admin-only area. Your account does not have
                  administrator privileges.
                </p>
              </div>
            </motion.div>
          )}

          {/* Login / Logout button */}
          {!isAuthenticated || (adminCheckDone && !isAdmin) ? (
            <div className="space-y-3">
              {!isAuthenticated && (
                <button
                  type="button"
                  data-ocid="login.primary_button"
                  onClick={login}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-gold hover:bg-gold-hover text-white font-medium py-3 px-6 rounded-full transition-colors shadow-gold disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : null}
                  {isLoading ? "Connecting..." : "Login with Internet Identity"}
                </button>
              )}
              {isAuthenticated && adminCheckDone && !isAdmin && (
                <button
                  type="button"
                  data-ocid="login.secondary_button"
                  onClick={clear}
                  className="w-full flex items-center justify-center gap-2 bg-white border-2 border-gold text-gold hover:bg-gold-muted font-medium py-3 px-6 rounded-full transition-colors"
                >
                  Logout
                </button>
              )}
            </div>
          ) : (
            <div
              data-ocid="login.loading_state"
              className="flex items-center justify-center py-4"
            >
              <Loader2 className="w-6 h-6 text-gold animate-spin" />
              <span className="ml-3 text-muted-foreground text-sm">
                Verifying access...
              </span>
            </div>
          )}

          <p className="text-center text-xs text-muted-foreground mt-6">
            Protected by Internet Identity
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          <a href="/" className="hover:text-gold transition-colors">
            ← Back to home
          </a>
        </p>
      </motion.div>
    </div>
  );
}
