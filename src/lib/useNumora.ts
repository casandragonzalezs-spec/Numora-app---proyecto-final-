/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy,
  doc,
  setDoc,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { User, Account, Transaction, Budget, Insight } from '../types';
import { handleFirestoreError, OperationType } from './errorHandlers';

export function useNumora() {
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Sync user profile
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          const newUser: User = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || '',
            createdAt: new Date().toISOString(),
            preferences: { currency: 'USD', theme: 'light' }
          };
          await setDoc(userRef, newUser);
          setUser(newUser);
        } else {
          setUser(userSnap.data() as User);
        }

        // Subscriptions
        const qAccounts = query(collection(db, 'accounts'), where('userId', '==', firebaseUser.uid));
        const unsubAccounts = onSnapshot(qAccounts, (snap) => {
          setAccounts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Account)));
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'accounts'));

        const qTransactions = query(
          collection(db, 'transactions'), 
          where('userId', '==', firebaseUser.uid),
          orderBy('date', 'desc')
        );
        const unsubTransactions = onSnapshot(qTransactions, (snap) => {
          setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction)));
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'transactions'));

        const qBudgets = query(collection(db, 'budgets'), where('userId', '==', firebaseUser.uid));
        const unsubBudgets = onSnapshot(qBudgets, (snap) => {
          setBudgets(snap.docs.map(d => ({ id: d.id, ...d.data() } as Budget)));
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'budgets'));

        const qInsights = query(
          collection(db, 'insights'), 
          where('userId', '==', firebaseUser.uid),
          orderBy('createdAt', 'desc')
        );
        const unsubInsights = onSnapshot(qInsights, (snap) => {
          setInsights(snap.docs.map(d => ({ id: d.id, ...d.data() } as Insight)));
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'insights'));

        setLoading(false);

        return () => {
          unsubAccounts();
          unsubTransactions();
          unsubBudgets();
          unsubInsights();
        };
      } else {
        setUser(null);
        setAccounts([]);
        setTransactions([]);
        setBudgets([]);
        setInsights([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return { user, accounts, transactions, budgets, insights, loading };
}
