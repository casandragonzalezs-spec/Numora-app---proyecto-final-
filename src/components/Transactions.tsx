/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { X, Plus, ReceiptText, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import React, { useState } from 'react';
import { Account, Transaction } from '../types';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';

interface TransactionsProps {
  transactions: Transaction[];
  accounts: Account[];
  userId: string;
}

export default function Transactions({ transactions, accounts, userId }: TransactionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [category, setCategory] = useState('General');
  const [type, setType] = useState<'income' | 'expense'>('expense');

  const categories = ['Housing', 'Food', 'Transport', 'Entertainment', 'Shopping', 'Income', 'Other'];

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId) return alert("Select an account");

    try {
      const numAmount = parseFloat(amount);
      const balanceChange = type === 'income' ? numAmount : -numAmount;

      await addDoc(collection(db, 'transactions'), {
        userId,
        accountId,
        description,
        amount: numAmount,
        type,
        category,
        date: new Date().toISOString()
      });

      // Update account balance
      const accountRef = doc(db, 'accounts', accountId);
      await updateDoc(accountRef, {
        balance: increment(balanceChange),
        lastUpdated: new Date().toISOString()
      });

      setIsModalOpen(false);
      setDescription('');
      setAmount('');
      setAccountId('');
    } catch (error) {
      console.error("Error adding transaction", error);
    }
  };

  return (
    <div className="space-y-8" id="transactions-view">
       <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-sans font-bold tracking-tight text-neutral-900">Transaction History</h1>
          <p className="text-neutral-500">A granular log of your financial movements.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-neutral-900 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
          id="open-add-tx-modal"
        >
          <Plus size={18} />
          New Record
        </button>
      </header>

      <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
        {transactions.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead className="bg-neutral-50/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-400">Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-400">Description</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-400">Category</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-400 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-neutral-50/80 transition-colors group">
                  <td className="px-6 py-4 font-mono text-xs text-neutral-400">
                    {new Date(tx.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-medium text-neutral-900">{tx.description}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md bg-neutral-100 text-[10px] font-bold uppercase text-neutral-500 tracking-wide">
                      {tx.category}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-right font-sans font-bold ${
                    tx.type === 'income' ? 'text-emerald-600' : 'text-neutral-900'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-20 text-center text-neutral-300 italic font-sans">
            No transaction records found.
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/20">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8"
              id="add-transaction-modal"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">New Record</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-neutral-900">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddTransaction} className="space-y-6">
                <div>
                   <label className="block text-sm font-medium text-neutral-500 mb-2 uppercase tracking-wide">Description</label>
                  <input 
                    required 
                    value={description} 
                    onChange={e => setDescription(e.target.value)}
                    placeholder="e.g. Grocery Shop" 
                    className="w-full bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-500 mb-2 uppercase tracking-wide">Type</label>
                    <div className="grid grid-cols-2 gap-2 bg-neutral-50 p-1 rounded-xl">
                       <button 
                        type="button"
                        onClick={() => setType('expense')}
                        className={`py-2 rounded-lg text-xs font-bold transition-all ${type === 'expense' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-400'}`}
                       >Expense</button>
                       <button 
                        type="button"
                        onClick={() => setType('income')}
                        className={`py-2 rounded-lg text-xs font-bold transition-all ${type === 'income' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-400'}`}
                       >Income</button>
                    </div>
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-neutral-500 mb-2 uppercase tracking-wide">Amount</label>
                    <input 
                      required 
                      type="number"
                      step="0.01"
                      value={amount} 
                      onChange={e => setAmount(e.target.value)}
                      placeholder="0.00" 
                      className="w-full bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-200 font-sans font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-2 uppercase tracking-wide">From Account</label>
                  <select 
                    required
                    value={accountId} 
                    onChange={e => setAccountId(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                  >
                    <option value="">Select Account</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name} (${acc.balance})</option>
                    ))}
                  </select>
                </div>

                <div>
                   <label className="block text-sm font-medium text-neutral-500 mb-2 uppercase tracking-wide">Category</label>
                    <select 
                      value={category} 
                      onChange={e => setCategory(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-neutral-900 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Log Transaction
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
