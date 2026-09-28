import React, { useState } from "react";
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  KeyRound, 
  CheckCircle2, 
  Sparkles, 
  Shield, 
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Database,
  ArrowRight
} from "lucide-react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./components/Toast";
import { Navbar } from "./components/Navbar";
import { AuthCard } from "./components/AuthCard";
import { EmailVerificationBanner } from "./components/EmailVerificationBanner";
import { UserDashboard } from "./components/UserDashboard";
import { firebaseConfig } from "./firebase";

const MainContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [authCardMode, setAuthCardMode] = useState<"signin" | "signup">("signin");

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Shield className="w-8 h-8 animate-pulse" />
          </div>
          <div className="absolute inset-0 rounded-2xl border-2 border-indigo-500 border-t-transparent animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="font-bold text-base tracking-tight">Initializing Firebase Auth...</h3>
          <p className="text-xs text-slate-400 font-mono">Connecting to {firebaseConfig.projectId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <Navbar onOpenAuthModal={() => setAuthCardMode("signin")} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {user ? (
          /* LOGGED IN VIEW */
          <div className="space-y-6 animate-fadeIn">
            {/* Verification Banner */}
            <EmailVerificationBanner />

            {/* Dashboard and Account Management */}
            <UserDashboard />
          </div>
        ) : (
          /* LOGGED OUT / AUTHENTICATION LANDING VIEW */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero & Feature column */}
            <div className="lg:col-span-7 space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Production-Ready Firebase Authentication</span>
              </div>

              {/* Title & Description */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
                  Secure User Auth &{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-400">
                    Email Verification
                  </span>
                </h1>
                <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                  Enterprise-grade authentication system powered by Google Firebase. Features email registration, cryptographic verification flows, real-time password strength enforcement, and comprehensive profile security.
                </p>
              </div>

              {/* Core Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-white text-sm">Email Verification Flow</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Automated email dispatch, 60s anti-spam cooldown, and instant server-side token reload without re-login.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-white text-sm">Password Security Meter</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Real-time 5-point entropy scoring for uppercase, lowercase, digits, symbols, and length standards.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-white text-sm">User Management & Profile</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Update display names, select avatar presets, secure credential change, and account deletion gates.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-white text-sm">Self-Service Password Reset</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Seamless recovery workflow sending secure OOB action links directly to registered email addresses.
                  </p>
                </div>
              </div>

              {/* Connected Project Details */}
              <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Connected Project: <strong className="text-slate-200 font-mono">{firebaseConfig.projectId}</strong></span>
                </div>
                <span className="font-mono text-[11px] text-indigo-400 bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                  Firebase SDK v11+
                </span>
              </div>
            </div>

            {/* Right Auth Card Form */}
            <div className="lg:col-span-5 flex justify-center">
              <AuthCard initialMode={authCardMode} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            <span className="text-slate-400 font-medium">SecureAuth Platform</span>
            <span>—</span>
            <span>Firebase Authentication & Verification</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Project: <code className="text-indigo-400">{firebaseConfig.projectId}</code></span>
            <span>•</span>
            <span>Auth Domain: <code className="text-indigo-400">{firebaseConfig.authDomain}</code></span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainContent />
      </AuthProvider>
    </ToastProvider>
  );
}
