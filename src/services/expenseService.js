import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

/** Real-time list of a user's expenses, most recent first. */
export function subscribeToExpenses(uid, callback) {
  const q = query(collection(db, 'users', uid, 'expenses'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

/** Real-time list of a user's expense folders (day/event groupings), most recent first. */
export function subscribeToFolders(uid, callback) {
  const q = query(collection(db, 'users', uid, 'folders'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

/**
 * Logs an expense and atomically:
 *  1. writes the expense record
 *  2. creates the target folder (if `folderId` wasn't given) or updates its running total
 *  3. decrements the child's spendable balance
 *
 * All three writes happen inside a single Firestore transaction, so the
 * balance can never drift out of sync with the underlying expense/folder docs
 * even if two devices (child + parent) write at the same moment.
 */
export async function addExpense(uid, { amount, category, note = '', date, folderId, folderName }) {
  const userRef = doc(db, 'users', uid);
  const newExpenseRef = doc(collection(db, 'users', uid, 'expenses'));
  const folderRef = folderId
    ? doc(db, 'users', uid, 'folders', folderId)
    : doc(collection(db, 'users', uid, 'folders'));

  const expenseDate = date || new Date().toISOString().slice(0, 10);

  await runTransaction(db, async (transaction) => {
    const userSnap = await transaction.get(userRef);
    if (!userSnap.exists()) throw new Error('USER_NOT_FOUND');

    const folderSnap = folderId ? await transaction.get(folderRef) : null;
    const currentBalance = userSnap.data().balance || 0;

    transaction.set(newExpenseRef, {
      amount: Number(amount),
      category,
      note,
      date: expenseDate,
      folderId: folderRef.id,
      createdAt: serverTimestamp(),
    });

    if (folderSnap?.exists()) {
      transaction.update(folderRef, {
        total: (folderSnap.data().total || 0) + Number(amount),
        expenseCount: (folderSnap.data().expenseCount || 0) + 1,
      });
    } else {
      transaction.set(folderRef, {
        name: folderName || expenseDate,
        date: expenseDate,
        total: Number(amount),
        expenseCount: 1,
        createdAt: serverTimestamp(),
      });
    }

    transaction.update(userRef, { balance: currentBalance - Number(amount) });
  });

  return { expenseId: newExpenseRef.id, folderId: folderRef.id };
}

/** Deletes an expense and reverses its effect on the balance and its folder's totals. */
export async function deleteExpense(uid, expense) {
  const userRef = doc(db, 'users', uid);
  const expenseRef = doc(db, 'users', uid, 'expenses', expense.id);
  const folderRef = doc(db, 'users', uid, 'folders', expense.folderId);

  await runTransaction(db, async (transaction) => {
    const userSnap = await transaction.get(userRef);
    const folderSnap = await transaction.get(folderRef);

    transaction.delete(expenseRef);

    if (folderSnap.exists()) {
      transaction.update(folderRef, {
        total: Math.max(0, (folderSnap.data().total || 0) - Number(expense.amount)),
        expenseCount: Math.max(0, (folderSnap.data().expenseCount || 0) - 1),
      });
    }

    transaction.update(userRef, { balance: (userSnap.data().balance || 0) + Number(expense.amount) });
  });
}
