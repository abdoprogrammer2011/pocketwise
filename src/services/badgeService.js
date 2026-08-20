import {
  collection,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

// Central badge catalogue. `icon` must match a component name exported by
// lucide-react (BadgesSection resolves it dynamically via `Icons[def.icon]`).
// To add a new badge: add an entry here, add its name/desc translation keys
// in i18n/translations.js, and call awardBadgeIfNew() wherever it's earned.
export const BADGE_DEFINITIONS = {
  first_step: { icon: 'Footprints', color: 'from-sky-400 to-sky-600' },
  goal_getter: { icon: 'Trophy', color: 'from-amber-400 to-amber-600' },
  saver_streak: { icon: 'Flame', color: 'from-orange-400 to-orange-600' },
  smart_spender: { icon: 'Brain', color: 'from-violet-400 to-violet-600' },
  planner: { icon: 'ClipboardList', color: 'from-emerald-400 to-emerald-600' },
  big_saver: { icon: 'Gem', color: 'from-pink-400 to-pink-600' },
};

export function subscribeToBadges(uid, callback) {
  const q = query(collection(db, 'users', uid, 'badges'), orderBy('earnedAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

/**
 * Awards a badge exactly once. Using the badge key as the document ID makes
 * this naturally idempotent — re-awarding an already-earned badge is a
 * harmless no-op — so callers can invoke it liberally after any relevant
 * action (new expense, completed goal, etc.) without tracking state themselves.
 */
export async function awardBadgeIfNew(uid, badgeKey) {
  if (!BADGE_DEFINITIONS[badgeKey]) return false;
  const badgeRef = doc(db, 'users', uid, 'badges', badgeKey);
  const snap = await getDoc(badgeRef);
  if (snap.exists()) return false;
  await setDoc(badgeRef, { badgeKey, earnedAt: serverTimestamp() });
  return true;
}
