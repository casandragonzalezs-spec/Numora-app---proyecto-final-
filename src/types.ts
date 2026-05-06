/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  createdAt: string;
  preferences: {
    currency: 'USD' | 'EUR' | 'MXN' | 'GBP';
    theme: 'light' | 'dark';
  };
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: 'checking' | 'savings' | 'investment' | 'crypto' | 'cash';
  balance: number;
  currency: string;
  institution?: string;
  lastUpdated: string;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  amount: number;
  date: string;
  description: string;
  category: string;
  type: 'income' | 'expense';
  tags?: string[];
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  limit: number;
  period: string;
  color: string;
}

export interface Insight {
  id: string;
  userId: string;
  content: string;
  title: string;
  type: 'advice' | 'alert' | 'summary';
  createdAt: string;
}
