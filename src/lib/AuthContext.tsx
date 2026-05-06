import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthReady: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, isAuthReady: false });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    // Safety timeout: if auth doesn't respond in 8 seconds, mark it as ready
    // This prevents the app from being stuck on the loading screen in case of SDK initialization issues.
    const timeout = setTimeout(() => {
      if (!isAuthReady) {
        console.warn("Auth initialization timed out, proceeding as unauthenticated.");
        setLoading(false);
        setIsAuthReady(true);
      }
    }, 8000);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // Sync user to firestore
          const userRef = doc(db, 'users', user.uid);
          try {
            const userSnap = await getDoc(userRef);
            
            if (!userSnap.exists()) {
              await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                createdAt: new Date().toISOString()
              });
            }
          } catch (syncError) {
            console.warn("Could not sync user to Firestore (likely rules issue):", syncError);
            // We continue even if sync fails so the app is usable with local state
          }
          setUser(user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
      } finally {
        setLoading(false);
        setIsAuthReady(true);
        clearTimeout(timeout);
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthReady }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
