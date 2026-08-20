import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { subscribeToUserProfile } from '../services/userService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null); // Firestore users/{uid} doc: { role, name, balance, ... }
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  // Listens for sign-in/sign-out. This is the single source of truth for
  // "is anyone logged in", separate from the Firestore profile below.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthLoading(false);
      if (!user) {
        setProfile(null);
        setProfileLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  // Once we know who's logged in, keep their Firestore profile live — this is
  // what makes balance/allowance changes (from either the child's or the
  // parent's device) show up instantly without a page refresh.
  useEffect(() => {
    if (!firebaseUser) return;
    setProfileLoading(true);
    const unsubscribe = subscribeToUserProfile(firebaseUser.uid, (data) => {
      setProfile(data);
      setProfileLoading(false);
    });
    return unsubscribe;
  }, [firebaseUser]);

  const value = {
    user: firebaseUser,
    profile,
    role: profile?.role || null,
    loading: authLoading || (!!firebaseUser && profileLoading),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
