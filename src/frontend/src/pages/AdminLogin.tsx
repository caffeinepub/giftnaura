import { useNavigate } from "@tanstack/react-router";
import { Loader2, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function AdminLogin() {
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
          navigate({ to: "/admin/dashboard", replace: true });
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

          {/* Access Denied */}
          {isAuthenticated && adminCheckDone && !isAdmin && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              data-ocid="login.error_state"
              className="mb-6 p-4 rounded-2xl bg-destructive/8 border border-destructive/20 flex gap-3"
            >
              <ShieldAlert className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-destructive">
                  Access Denied
                </p>
                <p className="text-xs text-destructive/70 mt-1 leading-relaxed">
                  This portal is for administrators only. Your account does not
                  have admin privileges.
                </p>
              </div>
            </motion.div>
          )}

          {/* Actions */}
          {!isAuthenticated || (adminCheckDone && !isAdmin) ? (
            <div className="space-y-3">
              {!isAuthenticated && (
                <button
                  type="button"
                  data-ocid="login.primary_button"
                  onClick={login}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-gold hover:bg-gold-hover text-white font-semibold py-3.5 px-6 rounded-full transition-colors shadow-gold disabled:opacity-60 disabled:cursor-not-allowed text-sm"
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
                  className="w-full flex items-center justify-center gap-2 bg-white border-2 border-gold text-gold hover:bg-gold/5 font-semibold py-3.5 px-6 rounded-full transition-colors text-sm"
                >
                  Try a Different Account
                </button>
              )}
            </div>
          ) : (
            <div
              data-ocid="login.loading_state"
              className="flex items-center justify-center py-5"
            >
              <Loader2 className="w-5 h-5 text-gold animate-spin" />
              <span className="ml-3 text-muted-foreground text-sm">
                Verifying access...
              </span>
            </div>
          )}

          <p className="text-center text-xs text-muted-foreground mt-7">
            Protected by Internet Identity
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
