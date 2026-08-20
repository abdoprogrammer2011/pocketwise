/**
 * Firebase Authentication Service
 * Handles email/password authentication and role-based profile setup.
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { createUserProfile, getUserProfile } from './firestore';
import { USER_ROLES } from '../constants';

/**
 * Register a new user and create their Firestore profile.
 */
export async function registerUser({ email, password, displayName, role, childCode }) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const user = credential.user;

  await updateProfile(user, { displayName });

  const profile = {
    uid: user.uid,
    email: user.email,
    displayName,
    role,
    linkedChildren: role === USER_ROLES.PARENT ? [] : undefined,
    linkedParent: role === USER_ROLES.CHILD ? null : undefined,
    childCode: role === USER_ROLES.CHILD ? childCode || generateChildCode(user.uid) : undefined,
    monthlyAllowance: 0,
    currency: 'USD',
  };

  await createUserProfile(user.uid, cleanUndefined(profile));
  return { user, profile: await getUserProfile(user.uid) };
}

/**
 * Sign in an existing user.
 */
export async function loginUser(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const profile = await getUserProfile(credential.user.uid);
  return { user: credential.user, profile };
}

/**
 * Sign out the current user.
 */
export function logoutUser() {
  return signOut(auth);
}

/**
 * Send a password reset email.
 */
export function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}

/**
 * Subscribe to Firebase auth state changes.
 */
export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

function generateChildCode(uid) {
  return `PW-${uid.slice(0, 6).toUpperCase()}`;
}

function cleanUndefined(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined));
}