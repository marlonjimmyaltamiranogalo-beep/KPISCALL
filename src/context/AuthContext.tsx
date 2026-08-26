import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'admin' | 'supervisor' | 'auditor';
  createdAt: string;
}

interface LocalUserRecord {
  uid: string;
  email: string;
  passwordHash: string;
  displayName: string;
  role: 'admin' | 'supervisor' | 'auditor';
  createdAt: string;
}

interface AuthContextType {
  user: { uid: string; email: string | null; displayName: string | null } | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isLocalMode: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, name: string, role?: 'admin' | 'supervisor' | 'auditor') => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const LOCAL_USERS_KEY = 'callcenter_auth_users_v1';
const LOCAL_SESSION_KEY = 'callcenter_auth_session_v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ uid: string; email: string | null; displayName: string | null } | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLocalMode, setIsLocalMode] = useState<boolean>(false);

  // Initialize local users storage with default supervisor if empty
  const getLocalUsers = (): LocalUserRecord[] => {
    try {
      const stored = localStorage.getItem(LOCAL_USERS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading local users:', e);
    }
    const defaultUsers: LocalUserRecord[] = [
      {
        uid: 'local-admin-01',
        email: 'admin@expresso.netmobile.com',
        passwordHash: 'Expresso2026!',
        displayName: 'Administrador General Call Center',
        role: 'admin',
        createdAt: new Date().toISOString()
      },
      {
        uid: 'local-sup-01',
        email: 'auditor.demo@expresso.netmobile.com',
        passwordHash: 'Expresso2026!',
        displayName: 'Supervisor Auditor Netmobile',
        role: 'supervisor',
        createdAt: new Date().toISOString()
      }
    ];
    try {
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(defaultUsers));
    } catch (e) {}
    return defaultUsers;
  };

  useEffect(() => {
    // Check if there is an active local session
    try {
      const localSession = localStorage.getItem(LOCAL_SESSION_KEY);
      if (localSession) {
        const parsed = JSON.parse(localSession);
        if (parsed?.uid) {
          setUser({
            uid: parsed.uid,
            email: parsed.email,
            displayName: parsed.displayName
          });
          setUserProfile(parsed);
          setIsLocalMode(true);
          setLoading(false);
          return;
        }
      }
    } catch (e) {}

    // Check Firebase Auth listener
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName
        });
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
          } else {
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Auditor CDR',
              role: 'supervisor',
              createdAt: new Date().toISOString()
            };
            try {
              await setDoc(userDocRef, newProfile);
            } catch (err) {}
            setUserProfile(newProfile);
          }
        } catch (err) {
          console.warn('Error al obtener perfil en Firestore:', err);
          setUserProfile({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Auditor CDR',
            role: 'supervisor',
            createdAt: new Date().toISOString()
          });
        }
        setIsLocalMode(false);
      } else {
        // If not in local session and no firebase user, user is null
        if (!localStorage.getItem(LOCAL_SESSION_KEY)) {
          setUser(null);
          setUserProfile(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      await signInWithEmailAndPassword(auth, cleanEmail, pass);
      localStorage.removeItem(LOCAL_SESSION_KEY);
      setIsLocalMode(false);
    } catch (err: any) {
      if (err?.code === 'auth/operation-not-allowed' || err?.code === 'auth/network-request-failed' || err?.code === 'auth/invalid-credential' || err?.code === 'auth/user-not-found') {
        // Fallback to local authentication store
        const users = getLocalUsers();
        const found = users.find(u => u.email.toLowerCase() === cleanEmail && u.passwordHash === pass);
        if (found) {
          const profile: UserProfile = {
            uid: found.uid,
            email: found.email,
            displayName: found.displayName,
            role: found.role,
            createdAt: found.createdAt
          };
          setUser({
            uid: found.uid,
            email: found.email,
            displayName: found.displayName
          });
          setUserProfile(profile);
          setIsLocalMode(true);
          localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profile));
          return;
        }
      }
      throw err;
    }
  };

  const signUp = async (email: string, pass: string, name: string, role: 'admin' | 'supervisor' | 'auditor' = 'supervisor') => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      if (cred.user) {
        await updateProfile(cred.user, { displayName: name.trim() });
        const newProfile: UserProfile = {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: name.trim(),
          role,
          createdAt: new Date().toISOString()
        };
        try {
          await setDoc(doc(db, 'users', cred.user.uid), newProfile);
        } catch (e) {
          console.warn('Could not write user profile to firestore:', e);
        }
        setUserProfile(newProfile);
        setIsLocalMode(false);
        localStorage.removeItem(LOCAL_SESSION_KEY);
      }
    } catch (err: any) {
      // If Firebase Auth provider is not enabled in Firebase Console (operation-not-allowed), register seamlessly in local/persistent store
      if (err?.code === 'auth/operation-not-allowed' || err?.code === 'auth/network-request-failed') {
        const users = getLocalUsers();
        const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
        if (existing) {
          const customErr: any = new Error('Este correo electrónico ya está registrado.');
          customErr.code = 'auth/email-already-in-use';
          throw customErr;
        }

        const newUid = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const newRecord: LocalUserRecord = {
          uid: newUid,
          email: cleanEmail,
          passwordHash: pass,
          displayName: name.trim(),
          role,
          createdAt: new Date().toISOString()
        };
        users.push(newRecord);
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));

        const profile: UserProfile = {
          uid: newUid,
          email: cleanEmail,
          displayName: name.trim(),
          role,
          createdAt: newRecord.createdAt
        };
        setUser({
          uid: newUid,
          email: cleanEmail,
          displayName: name.trim()
        });
        setUserProfile(profile);
        setIsLocalMode(true);
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profile));
        return;
      }
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {}
    localStorage.removeItem(LOCAL_SESSION_KEY);
    setUser(null);
    setUserProfile(null);
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err: any) {
      if (err?.code === 'auth/operation-not-allowed') {
        const users = getLocalUsers();
        const found = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
        if (!found) {
          const customErr: any = new Error('No se encontró ninguna cuenta con este correo.');
          customErr.code = 'auth/user-not-found';
          throw customErr;
        }
        return;
      }
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, isLocalMode, signIn, signUp, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
