import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { 
  Search, 
  Filter, 
  Download, 
  Plus,
  ShoppingBag,
  Store,
  CreditCard,
  Building2,
  MoreHorizontal,
  ArrowUpDown
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';

const platformIcons: Record<string, any> = {
  Shopify: ShoppingBag,
  Amazon: Store,
  Stripe: CreditCard,
  Bank: Building2,
};

export default function Transactions() {
  const { transactions } = useSelector((state: RootState) => state.app);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = transactions.filter(t => 
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.sourceId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Financial Transactions</h2>
          <p className="text-slate-500">Review and categorize your business activity with precision.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/5 rounded-lg text-sm font-bold text-slate-300 hover:bg-white/10 transition-colors">
            <Download size={16} />
            Export CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-electric text-carbon rounded-lg text-sm font-black hover:brightness-110 transition-all shadow-lg shadow-electric/20">
            <Plus size={16} />
            Add Transaction
          </button>
        </div>
      </header>

      <div className="card bg-carbon border-white/5 overflow-visible">
        <div className="p-4 border-b border-white/5 flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search by description or ID..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/5 rounded-lg outline-none focus:ring-2 focus:ring-electric/20 focus:border-electric transition-all text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/5 rounded-lg text-sm font-bold text-slate-400 hover:text-white">
              <Filter size={16} />
              Filters
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/5 rounded-lg text-sm font-bold text-slate-400 hover:text-white">
              <ArrowUpDown size={16} />
              Sort
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Source</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Description</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTransactions.map((tx) => {
                const Icon = platformIcons[tx.platform] || Building2;
                return (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-slate-400 font-mono">
                        {new Date(tx.transactionDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-white/5 rounded text-slate-400">
                          <Icon size={14} />
                        </div>
                        <span className="text-sm font-bold text-slate-300">{tx.platform}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">{tx.description}</span>
                        <span className="text-xs text-slate-500 font-mono">{tx.sourceId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-white/5 text-slate-400">
                        {tx.categoryId === 'cat_1' ? 'Sales Income' : 'Advertising'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "text-sm font-black font-mono",
                        tx.amount > 0 ? "text-green-500" : "text-white"
                      )}>
                        {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button className="p-1 text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
          <p className="text-xs font-bold text-slate-500">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border border-white/5 rounded bg-white/5 text-xs font-bold text-slate-600 cursor-not-allowed">Previous</button>
            <button className="px-3 py-1 border border-white/5 rounded bg-white/5 text-xs font-bold text-slate-400 hover:text-white">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
