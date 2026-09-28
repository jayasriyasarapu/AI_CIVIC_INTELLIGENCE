import React from "react";
import { ShieldCheck, LogOut, User, Mail, Sparkles, ExternalLink } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { firebaseConfig } from "../firebase";

export const Navbar: React.FC<{ onOpenAuthModal?: () => void }> = ({ onOpenAuthModal }) => {
  const { user, isEmailVerified, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                SecureAuth
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Firebase
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
              {firebaseConfig.projectId}
            </p>
          </div>
        </div>

        {/* Right side items */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Verification status pill */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 border border-slate-800">
                <span className={`w-2 h-2 rounded-full ${isEmailVerified ? "bg-emerald-400 shadow-sm shadow-emerald-400" : "bg-amber-400 animate-pulse"}`} />
                <span className={isEmailVerified ? "text-emerald-400" : "text-amber-400"}>
                  {isEmailVerified ? "Verified" : "Verification Needed"}
                </span>
              </div>

              {/* User indicator */}
              <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-5 h-5 rounded-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-indigo-400" />
                )}
                <span className="max-w-[120px] sm:max-w-[160px] truncate font-medium">
                  {user.displayName || user.email}
                </span>
              </div>

              {/* Sign out */}
              <button
                onClick={() => logout()}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 hidden sm:inline-block">
                Firebase Auth Active
              </span>
              <button
                onClick={onOpenAuthModal}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all"
              >
                Sign In / Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
