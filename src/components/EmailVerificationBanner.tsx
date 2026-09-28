import React, { useState } from "react";
import { Mail, CheckCircle2, RefreshCw, AlertTriangle, Send, Sparkles, ExternalLink } from "lucide-react";
import confetti from "canvas-confetti";
import { useAuth } from "../context/AuthContext";
import { useToast } from "./Toast";
import { formatAuthError } from "../firebase";

export const EmailVerificationBanner: React.FC = () => {
  const { user, isEmailVerified, sendVerification, refreshUserStatus, cooldownSeconds } = useAuth();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSending, setIsSending] = useState(false);

  if (!user) return null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const verified = await refreshUserStatus();
      if (verified) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        toast({
          type: "success",
          title: "Email Verified Successfully!",
          message: "Your email address has been verified. You now have full secure access."
        });
      } else {
        toast({
          type: "info",
          title: "Not Verified Yet",
          message: "Please check your inbox, click the verification link in the email, and then click Refresh again."
        });
      }
    } catch (err) {
      toast({
        type: "error",
        title: "Check Failed",
        message: "Could not refresh verification status. Please try again."
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleResend = async () => {
    if (cooldownSeconds > 0) return;
    setIsSending(true);
    try {
      await sendVerification();
      toast({
        type: "success",
        title: "Verification Email Sent",
        message: `A new verification email has been sent to ${user.email}. Check your inbox and spam folder.`
      });
    } catch (err) {
      const formatted = formatAuthError(err);
      toast({
        type: "error",
        title: formatted.title,
        message: formatted.message
      });
    } finally {
      setIsSending(false);
    }
  };

  if (isEmailVerified) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/60 via-slate-900/60 to-emerald-950/60 p-4 sm:p-5 shadow-lg backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white">Email Address Verified</h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Sparkles className="w-3 h-3" /> Secure
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Your account ({user.email}) is authenticated and verified with Firebase Auth.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-500/20">
            <span>Identity Confirmed</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/70 via-slate-900/90 to-amber-950/70 p-4 sm:p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-400 mt-0.5">
            <Mail className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-white text-base">Please Verify Your Email</h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                Action Required
              </span>
            </div>
            <p className="text-sm text-slate-300">
              We dispatched an activation link to <strong className="text-amber-200 underline underline-offset-2">{user.email}</strong>. Click the link in your email to secure your account.
            </p>
            <div className="flex items-center gap-3 pt-1 text-xs text-slate-400 flex-wrap">
              <span className="flex items-center gap-1 text-amber-400/90">
                <AlertTriangle className="w-3.5 h-3.5" /> Check Spam/Junk folder if not in inbox
              </span>
              <span>•</span>
              <span>Sender: noreply@ai-civic-intelligence.firebaseapp.com</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 pt-2 md:pt-0">
          <button
            onClick={handleResend}
            disabled={isSending || cooldownSeconds > 0}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            {cooldownSeconds > 0 ? (
              <span>Resend in {cooldownSeconds}s</span>
            ) : isSending ? (
              <span>Sending...</span>
            ) : (
              <span>Resend Email</span>
            )}
          </button>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-amber-500/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Checking..." : "I've Verified"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
