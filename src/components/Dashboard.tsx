/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Plus, ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';
import { Account, Transaction } from '../types';

interface DashboardProps {
  accounts: Account[];
  transactions: Transaction[];
}

export default function Dashboard({ accounts, transactions }: DashboardProps) {
  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);
  
  const recentTransactions = transactions.slice(0, 5);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(val);
  };

  return (
    <div className="space-y-8" id="dashboard-view">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-sans font-bold tracking-tight text-neutral-900">Wealth Overview</h1>
          <p className="text-neutral-500">Live summary of your financial status.</p>
        </div>
        <button 
          className="flex items-center gap-2 bg-neutral-900 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:scale-95"
          id="add-transaction-btn"
        >
          <Plus size={18} />
          Add Transaction
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-neutral-900 text-white rounded-lg">
              <Wallet size={20} />
            </div>
            <span className="text-sm font-medium text-neutral-500 uppercase tracking-wider">Net Worth</span>
          </div>
          <div className="text-4xl font-sans font-semibold text-neutral-900 tabular-nums">
            {formatCurrency(totalBalance)}
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-emerald-600 font-medium">
            <ArrowUpRight size={16} />
            <span>+2.4% this month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-neutral-100 text-neutral-900 rounded-lg">
              <ArrowDownRight size={20} />
            </div>
            <span className="text-sm font-medium text-neutral-500 uppercase tracking-wider">Monthly Spend</span>
          </div>
          <div className="text-4xl font-sans font-semibold text-neutral-900 tabular-nums">
            {formatCurrency(4850.20)}
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-neutral-400 font-medium font-sans italic">
             Within budget units
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm hover:shadow-md transition-all">
           <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-neutral-100 text-neutral-900 rounded-lg">
              <TrendingUp size={20} />
            </div>
            <span className="text-sm font-medium text-neutral-500 uppercase tracking-wider">Investments</span>
          </div>
          <div className="text-4xl font-sans font-semibold text-neutral-900 tabular-nums">
            {formatCurrency(82400.00)}
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-emerald-600 font-medium">
            <ArrowUpRight size={16} />
            <span>Market up 0.8% today</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-bottom border-neutral-50 flex items-center justify-between">
             <h3 className="font-sans font-semibold text-lg text-neutral-900">Recent Transactions</h3>
             <button className="text-sm text-neutral-500 hover:text-neutral-900 font-medium">View all</button>
          </div>
          <div className="flex-1">
            {recentTransactions.length > 0 ? (
              <div className="divide-y divide-neutral-50">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {tx.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">{tx.description}</p>
                        <p className="text-xs text-neutral-400 font-sans italic">{tx.category}</p>
                      </div>
                    </div>
                    <div className={`font-sans font-semibold ${
                      tx.type === 'income' ? 'text-emerald-600' : 'text-neutral-900'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-neutral-400">
                <p>No transactions recorded yet.</p>
              </div>
            )}
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
           <div className="p-6 border-bottom border-neutral-50 flex items-center justify-between">
             <h3 className="font-sans font-semibold text-lg text-neutral-900">Connected Accounts</h3>
             <button className="text-sm text-neutral-500 hover:text-neutral-900 font-medium">Manage</button>
          </div>
          <div className="p-6 space-y-4">
            {accounts.length > 0 ? accounts.map(acc => (
              <div key={acc.id} className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 hover:bg-neutral-100 transition-all border border-transparent hover:border-neutral-200">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white border border-neutral-100 flex items-center justify-center shadow-sm">
                       <CreditCard size={24} className="text-neutral-400" />
                    </div>
                    <div>
                       <p className="font-medium text-neutral-900">{acc.name}</p>
                       <p className="text-xs text-neutral-400">{acc.institution || 'Unknown Institution'}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="font-sans font-semibold text-neutral-900">{formatCurrency(acc.balance)}</p>
                    <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Updated {new Date(acc.lastUpdated).toLocaleDateString()}</p>
                 </div>
              </div>
            )) : (
               <div className="p-6 text-center text-neutral-400">
                <p>No accounts connected.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
