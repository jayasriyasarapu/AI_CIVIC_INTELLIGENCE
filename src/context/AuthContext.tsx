import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { 
  type User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser
} from "firebase/auth";
import { auth, googleProvider, formatAuthError } from "../firebase";

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isEmailVerified: boolean;
  cooldownSeconds: number;
  lastVerificationSentAt: number | null;
  signUp: (email: string, pass: string, name: string) => Promise<User>;
  signIn: (email: string, pass: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  sendVerification: () => Promise<boolean>;
  refreshUserStatus: () => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<boolean>;
  updateName: (newName: string) => Promise<void>;
  updateAvatar: (avatarUrl: string) => Promise<void>;
  changePassword: (oldPass: string, newPass: string) => Promise<void>;
  deleteAccount: (currentPass?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const COOLDOWN_DURATION = 60; // 60 seconds rate-limit between resending verification emails

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [lastVerificationSentAt, setLastVerificationSentAt] = useState<number | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);

  // Sync auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsEmailVerified(currentUser ? currentUser.emailVerified : false);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Cooldown countdown timer for resending verification email
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  // Sign Up with Email and Password + auto-send verification
  const signUp = useCallback(async (email: string, pass: string, name: string): Promise<User> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    const createdUser = userCredential.user;

    // Update display name
    if (name.trim()) {
      await updateProfile(createdUser, { displayName: name.trim() });
    }

    // Attempt to automatically send verification email
    try {
      await sendEmailVerification(createdUser);
      setLastVerificationSentAt(Date.now());
      setCooldownSeconds(COOLDOWN_DURATION);
    } catch (verifErr) {
      console.warn("Failed to auto-send initial verification email:", verifErr);
    }

    // Refresh state
    await createdUser.reload();
    setUser({ ...auth.currentUser! });
    setIsEmailVerified(auth.currentUser?.emailVerified ?? false);

    return auth.currentUser!;
  }, []);

  // Sign In with Email and Password
  const signIn = useCallback(async (email: string, pass: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
    const signedInUser = userCredential.user;
    setUser(signedInUser);
    setIsEmailVerified(signedInUser.emailVerified);
    return signedInUser;
  }, []);

  // Sign In with Google
  const signInWithGoogle = useCallback(async (): Promise<User> => {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const signedInUser = userCredential.user;
    setUser(signedInUser);
    setIsEmailVerified(signedInUser.emailVerified);
    return signedInUser;
  }, []);

  // Manual Trigger: Send Verification Email
  const sendVerification = useCallback(async (): Promise<boolean> => {
    if (!auth.currentUser) throw new Error("No authenticated user found.");
    if (cooldownSeconds > 0) {
      throw new Error(`Please wait ${cooldownSeconds} seconds before requesting another verification email.`);
    }

    await sendEmailVerification(auth.currentUser);
    setLastVerificationSentAt(Date.now());
    setCooldownSeconds(COOLDOWN_DURATION);
    return true;
  }, [cooldownSeconds]);

  // Check / Refresh User verification status from server
  const refreshUserStatus = useCallback(async (): Promise<boolean> => {
    if (!auth.currentUser) return false;
    await auth.currentUser.reload();
    const updated = auth.currentUser;
    setUser(updated ? { ...updated } as User : null);
    const verified = updated ? updated.emailVerified : false;
    setIsEmailVerified(verified);
    return verified;
  }, []);

  // Password Reset Email
  const sendPasswordReset = useCallback(async (email: string): Promise<boolean> => {
    await sendPasswordResetEmail(auth, email.trim());
    return true;
  }, []);

  // Update Display Name
  const updateName = useCallback(async (newName: string): Promise<void> => {
    if (!auth.currentUser) throw new Error("No authenticated user found.");
    await updateProfile(auth.currentUser, { displayName: newName.trim() });
    await auth.currentUser.reload();
    setUser({ ...auth.currentUser } as User);
  }, []);

  // Update Avatar URL
  const updateAvatar = useCallback(async (avatarUrl: string): Promise<void> => {
    if (!auth.currentUser) throw new Error("No authenticated user found.");
    await updateProfile(auth.currentUser, { photoURL: avatarUrl.trim() });
    await auth.currentUser.reload();
    setUser({ ...auth.currentUser } as User);
  }, []);

  // Change Password
  const changePassword = useCallback(async (oldPass: string, newPass: string): Promise<void> => {
    if (!auth.currentUser || !auth.currentUser.email) {
      throw new Error("No authenticated user found.");
    }
    // Re-authenticate
    const cred = EmailAuthProvider.credential(auth.currentUser.email, oldPass);
    await reauthenticateWithCredential(auth.currentUser, cred);
    // Update password
    await updatePassword(auth.currentUser, newPass);
  }, []);

  // Delete User Account
  const deleteAccount = useCallback(async (currentPass?: string): Promise<void> => {
    if (!auth.currentUser) throw new Error("No authenticated user found.");
    const isPasswordProvider = auth.currentUser.providerData.some(p => p.providerId === 'password');
    if (isPasswordProvider && currentPass && auth.currentUser.email) {
      const cred = EmailAuthProvider.credential(auth.currentUser.email, currentPass);
      await reauthenticateWithCredential(auth.currentUser, cred);
    }
    await deleteUser(auth.currentUser);
    setUser(null);
    setIsEmailVerified(false);
  }, []);

  // Logout
  const logout = useCallback(async (): Promise<void> => {
    await firebaseSignOut(auth);
    setUser(null);
    setIsEmailVerified(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isEmailVerified,
        cooldownSeconds,
        lastVerificationSentAt,
        signUp,
        signIn,
        signInWithGoogle,
        sendVerification,
        refreshUserStatus,
        sendPasswordReset,
        updateName,
        updateAvatar,
        changePassword,
        deleteAccount,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
