/**
 * Authentication Context
 * Manages user authentication state and profile data.
 */

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { subscribeToAuth } from '../services/auth';
import { getUserProfile, subscribeToUserProfile } from '../services/firestore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribeAuth = null;
    let unsubscribeProfile = null;

    const initAuth = async () => {
      unsubscribeAuth = subscribeToAuth(async (firebaseUser) => {
        if (firebaseUser) {
          setUser(firebaseUser);

          // Subscribe to real-time profile updates
          unsubscribeProfile = subscribeToUserProfile(firebaseUser.uid, (userProfile) => {
            setProfile(userProfile);
            setLoading(false);
          });
        } else {
          setUser(null);
          setProfile(null);
          setLoading(false);
          if (unsubscribeProfile) {
            unsubscribeProfile();
            unsubscribeProfile = null;
          }
        }
      });
    };

    initAuth();

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const freshProfile = await getUserProfile(user.uid);
      setProfile(freshProfile);
    }
  }, [user]);

  const value = {
    user,
    profile,
    loading,
    error,
    isAuthenticated: !!user,
    isChild: profile?.role === 'child',
    isParent: profile?.role === 'parent',
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}