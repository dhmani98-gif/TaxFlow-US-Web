import React from 'react';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Link as LinkIcon, 
  FileText, 
  Settings, 
  LogOut,
  ShieldCheck,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'integrations', label: 'Integrations', icon: LinkIcon },
  { id: 'transactions', label: 'Invoices', icon: ArrowLeftRight },
  { id: 'reports', label: 'Tax Reports', icon: FileText },
  { id: 'pricing', label: 'Subscription', icon: CreditCard },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <div className="w-64 bg-carbon text-white h-screen flex flex-col fixed left-0 top-0 z-30 border-r border-white/5">
      <div className="p-8 flex items-center gap-3">
        <div className="w-12 h-12 bg-electric rounded-xl flex items-center justify-center shadow-lg shadow-electric/20">
          <TrendingUp className="text-carbon" size={28} />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tighter leading-none">TAXFLOW</h1>
          <span className="text-[10px] font-bold text-electric tracking-[0.2em] uppercase">United States</span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group",
              activeTab === item.id 
                ? "bg-electric text-carbon shadow-xl shadow-electric/20" 
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <item.icon size={20} className={cn(
              "transition-transform duration-300",
              activeTab === item.id ? "scale-110" : "group-hover:scale-110"
            )} />
            <span className="font-bold text-sm tracking-tight">{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="p-6 border-t border-white/5 space-y-2">
        <div className="bg-white/5 rounded-2xl p-4 mb-4 border border-white/5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Current Plan</p>
          <p className="text-sm font-bold text-electric">Growth Pro</p>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-all"
        >
          <LogOut size={18} />
          <span className="font-bold text-xs uppercase tracking-wider">Logout</span>
        </button>
      </div>
    </div>
  );
}
