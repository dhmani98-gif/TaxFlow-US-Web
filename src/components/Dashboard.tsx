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
import { auth, db } from '../lib/supabase';

interface DashboardProps {
  userId?: string;
}

export default function Dashboard({ userId }: DashboardProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [nexusStatus, setNexusStatus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        // Get user's organization
        const orgs = await db.getOrganizations(userId);
        if (orgs.length === 0) {
          setLoading(false);
          return;
        }
        const orgId = orgs[0].id;

        // Load transactions via Supabase
        const txs = await db.getTransactions(orgId);
        setTransactions(txs);
        
        // Load nexus data via Supabase
        const nexus = await db.getNexusStatus(orgId);
        setNexusStatus(nexus);
      } catch (err) {
        console.error("Supabase Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  const totalRevenue = transactions
    .filter(t => t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);
    
  const totalDeductions = Math.abs(transactions
    .filter(t => t.amount < 0)
    .reduce((acc, t) => acc + t.amount, 0));
    
  const estimatedTax = (totalRevenue - totalDeductions) * 0.15;

  // Group transactions by month for chart
  const chartData = React.useMemo(() => {
    if (transactions.length === 0) return [];

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData: any[] = [];

    transactions.forEach(tx => {
      const date = tx.transaction_date ? new Date(tx.transaction_date) : new Date();
      const monthName = monthNames[date.getMonth()];
      const existingMonth = monthlyData.find(m => m.name === monthName);

      if (existingMonth) {
        if (tx.amount > 0) existingMonth.revenue += tx.amount;
        if (tx.amount < 0) existingMonth.expenses += Math.abs(tx.amount);
      } else {
        monthlyData.push({
          name: monthName,
          revenue: tx.amount > 0 ? tx.amount : 0,
          expenses: tx.amount < 0 ? Math.abs(tx.amount) : 0
        });
      }
    });

    // Sort by month order
    return monthlyData.sort((a, b) => monthNames.indexOf(a.name) - monthNames.indexOf(b.name));
  }, [transactions]);

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
        <p className="text-slate-500">Real-time tax tracking and nexus monitoring from MongoDB.</p>
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
            <select className="bg-carbon border border-electric/50 rounded-lg px-3 py-1 text-sm outline-none text-white">
              <option>Last 3 Months</option>
              <option>Year to Date</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            {chartData.length > 0 ? (
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
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-slate-500 text-sm">No data available. Connect your store or add transactions manually.</p>
              </div>
            )}
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
            {nexusStatus.length > 0 ? nexusStatus.map((state) => {
              const percentage = Math.min((state.total_sales / state.threshold_amount) * 100, 100);
              return (
                <div key={state.state_code} className="space-y-2 group cursor-pointer">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{state.state_code}</span>
                      <h4 className="font-semibold text-slate-300 group-hover:text-white transition-colors">{state.state_name}</h4>
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        "text-[10px] font-black px-2 py-0.5 rounded-full uppercase transition-all",
                        state.status === 'SAFE' && "bg-green-500/10 text-green-500 group-hover:bg-green-500/20",
                        state.status === 'WARNING' && "bg-amber-500/10 text-amber-500 group-hover:bg-amber-500/20",
                        state.status === 'EXCEEDED' && "bg-red-500/10 text-red-500 group-hover:bg-red-500/20"
                      )}>
                        {state.status}
                      </span>
                      <p className="text-sm font-mono mt-1 text-white">{formatCurrency(state.total_sales)} / {formatCurrency(state.threshold_amount)}</p>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden group-hover:bg-white/10 transition-colors">
                    <div
                      className={cn(
                        "h-full transition-all duration-1000 group-hover:brightness-125 cursor-pointer",
                        state.status === 'SAFE' && "bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.5)] group-hover:shadow-[0_0_30px_rgba(34,197,94,0.8)]",
                        state.status === 'WARNING' && "bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)] group-hover:shadow-[0_0_30px_rgba(245,158,11,0.8)]",
                        state.status === 'EXCEEDED' && "bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] group-hover:shadow-[0_0_30px_rgba(239,68,68,0.8)]"
                      )}
                      style={{ width: `${percentage}%` }}
                      title={`${percentage.toFixed(1)}% of threshold`}
                    />
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    {percentage.toFixed(1)}% of nexus threshold
                  </div>
                </div>
              );
            }) : (
              <p className="text-sm text-slate-500 text-center py-8">No nexus data found in MongoDB.</p>
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
