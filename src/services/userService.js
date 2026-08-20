import {
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  collection,
  query,
  where,
  increment,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

/** Real-time subscription to a user's own profile doc (role, balance, allowance, ...). */
export function subscribeToUserProfile(uid, callback) {
  return onSnapshot(doc(db, 'users', uid), (snap) => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  });
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Real-time list of every child linked to this parent. Queried by `parentId`
 * on the child's own doc, so there's no array of child IDs on the parent doc
 * to keep in sync — Firestore's query does that bookkeeping for us.
 */
export function subscribeToLinkedChildren(parentUid, callback) {
  const q = query(collection(db, 'users'), where('parentId', '==', parentUid));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

/** Parent sets (or updates) the child's monthly allowance limit. */
export async function setMonthlyAllowance(childUid, amount) {
  await updateDoc(doc(db, 'users', childUid), { monthlyAllowance: amount });
}

/**
 * Parent pays out funds into the child's spendable balance (e.g. the monthly
 * allowance, or a bonus). Uses Firestore's atomic `increment` so this is safe
 * even if the child is simultaneously spending from the same balance field.
 */
export async function depositAllowance(childUid, amount) {
  await updateDoc(doc(db, 'users', childUid), { balance: increment(amount) });
}

/** Child saves their Essentials/Fun/Savings percentage split. */
export async function updateBudgetSplit(uid, split) {
  await updateDoc(doc(db, 'users', uid), { budgetSplit: split });
}
