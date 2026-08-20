import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';

// Excludes visually ambiguous characters (0/O, 1/I) so codes are easy to read aloud/copy.
function generateLinkCode(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

/**
 * Registers a parent account and generates a shareable link code. The code is
 * mirrored into a top-level `linkCodes/{code}` doc so a not-yet-authenticated
 * child can resolve "ABC123" -> parentId during signup without needing read
 * access to the `users` collection (see firestore.rules).
 */
export async function registerParent({ name, email, password }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });

  const linkCode = generateLinkCode();

  await setDoc(doc(db, 'users', cred.user.uid), {
    name,
    email,
    role: 'parent',
    linkCode,
    createdAt: serverTimestamp(),
  });

  await setDoc(doc(db, 'linkCodes', linkCode), { parentId: cred.user.uid });

  return cred.user;
}

/**
 * Registers a child account, linking it to a parent via the code the parent
 * shared. Throws 'INVALID_LINK_CODE' if the code doesn't resolve.
 */
export async function registerChild({ name, email, password, linkCode }) {
  const codeSnap = await getDoc(doc(db, 'linkCodes', linkCode));
  if (!codeSnap.exists()) {
    throw new Error('INVALID_LINK_CODE');
  }
  const { parentId } = codeSnap.data();

  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });

  await setDoc(doc(db, 'users', cred.user.uid), {
    name,
    email,
    role: 'child',
    parentId,
    balance: 0,
    monthlyAllowance: 0,
    budgetSplit: { essentials: 50, fun: 30, savings: 20 },
    createdAt: serverTimestamp(),
  });

  return cred.user;
}

export async function login({ email, password }) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function logout() {
  await signOut(auth);
}
