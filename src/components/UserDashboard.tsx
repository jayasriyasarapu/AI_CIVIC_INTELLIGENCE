import React, { useState } from "react";
import { 
  User as UserIcon, 
  Mail, 
  ShieldCheck, 
  ShieldAlert, 
  Key, 
  Clock, 
  Copy, 
  Check, 
  LogOut, 
  Trash2, 
  Settings, 
  Terminal, 
  Sparkles, 
  ExternalLink, 
  Lock, 
  AlertTriangle,
  RefreshCw,
  Send,
  Eye,
  EyeOff
} from "lucide-react";
import confetti from "canvas-confetti";
import { useAuth } from "../context/AuthContext";
import { useToast } from "./Toast";
import { PasswordStrengthMeter, checkPasswordStrength } from "./PasswordStrengthMeter";
import { firebaseConfig, formatAuthError } from "../firebase";

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
];

export const UserDashboard: React.FC = () => {
  const { 
    user, 
    isEmailVerified, 
    logout, 
    sendVerification, 
    refreshUserStatus, 
    updateName, 
    updateAvatar, 
    changePassword, 
    deleteAccount,
    cooldownSeconds,
    sendPasswordReset
  } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"overview" | "profile" | "security" | "diagnostics">("overview");

  // Profile Form state
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.photoURL || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password Change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Delete Account modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Copy helpers
  const [copiedUid, setCopiedUid] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Status refresh
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false);
  const [isSendingVerif, setIsSendingVerif] = useState(false);

  if (!user) return null;

  const isPasswordUser = user.providerData.some((p) => p.providerId === "password");

  // Copy to clipboard
  const handleCopy = (text: string, type: "uid" | "email") => {
    navigator.clipboard.writeText(text);
    if (type === "uid") {
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    } else {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
    toast({
      type: "info",
      title: "Copied to Clipboard",
      message: `${type === "uid" ? "User ID" : "Email"} copied successfully.`
    });
  };

  // Refresh email status
  const handleRefreshStatus = async () => {
    setIsRefreshingStatus(true);
    try {
      const verified = await refreshUserStatus();
      if (verified) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
        toast({
          type: "success",
          title: "Account Verified!",
          message: "Firebase reports your email address is verified."
        });
      } else {
        toast({
          type: "info",
          title: "Still Unverified",
          message: "Check your email and click the verification link, then try again."
        });
      }
    } catch (err) {
      toast({
        type: "error",
        title: "Check Failed",
        message: "Could not refresh verification status."
      });
    } finally {
      setIsRefreshingStatus(false);
    }
  };

  // Send verification
  const handleSendVerification = async () => {
    if (cooldownSeconds > 0) return;
    setIsSendingVerif(true);
    try {
      await sendVerification();
      toast({
        type: "success",
        title: "Verification Email Sent",
        message: `Activation link sent to ${user.email}. Check inbox & spam.`
      });
    } catch (err) {
      const formatted = formatAuthError(err);
      toast({
        type: "error",
        title: formatted.title,
        message: formatted.message
      });
    } finally {
      setIsSendingVerif(false);
    }
  };

  // Save profile updates
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      if (displayName !== user.displayName) {
        await updateName(displayName);
      }
      if (avatarUrl !== user.photoURL) {
        await updateAvatar(avatarUrl);
      }
      toast({
        type: "success",
        title: "Profile Updated",
        message: "Your profile details have been saved."
      });
    } catch (err) {
      const formatted = formatAuthError(err);
      toast({
        type: "error",
        title: formatted.title,
        message: formatted.message
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast({ type: "error", title: "Missing Password", message: "Please enter your current password." });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast({ type: "error", title: "Mismatch", message: "New passwords do not match." });
      return;
    }
    const { score } = checkPasswordStrength(newPassword);
    if (score < 3) {
      toast({ type: "error", title: "Weak Password", message: "New password should be stronger." });
      return;
    }

    setIsChangingPass(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      toast({
        type: "success",
        title: "Password Changed",
        message: "Your password was updated successfully."
      });
    } catch (err) {
      const formatted = formatAuthError(err);
      toast({
        type: "error",
        title: formatted.title,
        message: formatted.message
      });
    } finally {
      setIsChangingPass(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount(isPasswordUser ? deleteConfirmPassword : undefined);
      toast({
        type: "info",
        title: "Account Deleted",
        message: "Your Firebase Auth account has been completely removed."
      });
    } catch (err) {
      const formatted = formatAuthError(err);
      toast({
        type: "error",
        title: formatted.title,
        message: formatted.message
      });
      setIsDeleting(false);
    }
  };

  // Calculate Security Score (0 to 100)
  const calculateSecurityScore = () => {
    let score = 30; // base score for having an account
    if (isEmailVerified) score += 40;
    if (user.displayName) score += 10;
    if (user.photoURL) score += 10;
    if (user.providerData.length > 0) score += 10;
    return score;
  };
  const securityScore = calculateSecurityScore();

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Top Profile Summary Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          {/* Avatar & Core Info */}
          <div className="flex items-center gap-5">
            <div className="relative group">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User avatar"}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500/50 shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-600/20 border border-indigo-400/30">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                </div>
              )}
              {isEmailVerified ? (
                <div
                  title="Verified Account"
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center border-2 border-slate-900 shadow"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              ) : (
                <div
                  title="Pending Verification"
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center border-2 border-slate-900 shadow"
                >
                  <AlertTriangle className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {user.displayName || "Authenticated User"}
                </h1>
                {isEmailVerified ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <ShieldAlert className="w-3.5 h-3.5" /> Unverified
                  </span>
                )}
              </div>

              {/* Email with copy */}
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{user.email}</span>
                <button
                  onClick={() => handleCopy(user.email || "", "email")}
                  className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                  title="Copy Email"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* UID with copy */}
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                <span>UID: {user.uid.substring(0, 14)}...</span>
                <button
                  onClick={() => handleCopy(user.uid, "uid")}
                  className="hover:text-slate-300 p-0.5 rounded transition-colors"
                  title="Copy full UID"
                >
                  {copiedUid ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions / Sign Out */}
          <div className="flex items-center gap-2.5 self-start md:self-center">
            <button
              onClick={() => logout()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-500/30 border border-slate-700/80 text-xs font-semibold text-slate-300 transition-all shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-t border-slate-800/80 mt-6 pt-4 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
              activeTab === "overview"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Overview & Verification</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
              activeTab === "profile"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Profile Settings</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
              activeTab === "security"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Security & Password</span>
          </button>

          <button
            onClick={() => setActiveTab("diagnostics")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
              activeTab === "diagnostics"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Firebase Diagnostics</span>
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & VERIFICATION HUB */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Security Score & Health card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-md">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Security Health</span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">{securityScore}%</span>
                <span className={`text-xs font-semibold ${securityScore >= 80 ? "text-emerald-400" : "text-amber-400"}`}>
                  {securityScore >= 80 ? "Well Protected" : "Action Needed"}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    securityScore >= 80 ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                  style={{ width: `${securityScore}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-3">
                {isEmailVerified
                  ? "Email verification active. Your account is protected."
                  : "Verify your email to boost your security health to 100%."}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-md">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account Created</span>
              <div className="mt-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-medium text-white">
                  {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  }) : "Recent"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-4">
                Registered via {user.providerData[0]?.providerId === "password" ? "Email & Password" : user.providerData[0]?.providerId || "Firebase Auth"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-md">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Last Sign-In</span>
              <div className="mt-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-400" />
                <span className="text-sm font-medium text-white">
                  {user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                    month: "short",
                    day: "numeric"
                  }) : "Just now"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-4">
                Session token valid and automatically refreshed.
              </p>
            </div>
          </div>

          {/* Email Verification Action Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <Mail className="w-5 h-5 text-indigo-400" />
                <h3 className="font-semibold text-white text-base">Email Verification Status</h3>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  isEmailVerified
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}
              >
                {isEmailVerified ? "Verified" : "Pending Verification"}
              </span>
            </div>

            <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 space-y-3">
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {isEmailVerified
                  ? `Your email address (${user.email}) has been verified. You have full access to all features, reset flows, and account safety mechanisms.`
                  : `A verification link has been dispatched to ${user.email}. Verification ensures you can recover your account and receive critical security alerts.`}
              </p>

              {!isEmailVerified && (
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleRefreshStatus}
                    disabled={isRefreshingStatus}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 disabled:opacity-50 transition-all"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingStatus ? "animate-spin" : ""}`} />
                    <span>{isRefreshingStatus ? "Checking status..." : "I've Verified (Refresh Status)"}</span>
                  </button>

                  <button
                    onClick={handleSendVerification}
                    disabled={isSendingVerif || cooldownSeconds > 0}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-50 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {cooldownSeconds > 0 ? (
                      <span>Resend in {cooldownSeconds}s</span>
                    ) : (
                      <span>Resend Verification Email</span>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Email Verification Troubleshooting Tips */}
            {!isEmailVerified && (
              <div className="border-t border-slate-800/80 pt-4 text-xs text-slate-400 space-y-1.5">
                <p className="font-semibold text-slate-300">Didn't receive the email?</p>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li>Check your <strong>Spam / Junk folder</strong> or promotional tab.</li>
                  <li>Search for emails from sender: <code className="text-indigo-300">noreply@ai-civic-intelligence.firebaseapp.com</code></li>
                  <li>Ensure the email address <span className="text-white">{user.email}</span> is correct.</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PROFILE SETTINGS */}
      {activeTab === "profile" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md">
          <h3 className="font-semibold text-white text-base mb-1">Profile Information</h3>
          <p className="text-xs text-slate-400 mb-6">
            Update your display name and avatar as stored in your Firebase User profile.
          </p>

          <form onSubmit={handleSaveProfile} className="space-y-6 max-w-xl">
            {/* Display Name */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Display Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Avatar URL or Presets */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Avatar Image URL</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl py-2.5 px-4 text-sm text-white placeholder-slate-500 outline-none transition-all"
              />

              <div className="mt-3">
                <span className="text-[11px] text-slate-400 block mb-2">Or choose a preset avatar:</span>
                <div className="flex items-center gap-3">
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(preset)}
                      className={`w-11 h-11 rounded-xl overflow-hidden border-2 transition-all ${
                        avatarUrl === preset ? "border-indigo-500 scale-105" : "border-slate-800 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={preset} alt={`Avatar preset ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl("")}
                      className="text-[11px] text-slate-400 hover:text-rose-400 underline ml-2"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingProfile}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {isSavingProfile ? "Saving Profile..." : "Save Changes"}
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: SECURITY & PASSWORD */}
      {activeTab === "security" && (
        <div className="space-y-6">
          {/* Change Password */}
          {isPasswordUser ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md">
              <h3 className="font-semibold text-white text-base mb-1">Change Account Password</h3>
              <p className="text-xs text-slate-400 mb-6">
                Requires your existing password to verify identity before saving new credentials.
              </p>

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Current Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showCurrentPass ? "text" : "password"}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 outline-none transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showNewPass ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 outline-none transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <PasswordStrengthMeter password={newPassword} />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="password"
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isChangingPass}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
                  >
                    {isChangingPass ? "Updating Password..." : "Update Password"}
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      if (user.email) {
                        await sendPasswordReset(user.email);
                        toast({
                          type: "success",
                          title: "Reset Email Sent",
                          message: `Password reset link sent to ${user.email}`
                        });
                      }
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline"
                  >
                    Or send password reset email
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md">
              <h3 className="font-semibold text-white text-base mb-1">Federated Google Authentication</h3>
              <p className="text-xs text-slate-400">
                You are authenticated via Google OAuth. Password changes are handled securely through your Google Account.
              </p>
            </div>
          )}

          {/* Danger Zone: Delete Account */}
          <div className="rounded-2xl border border-rose-900/40 bg-rose-950/20 p-6 backdrop-blur-md">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-rose-300 text-base flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Danger Zone: Delete Account
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  Permanently delete your user credentials from the Firebase Authentication project. This action cannot be undone.
                </p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-semibold transition-all shrink-0"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FIREBASE DIAGNOSTICS & SYSTEM INFO */}
      {activeTab === "diagnostics" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md space-y-6">
          <div>
            <h3 className="font-semibold text-white text-base flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" /> Firebase Authentication Diagnostics
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Active configuration parameters linked to project <strong className="text-indigo-300">{firebaseConfig.projectId}</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
              <span className="text-slate-500 block uppercase font-sans text-[11px] font-semibold">Firebase Project</span>
              <p className="text-white">Project ID: <span className="text-indigo-400">{firebaseConfig.projectId}</span></p>
              <p className="text-white">Auth Domain: <span className="text-indigo-400">{firebaseConfig.authDomain}</span></p>
              <p className="text-white">App ID: <span className="text-slate-400">{firebaseConfig.appId}</span></p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
              <span className="text-slate-500 block uppercase font-sans text-[11px] font-semibold">Client Environment</span>
              <p className="text-white">Current Host: <span className="text-emerald-400">{typeof window !== "undefined" ? window.location.hostname : "localhost"}</span></p>
              <p className="text-white">Protocol: <span className="text-slate-400">{typeof window !== "undefined" ? window.location.protocol : "https:"}</span></p>
              <p className="text-white">Auth State: <span className="text-emerald-400">Authenticated (Ready)</span></p>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 space-y-2">
            <h4 className="text-xs font-semibold text-slate-300">Firebase Console Settings Checklist:</h4>
            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Email/Password provider enabled under Authentication &gt; Sign-in method.</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Authorized domains contains your app host (<code className="text-indigo-300">{typeof window !== "undefined" ? window.location.hostname : ""}</code>).</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Action URL handler template is active for verification & password reset emails.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="rounded-3xl border border-rose-500/40 bg-slate-900 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-lg text-white">Confirm Account Deletion</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you completely sure? This will remove your account ({user.email}) from Firebase Authentication.
            </p>

            {isPasswordUser && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Enter your password to confirm:
                </label>
                <input
                  type="password"
                  value={deleteConfirmPassword}
                  onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                  placeholder="Your current password"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono outline-none"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting || (isPasswordUser && !deleteConfirmPassword)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
