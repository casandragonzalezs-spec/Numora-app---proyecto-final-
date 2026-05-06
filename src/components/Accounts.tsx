/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { X, Plus, Trash2, CreditCard } from 'lucide-react';
import React, { useState } from 'react';
import { Account } from '../types';
import { collection, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';

interface AccountsProps {
  accounts: Account[];
  userId: string;
}

export default function Accounts({ accounts, userId }: AccountsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [type, setType] = useState<Account['type']>('checking');
  const [institution, setInstitution] = useState('');

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'accounts'), {
        userId,
        name,
        balance: parseFloat(balance),
        type,
        institution,
        currency: 'USD',
        lastUpdated: new Date().toISOString()
      });
      setIsModalOpen(false);
      setName('');
      setBalance('');
      setInstitution('');
    } catch (error) {
      console.error("Error adding account", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to remove this account?")) {
      await deleteDoc(doc(db, 'accounts', id));
    }
  };

  return (
    <div className="space-y-8" id="accounts-view">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-sans font-bold tracking-tight text-neutral-900">Your Accounts</h1>
          <p className="text-neutral-500">Manage your connected financial institutions and wallets.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-neutral-900 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
          id="open-add-account-modal"
        >
          <Plus size={18} />
          Add Account
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((acc) => (
          <div key={acc.id} className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:bg-neutral-900 group-hover:text-white transition-all">
                <CreditCard size={24} />
              </div>
              <button 
                onClick={() => handleDelete(acc.id)}
                className="p-2 text-neutral-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-neutral-400 uppercase tracking-wider">{acc.type}</p>
              <h3 className="text-xl font-sans font-bold text-neutral-900">{acc.name}</h3>
              <p className="text-sm text-neutral-500">{acc.institution || 'Manual Entry'}</p>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-50 flex items-end justify-between">
               <div className="text-2xl font-sans font-bold text-neutral-900 tabular-nums">
                 {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(acc.balance)}
               </div>
               <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-tighter">
                 Last Sync: {new Date(acc.lastUpdated).toLocaleDateString()}
               </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/20">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8"
              id="add-account-modal"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Connect New Account</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-neutral-900">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddAccount} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-2 uppercase tracking-wide">Account Name</label>
                  <input 
                    required 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Chase Sapphire, Crypto Wallet" 
                    className="w-full bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="block text-sm font-medium text-neutral-500 mb-2 uppercase tracking-wide">Balance</label>
                    <input 
                      required 
                      type="number"
                      step="0.01"
                      value={balance} 
                      onChange={e => setBalance(e.target.value)}
                      placeholder="0.00" 
                      className="w-full bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-500 mb-2 uppercase tracking-wide">Type</label>
                    <select 
                      value={type} 
                      onChange={e => setType(e.target.value as any)}
                      className="w-full bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                    >
                      <option value="checking">Checking</option>
                      <option value="savings">Savings</option>
                      <option value="investment">Investment</option>
                      <option value="crypto">Crypto</option>
                      <option value="cash">Cash</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-2 uppercase tracking-wide">Institution (Optional)</label>
                  <input 
                    value={institution} 
                    onChange={e => setInstitution(e.target.value)}
                    placeholder="e.g. JPMorgan Chase" 
                    className="w-full bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-neutral-900 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Confirm Connection
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
