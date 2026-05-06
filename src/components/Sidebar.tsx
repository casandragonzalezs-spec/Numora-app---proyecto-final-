/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  CreditCard, 
  ReceiptText, 
  Lightbulb, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { useState } from 'react';
import Logo from './Logo';

interface NavItemProps {
  icon: any;
  label: string;
  active?: boolean;
  onClick: () => void;
  collapsed?: boolean;
  key?: string | number;
}

function NavItem({ icon: Icon, label, active, onClick, collapsed }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
        active 
          ? 'bg-neutral-900 text-white shadow-md' 
          : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
      }`}
      id={`nav-${label.toLowerCase()}`}
    >
      <Icon size={20} className={active ? 'text-white' : 'group-hover:scale-110 transition-transform text-neutral-400 group-hover:text-neutral-900'} />
      {!collapsed && <span className="font-medium">{label}</span>}
    </button>
  );
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  onLogout 
}: { 
  activeTab: string, 
  setActiveTab: (t: string) => void,
  onLogout: () => void
}) {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'accounts', label: 'Accounts', icon: CreditCard },
    { id: 'transactions', label: 'Transactions', icon: ReceiptText },
    { id: 'insights', label: 'AI Insights', icon: Lightbulb },
  ];

  return (
    <motion.aside 
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      className="h-screen bg-white border-r border-neutral-100 flex flex-col p-4 relative z-20"
      id="main-sidebar"
    >
      <div className="mb-10 px-2 flex items-center justify-between">
        {!collapsed && <Logo />}
        {collapsed && <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center mx-auto"><TrendingUp size={18} /></div>}
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeTab === item.id}
            onClick={() => setActiveTab(item.id)}
            collapsed={collapsed}
          />
        ))}
      </nav>

      <div className="pt-4 border-t border-neutral-100 space-y-2">
        <NavItem
          icon={Settings}
          label="Settings"
          active={activeTab === 'settings'}
          onClick={() => setActiveTab('settings')}
          collapsed={collapsed}
        />
        <NavItem
          icon={LogOut}
          label="Logout"
          onClick={onLogout}
          collapsed={collapsed}
        />
      </div>

      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 bg-white border border-neutral-200 rounded-full p-1 shadow-sm hover:shadow-md transition-all text-neutral-400 hover:text-neutral-900 hidden md:block"
        id="sidebar-toggle"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </motion.aside>
  );
}
