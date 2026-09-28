import React, { useState } from "react";
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  KeyRound,
  Sparkles,
  Info
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "./Toast";
import { PasswordStrengthMeter, checkPasswordStrength } from "./PasswordStrengthMeter";
import { formatAuthError } from "../firebase";

type AuthMode = "signin" | "signup" | "forgot";

interface AuthCardProps {
  initialMode?: AuthMode;
  onSuccess?: () => void;
}

export const AuthCard: React.FC<AuthCardProps> = ({ initialMode = "signin", onSuccess }) => {
  const { signIn, signUp, signInWithGoogle, sendPasswordReset } = useAuth();
  const { toast } = useToast();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [authError, setAuthError] = useState<{ title: string; message: string; code?: string } | null>(null);
  const [resetSentSuccess, setResetSentSuccess] = useState(false);

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    // Validations
    if (!email.trim()) {
      setAuthError({ title: "Email Required", message: "Please enter your email address." });
      return;
    }

    if (mode === "forgot") {
      setIsSubmitting(true);
      try {
        await sendPasswordReset(email);
        setResetSentSuccess(true);
        toast({
          type: "success",
          title: "Password Reset Email Dispatched",
          message: `Instructions to reset your password have been sent to ${email}.`
        });
      } catch (err) {
        const formatted = formatAuthError(err);
        setAuthError(formatted);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!password) {
      setAuthError({ title: "Password Required", message: "Please provide a password." });
      return;
    }

    if (mode === "signup") {
      if (password !== confirmPassword) {
        setAuthError({ title: "Passwords Do Not Match", message: "The confirmation password does not match the password entered above." });
        return;
      }

      const { score } = checkPasswordStrength(password);
      if (score < 2) {
        setAuthError({ title: "Weak Password", message: "Please choose a stronger password with at least 8 characters and varied characters." });
        return;
      }

      if (!agreeTerms) {
        setAuthError({ title: "Terms Agreement", message: "Please acknowledge the terms of service and security policy." });
        return;
      }

      setIsSubmitting(true);
      try {
        await signUp(email, password, name);
        toast({
          type: "success",
          title: "Account Created Successfully",
          message: "Welcome! A verification link has been sent to your email."
        });
        if (onSuccess) onSuccess();
      } catch (err) {
        const formatted = formatAuthError(err);
        setAuthError(formatted);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Sign in
      setIsSubmitting(true);
      try {
        await signIn(email, password);
        toast({
          type: "success",
          title: "Welcome Back!",
          message: "Successfully signed in."
        });
        if (onSuccess) onSuccess();
      } catch (err) {
        const formatted = formatAuthError(err);
        setAuthError(formatted);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setIsGoogleSubmitting(true);
    try {
      await signInWithGoogle();
      toast({
        type: "success",
        title: "Signed In with Google",
        message: "Successfully authenticated with Google."
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      const formatted = formatAuthError(err);
      setAuthError(formatted);
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Container Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl p-6 sm:p-8 relative overflow-hidden">
        {/* Decorative Top Accent Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-40 bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-sky-500/20 blur-3xl pointer-events-none" />

        {/* Header Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-5 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {mode === "signin" && "Sign In to Your Account"}
                {mode === "signup" && "Create Your Account"}
                {mode === "forgot" && "Reset Your Password"}
              </h2>
              <p className="text-xs text-slate-400">
                {mode === "signin" && "Enter your credentials to access your dashboard"}
                {mode === "signup" && "Sign up and verify your email for secure access"}
                {mode === "forgot" && "We'll send you an authorized reset link"}
              </p>
            </div>
          </div>
        </div>

        {/* Error Callout */}
        {authError && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-300">{authError.title}</p>
              <p className="mt-0.5 text-slate-300 leading-relaxed">{authError.message}</p>
              {authError.code === "auth/operation-not-allowed" && (
                <div className="mt-2 text-[11px] text-amber-300 bg-amber-950/50 p-2 rounded border border-amber-500/30">
                  Tip: In Firebase Console &gt; Authentication &gt; Sign-in method, ensure "Email/Password" is enabled.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reset Email Success State */}
        {mode === "forgot" && resetSentSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-white">Reset Link Dispatched</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                Check <span className="text-white font-medium">{email}</span> for a link to reset your password. If you don't see it within a couple of minutes, check your spam folder.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setResetSentSuccess(false);
                setMode("signin");
              }}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
            >
              Return to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name (Sign Up only) */}
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 transition-all outline-none"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Email Address
                </label>
                {mode === "signup" && (
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-400" /> Verification email sent
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 transition-all outline-none"
                />
              </div>
            </div>

            {/* Password (Sign In & Sign Up) */}
            {mode !== "forgot" && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Password
                  </label>
                  {mode === "signin" && (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthError(null);
                        setMode("forgot");
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 transition-all outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Meter on Sign Up */}
                {mode === "signup" && <PasswordStrengthMeter password={password} />}
              </div>
            )}

            {/* Confirm Password (Sign Up only) */}
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className={`w-full bg-slate-950/80 border rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 transition-all outline-none font-mono ${
                      confirmPassword && confirmPassword !== password
                        ? "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                        : "border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <p className="text-[11px] text-rose-400 mt-1">Passwords do not match</p>
                )}
              </div>
            )}

            {/* Terms checkbox for signup */}
            {mode === "signup" && (
              <label className="flex items-start gap-2.5 text-xs text-slate-400 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                />
                <span>
                  I agree to secure user management rules and acknowledge that Firebase Auth will send an email verification link.
                </span>
              </label>
            )}

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={isSubmitting || isGoogleSubmitting}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === "signin" && (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                  {mode === "signup" && (
                    <>
                      <span>Create Account & Send Verification</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                  {mode === "forgot" && (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Send Password Reset Link</span>
                    </>
                  )}
                </>
              )}
            </button>
          </form>
        )}

        {/* Divider for Google Sign In */}
        {mode !== "forgot" && !resetSentSuccess && (
          <div className="mt-5">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-[11px] uppercase tracking-wider text-slate-500 font-semibold absolute">
                or continue with
              </span>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting || isGoogleSubmitting}
              className="mt-4 w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-slate-200 text-sm font-medium transition-all shadow-sm active:scale-[0.99] disabled:opacity-50"
            >
              {isGoogleSubmitting ? (
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Google Account</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Footer Mode Switchers */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
          {mode === "signin" && (
            <p>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setAuthError(null);
                  setMode("signup");
                }}
                className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors ml-1"
              >
                Register now
              </button>
            </p>
          )}

          {mode === "signup" && (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setAuthError(null);
                  setMode("signin");
                }}
                className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors ml-1"
              >
                Sign In
              </button>
            </p>
          )}

          {mode === "forgot" && (
            <p>
              Remember your password?{" "}
              <button
                type="button"
                onClick={() => {
                  setAuthError(null);
                  setResetSentSuccess(false);
                  setMode("signin");
                }}
                className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors ml-1"
              >
                Back to Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
