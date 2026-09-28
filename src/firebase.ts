import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  type AuthError 
} from "firebase/auth";

// Web app's Firebase configuration provided by the user
export const firebaseConfig = {
  apiKey: "AIzaSyCH_4TY4tiUGZSSIcFi7i2j65_b0QDb_BY",
  authDomain: "ai-civic-intelligence.firebaseapp.com",
  projectId: "ai-civic-intelligence",
  storageBucket: "ai-civic-intelligence.firebasestorage.app",
  messagingSenderId: "14773768926",
  appId: "1:14773768926:web:c02b017a418d53aa47684f"
};

// Initialize Firebase safely
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Human-friendly error translation for Firebase Authentication error codes
 */
export function formatAuthError(error: unknown): { title: string; message: string; code?: string } {
  if (!error) return { title: "Error", message: "An unknown error occurred. Please try again." };

  const authError = error as AuthError;
  const code = authError.code || "";

  switch (code) {
    case "auth/email-already-in-use":
      return {
        title: "Email Already Registered",
        message: "An account with this email address already exists. Please sign in instead or request a password reset.",
        code
      };
    case "auth/invalid-email":
      return {
        title: "Invalid Email Address",
        message: "Please enter a valid and properly formatted email address.",
        code
      };
    case "auth/weak-password":
      return {
        title: "Password Too Weak",
        message: "Your password should be at least 6 characters long and include a mix of letters, numbers, and symbols.",
        code
      };
    case "auth/user-not-found":
      return {
        title: "Account Not Found",
        message: "No user account was found with this email address. Please check your spelling or register a new account.",
        code
      };
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return {
        title: "Invalid Credentials",
        message: "The email or password you entered is incorrect. Please verify and try again.",
        code
      };
    case "auth/user-disabled":
      return {
        title: "Account Suspended",
        message: "This account has been disabled by an administrator. Please contact support.",
        code
      };
    case "auth/too-many-requests":
      return {
        title: "Access Temporarily Blocked",
        message: "We detected too many unusual requests or failed sign-in attempts. Access has been temporarily disabled. Please wait a few minutes or reset your password.",
        code
      };
    case "auth/operation-not-allowed":
      return {
        title: "Provider Not Enabled",
        message: "Email/Password sign-in is not yet enabled in the Firebase Console. Go to Firebase Console -> Authentication -> Sign-in method -> Email/Password and enable it.",
        code
      };
    case "auth/network-request-failed":
      return {
        title: "Network Connection Error",
        message: "Failed to connect to Firebase authentication servers. Please verify your internet connection.",
        code
      };
    case "auth/popup-closed-by-user":
      return {
        title: "Sign-In Cancelled",
        message: "The Google sign-in popup window was closed before finishing authentication.",
        code
      };
    case "auth/popup-blocked":
      return {
        title: "Popup Blocked",
        message: "The browser prevented the sign-in popup window from opening. Please allow popups for this site.",
        code
      };
    case "auth/unauthorized-domain":
      return {
        title: "Domain Not Authorized",
        message: `This domain (${typeof window !== 'undefined' ? window.location.hostname : 'current domain'}) must be authorized in Firebase Console -> Authentication -> Settings -> Authorized Domains.`,
        code
      };
    case "auth/requires-recent-login":
      return {
        title: "Re-Authentication Required",
        message: "This sensitive security action requires you to have signed in recently. Please log out and log back in, then retry.",
        code
      };
    case "auth/expired-action-code":
      return {
        title: "Link Expired",
        message: "This verification or reset link has expired. Please request a new one.",
        code
      };
    case "auth/invalid-action-code":
      return {
        title: "Invalid Link",
        message: "The action link is invalid or has already been used.",
        code
      };
    default:
      return {
        title: "Authentication Error",
        message: authError.message || "An unexpected error occurred during authentication.",
        code
      };
  }
}
