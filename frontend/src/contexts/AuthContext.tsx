import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

import { User, UserRole } from '@/types';
import { auth, db } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  signup: (name: string, email: string, password: string, phone: string, role: UserRole, aadhaar?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch user details from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as Omit<User, 'id'>;
            setUser({
              id: firebaseUser.uid,
              ...userData,
              email: firebaseUser.email || userData.email || ''
            });
          } else {
            // Fallback if firestore doc missing, though it should exist
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || 'User',
              role: 'parent', // Default
            });
          }
        } catch (error) {
          console.error("Error fetching user data from Firestore:", error);
          // Fallback to basic auth user if Firestore fails
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || 'User',
            role: 'parent', // Default
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    await signInWithEmailAndPassword(auth, email, password);
    // User state update is handled by onAuthStateChanged
  };

  const signup = async (name: string, email: string, password: string, phone: string, role: UserRole, aadhaar?: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Create user document in Firestore
    const newUser: Omit<User, 'id'> = {
      email,
      name,
      role,
      phone,
      aadhaar: aadhaar || '',
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), newUser);

    // User state update is handled by onAuthStateChanged
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, loading }}>
      {loading ? (
        <div className="h-screen w-screen flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

