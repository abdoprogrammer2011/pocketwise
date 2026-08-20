import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { awardBadgeIfNew } from './badgeService';

/** Real-time list of a user's savings goals, most recent first. */
export function subscribeToGoals(uid, callback) {
  const q = query(collection(db, 'users', uid, 'goals'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function addGoal(uid, { title, targetAmount, icon = 'PiggyBank' }) {
  await addDoc(collection(db, 'users', uid, 'goals'), {
    title,
    targetAmount: Number(targetAmount),
    currentAmount: 0,
    completed: false,
    icon,
    createdAt: serverTimestamp(),
  });
}

/**
 * Moves money from the child's spendable balance into a goal. Runs as a
 * transaction so the balance can never go negative (even under rapid
 * double-taps), and awards the "goal_getter" badge the instant a goal first
 * crosses its target — this is the digital piggy bank's core write path.
 */
export async function contributeToGoal(uid, goal, amount) {
  const userRef = doc(db, 'users', uid);
  const goalRef = doc(db, 'users', uid, 'goals', goal.id);
  let justCompleted = false;

  await runTransaction(db, async (transaction) => {
    const userSnap = await transaction.get(userRef);
    const goalSnap = await transaction.get(goalRef);
    const balance = userSnap.data().balance || 0;

    if (balance < amount) throw new Error('INSUFFICIENT_BALANCE');

    const newCurrent = (goalSnap.data().currentAmount || 0) + Number(amount);
    const target = goalSnap.data().targetAmount;
    const wasCompleted = goalSnap.data().completed;
    const completed = newCurrent >= target;
    justCompleted = completed && !wasCompleted;

    transaction.update(goalRef, { currentAmount: newCurrent, completed });
    transaction.update(userRef, { balance: balance - Number(amount) });
  });

  if (justCompleted) await awardBadgeIfNew(uid, 'goal_getter');
  return { justCompleted };
}

export async function deleteGoal(uid, goalId) {
  await deleteDoc(doc(db, 'users', uid, 'goals', goalId));
}
