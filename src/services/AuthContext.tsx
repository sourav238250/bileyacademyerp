import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  fbSignOut,
  onAuthStateChanged,
  User,
} from './firebase';
import { AdminUser, AdminRole } from '../types';
import { firebaseSyncService } from './firestoreSync';

interface AuthContextType {
  firebaseUser: User | null;
  currentAdmin: AdminUser | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<AdminUser | null>;
  loginAsDemoRole: (roleUser: AdminUser) => void;
  signOut: () => Promise<void>;
  syncStatus: {
    isConnected: boolean;
    isSyncing: boolean;
    lastSyncedAt: Date | null;
    error: string | null;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_STORAGE_KEY = 'biley_academy_admin_user_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(() => {
    try {
      const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState({
    isConnected: true,
    isSyncing: false,
    lastSyncedAt: null as Date | null,
    error: null as string | null,
  });

  useEffect(() => {
    // Listen to Firebase auth state
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        // Map Google user to ERP Admin user
        const adminProfile: AdminUser = {
          id: user.uid,
          name: user.displayName || 'Authorized Staff',
          email: user.email || 'staff@bileyacademy.edu',
          role: 'Super Admin / Director',
          designation: 'Google Authenticated Director & Admin',
          avatarUrl: user.photoURL || undefined,
          lastLogin: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setCurrentAdmin(adminProfile);
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminProfile));
      }
      setIsLoading(false);
    });

    // Listen to real-time Firestore sync status
    const unsubscribeSync = firebaseSyncService.subscribeToStatus((status) => {
      setSyncStatus(status);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeSync();
    };
  }, []);

  const signInWithGoogle = async (): Promise<AdminUser | null> => {
    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const adminProfile: AdminUser = {
        id: user.uid,
        name: user.displayName || 'Authorized Administrator',
        email: user.email || 'admin@bileyacademy.edu',
        role: 'Super Admin / Director',
        designation: 'Verified Google Director Account',
        avatarUrl: user.photoURL || undefined,
        lastLogin: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setCurrentAdmin(adminProfile);
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminProfile));
      setIsLoading(false);
      return adminProfile;
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      setIsLoading(false);
      throw err;
    }
  };

  const loginAsDemoRole = (roleUser: AdminUser) => {
    const updated = {
      ...roleUser,
      lastLogin: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setCurrentAdmin(updated);
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(updated));
  };

  const signOut = async () => {
    try {
      if (firebaseUser) {
        await fbSignOut(auth);
      }
    } catch (e) {
      console.warn('Firebase signout error:', e);
    } finally {
      setCurrentAdmin(null);
      setFirebaseUser(null);
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        currentAdmin,
        isLoading,
        signInWithGoogle,
        loginAsDemoRole,
        signOut,
        syncStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
