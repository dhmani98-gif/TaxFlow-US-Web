import React, { useEffect, useState } from 'react';
import { 
  DollarSign, 
  Receipt, 
  TrendingDown, 
  AlertTriangle, 
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { db, auth } from '../firebase';
import { collection, query, onSnapshot, where, orderBy } from 'firebase/firestore';

export default function Dashboard() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [nexusStatus, setNexusStatus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Use the user's UID as the orgId for this demo
    const orgId = user.uid; 

    const txQuery = query(
      collection(db, `organizations/${orgId}/transactions`)
    );

    const nexusQuery = collection(db, `organizations/${orgId}/nexus`);

    const unsubTx = onSnapshot(txQuery, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(txs);
      setLoading(false);
    }, (err) => {
      console.error("Firestore Error (Transactions):", err);
      setLoading(false);
    });

    const unsubNexus = onSnapshot(nexusQuery, (snapshot) => {
      const nexus = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNexusStatus(nexus);
    }, (err) => {
      console.error("Firestore Error (Nexus):", err);
    });

    return () => {
      unsubTx();
      unsubNexus();
    };
  }, []);

  const totalRevenue = transactions
    .filter(t => t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);
    
  const totalDeductions = Math.abs(transactions
    .filter(t => t.amount < 0)
    .reduce((acc, t) => acc + t.amount, 0));
    
  const estimatedTax = (totalRevenue - totalDeductions) * 0.15;

  const chartData = [
    { name: 'Jan', revenue: 4500, expenses: 1200 },
    { name: 'Feb', revenue: 5200, expenses: 1500 },
    { name: 'Mar', revenue: totalRevenue || 0, expenses: totalDeductions || 0 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-electric" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-2xl font-bold text-white tracking-tight">Financial Overview</h2>
        <p className="text-slate-500">Real-time tax tracking and nexus monitoring from Firestore.</p>
      </header>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={totalRevenue} 
          icon={DollarSign} 
          trend="+12.5%" 
          trendUp={true}
          color="blue"
        />
        <StatCard 
          title="Estimated Tax Due" 
          value={estimatedTax} 
          icon={Receipt} 
          trend="+5.2%" 
          trendUp={false}
          color="amber"
        />
        <StatCard 
          title="Total Deductions" 
          value={totalDeductions} 
          icon={TrendingDown} 
          trend="+8.1%" 
          trendUp={true}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card bg-carbon border-white/5 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-white">Revenue vs Expenses</h3>
            <select className="bg-white/5 border border-white/5 rounded-lg px-3 py-1 text-sm outline-none text-slate-400">
              <option>Last 3 Months</option>
              <option>Year to Date</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  cursor={{fill: '#ffffff05'}}
                  contentStyle={{backgroundColor: '#111', borderRadius: '12px', border: '1px solid #ffffff05', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)'}}
                  itemStyle={{color: '#fff'}}
                />
                <Bar dataKey="revenue" fill="#00E5FF" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="expenses" fill="#64748b" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Nexus Sentinel */}
        <div className="card bg-carbon border-white/5 p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-electric/10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-electric" size={18} />
            </div>
            <h3 className="font-bold text-lg text-white">Nexus Sentinel</h3>
          </div>
          
          <div className="space-y-6">
            {nexusStatus.length > 0 ? nexusStatus.map((state) => (
              <div key={state.state_code} className="space-y-2">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{state.state_code}</span>
                    <h4 className="font-semibold text-slate-300">{state.state_name}</h4>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      "text-[10px] font-black px-2 py-0.5 rounded-full uppercase",
                      state.status === 'SAFE' && "bg-green-500/10 text-green-500",
                      state.status === 'WARNING' && "bg-amber-500/10 text-amber-500",
                      state.status === 'EXCEEDED' && "bg-red-500/10 text-red-500"
                    )}>
                      {state.status}
                    </span>
                    <p className="text-sm font-mono mt-1 text-white">{formatCurrency(state.total_sales)} / {formatCurrency(state.threshold_amount)}</p>
                  </div>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-1000",
                      state.status === 'SAFE' && "bg-green-500",
                      state.status === 'WARNING' && "bg-amber-500",
                      state.status === 'EXCEEDED' && "bg-red-500"
                    )}
                    style={{ width: `${Math.min((state.total_sales / state.threshold_amount) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )) : (
              <p className="text-sm text-slate-500 text-center py-8">No nexus data found in Firestore.</p>
            )}
          </div>
          
          <button className="w-full mt-6 py-3 border border-white/5 rounded-xl text-sm font-semibold text-slate-400 hover:bg-white/5 transition-colors">
            View All States
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, trendUp, color }: any) {
  const colorClasses = {
    blue: "bg-electric/10 text-electric",
    amber: "bg-amber-500/10 text-amber-500",
    green: "bg-green-500/10 text-green-500",
  }[color as 'blue' | 'amber' | 'green'];

  return (
    <div className="card bg-carbon border-white/5 p-6 flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-3xl font-black text-white tracking-tight font-mono">
          {formatCurrency(value)}
        </h3>
        <div className="flex items-center gap-1 mt-2">
          {trendUp ? (
            <ArrowUpRight size={16} className="text-green-500" />
          ) : (
            <ArrowDownRight size={16} className="text-red-500" />
          )}
          <span className={cn("text-sm font-bold", trendUp ? "text-green-500" : "text-red-500")}>
            {trend}
          </span>
          <span className="text-xs text-slate-500 font-medium ml-1">vs last month</span>
        </div>
      </div>
      <div className={cn("p-3 rounded-xl", colorClasses)}>
        <Icon size={24} />
      </div>
    </div>
  );
}
