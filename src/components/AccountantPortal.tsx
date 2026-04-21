// Accountant Portal MVP
// Multi-client dashboard for tax professionals

import React, { useEffect, useState } from 'react';
import {
  Users,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MoreVertical,
  Plus,
  Search,
  Filter,
  Download,
  Mail,
  Building2,
  DollarSign,
  Calendar,
  ChevronRight,
  ExternalLink,
  Loader2,
  X,
  Copy,
  Check
} from 'lucide-react';
import { cn } from '../lib/utils';
import { auth, db } from '../lib/supabase';
import { calculateScheduleC } from '../lib/scheduleCMappings';
import { calculateSalesTaxSummary, getNexusStatus, generateFilingCalendar } from '../lib/salesTaxLogic';

interface Client {
  id: string;
  profile_id: string;
  business_name: string;
  email: string;
  tax_id?: string;
  entity_type?: string;
  status: 'active' | 'pending' | 'inactive';
  created_at: string;
  last_activity?: string;
  revenue_ytd?: number;
  estimated_tax?: number;
  nexus_count?: number;
  transactions_count?: number;
  reports_ready?: boolean;
  next_deadline?: string;
}

interface AccountantStats {
  totalClients: number;
  activeClients: number;
  pendingReviews: number;
  totalRevenue: number;
  estimatedRevenue: number;
}

interface AccountantPortalProps {
  userId?: string;
}

export default function AccountantPortal({ userId }: AccountantPortalProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<AccountantStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteBusinessName, setInviteBusinessName] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [clientDetails, setClientDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    loadClients();
  }, [userId]);

  useEffect(() => {
    filterClients();
  }, [clients, searchQuery, statusFilter]);

  const loadClients = async () => {
    try {
      if (!userId) {
        setLoading(false);
        return;
      }

      // Check if user is an accountant (has accountant role or flag)
      // For now, we'll simulate loading clients
      
      // Mock data for demonstration
      const mockClients: Client[] = [
        {
          id: 'client-1',
          profile_id: 'profile-1',
          business_name: 'Sarah\'s Boutique',
          email: 'sarah@example.com',
          tax_id: '12-3456789',
          entity_type: 'LLC',
          status: 'active',
          created_at: '2024-01-15',
          last_activity: '2024-04-20',
          revenue_ytd: 125000,
          estimated_tax: 18750,
          nexus_count: 3,
          transactions_count: 450,
          reports_ready: true,
          next_deadline: '2024-04-30'
        },
        {
          id: 'client-2',
          profile_id: 'profile-2',
          business_name: 'TechGadgets Co',
          email: 'mike@techgadgets.com',
          tax_id: '98-7654321',
          entity_type: 'S-Corp',
          status: 'active',
          created_at: '2024-02-01',
          last_activity: '2024-04-19',
          revenue_ytd: 450000,
          estimated_tax: 67500,
          nexus_count: 8,
          transactions_count: 1200,
          reports_ready: true,
          next_deadline: '2024-04-30'
        },
        {
          id: 'client-3',
          profile_id: 'profile-3',
          business_name: 'Organic Foods LLC',
          email: 'emma@organicfoods.com',
          tax_id: '45-6789123',
          entity_type: 'LLC',
          status: 'pending',
          created_at: '2024-04-15',
          last_activity: null,
          revenue_ytd: 0,
          estimated_tax: 0,
          nexus_count: 0,
          transactions_count: 0,
          reports_ready: false,
          next_deadline: null
        },
        {
          id: 'client-4',
          profile_id: 'profile-4',
          business_name: 'Digital Marketing Pro',
          email: 'david@marketingpro.com',
          tax_id: '78-9012345',
          entity_type: 'Sole Proprietorship',
          status: 'active',
          created_at: '2024-01-20',
          last_activity: '2024-04-18',
          revenue_ytd: 85000,
          estimated_tax: 12750,
          nexus_count: 2,
          transactions_count: 180,
          reports_ready: false,
          next_deadline: '2024-04-30'
        },
        {
          id: 'client-5',
          profile_id: 'profile-5',
          business_name: 'Handmade Crafts Shop',
          email: 'lisa@handmade.com',
          entity_type: 'LLC',
          status: 'inactive',
          created_at: '2024-03-01',
          last_activity: '2024-03-30',
          revenue_ytd: 25000,
          estimated_tax: 3750,
          nexus_count: 1,
          transactions_count: 65,
          reports_ready: true,
          next_deadline: null
        }
      ];

      setClients(mockClients);
      
      // Calculate stats
      const activeClients = mockClients.filter(c => c.status === 'active');
      const pendingReviews = mockClients.filter(c => c.status === 'active' && !c.reports_ready).length;
      const totalRevenue = mockClients.reduce((sum, c) => sum + (c.revenue_ytd || 0), 0);
      const estimatedRevenue = activeClients.reduce((sum, c) => sum + (c.estimated_tax || 0), 0);
      
      setStats({
        totalClients: mockClients.length,
        activeClients: activeClients.length,
        pendingReviews,
        totalRevenue,
        estimatedRevenue
      });

      setLoading(false);
    } catch (err) {
      console.error('Error loading clients:', err);
      setLoading(false);
    }
  };

  const filterClients = () => {
    let filtered = clients;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.business_name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.entity_type?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    setFilteredClients(filtered);
  };

  const handleInviteClient = async () => {
    if (!inviteEmail || !inviteBusinessName) return;

    setSendingInvite(true);
    
    try {
      // Simulate sending invite
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setInviteSent(true);
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteEmail('');
        setInviteBusinessName('');
        setInviteSent(false);
      }, 2000);
    } catch (error) {
      console.error('Invite error:', error);
    } finally {
      setSendingInvite(false);
    }
  };

  const handleViewClientDetails = async (client: Client) => {
    setSelectedClient(client);
    setLoadingDetails(true);
    
    try {
      // Simulate loading client details
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock detailed data
      setClientDetails({
        scheduleC: {
          line1_grossReceipts: client.revenue_ytd || 0,
          line2_returns: 2500,
          line3_netReceipts: (client.revenue_ytd || 0) - 2500,
          line4_costOfGoodsSold: 45000,
          line7_grossProfit: (client.revenue_ytd || 0) - 2500 - 45000,
          line9_commissionsFees: 8500,
          line28_totalExpenses: 35000,
          line29_netProfit: (client.revenue_ytd || 0) - 2500 - 45000 - 35000
        },
        salesTax: {
          states: [
            { code: 'CA', sales: 45000, taxCollected: 3600, nexusReached: true },
            { code: 'NY', sales: 32000, taxCollected: 2560, nexusReached: true },
            { code: 'TX', sales: 28000, taxCollected: 2240, nexusReached: true }
          ]
        },
        recentTransactions: [
          { date: '2024-04-20', amount: 1250, description: 'Order #12345', platform: 'Shopify' },
          { date: '2024-04-19', amount: 890, description: 'Order #12344', platform: 'Amazon' },
          { date: '2024-04-18', amount: -150, description: 'Refund', platform: 'Stripe' }
        ],
        filingDeadlines: [
          { form: 'Q1 Estimated Tax', due: '2024-04-15', status: 'pending' },
          { form: 'CA Sales Tax', due: '2024-04-30', status: 'upcoming' }
        ]
      });
    } catch (error) {
      console.error('Error loading client details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(`https://taxflow.us/invite?accountant=${userId}&client=${selectedClient?.id || 'new'}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-electric" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Accountant Portal</h2>
          <p className="text-slate-500">Manage all your clients' tax data in one place.</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-electric text-carbon rounded-xl font-bold hover:brightness-110 transition-all"
        >
          <Plus size={18} />
          Invite Client
        </button>
      </header>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card bg-carbon border-white/5 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-electric/10 text-electric rounded-lg">
                <Users size={20} />
              </div>
              <span className="text-sm font-bold text-slate-400">Total Clients</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.totalClients}</div>
            <div className="text-xs text-green-500 mt-1">{stats.activeClients} active</div>
          </div>

          <div className="card bg-carbon border-white/5 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg">
                <AlertTriangle size={20} />
              </div>
              <span className="text-sm font-bold text-slate-400">Pending Reviews</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.pendingReviews}</div>
            <div className="text-xs text-slate-500 mt-1">Need attention</div>
          </div>

          <div className="card bg-carbon border-white/5 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-500/10 text-green-500 rounded-lg">
                <DollarSign size={20} />
              </div>
              <span className="text-sm font-bold text-slate-400">Total Revenue (YTD)</span>
            </div>
            <div className="text-3xl font-bold text-white">
              ${(stats.totalRevenue / 1000).toFixed(1)}k
            </div>
            <div className="text-xs text-slate-500 mt-1">Across all clients</div>
          </div>

          <div className="card bg-carbon border-white/5 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                <TrendingUp size={20} />
              </div>
              <span className="text-sm font-bold text-slate-400">Est. Tax Revenue</span>
            </div>
            <div className="text-3xl font-bold text-white">
              ${(stats.estimatedRevenue / 1000).toFixed(1)}k
            </div>
            <div className="text-xs text-slate-500 mt-1">Based on 15% avg</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search clients by name, email, or entity type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-carbon border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric text-white placeholder:text-slate-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-carbon border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-electric/50 text-white"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Clients Table */}
      <div className="card bg-carbon border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">Client</th>
                <th className="text-left py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">Entity</th>
                <th className="text-right py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">Revenue YTD</th>
                <th className="text-right py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">Est. Tax</th>
                <th className="text-center py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">Nexus</th>
                <th className="text-center py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-center py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">Reports</th>
                <th className="text-center py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr 
                  key={client.id} 
                  className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => handleViewClientDetails(client)}
                >
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-bold text-white">{client.business_name}</div>
                      <div className="text-xs text-slate-500">{client.email}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-xs font-bold bg-white/5 text-slate-300 px-2 py-1 rounded">
                      {client.entity_type || 'Unknown'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="font-bold text-white">
                      ${(client.revenue_ytd || 0).toLocaleString()}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="font-bold text-electric">
                      ${(client.estimated_tax || 0).toLocaleString()}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    {client.nexus_count && client.nexus_count > 0 ? (
                      <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">
                        {client.nexus_count} states
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">-</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={cn(
                      "text-xs font-bold px-2 py-1 rounded uppercase",
                      client.status === 'active' ? "text-green-500 bg-green-500/10" :
                      client.status === 'pending' ? "text-yellow-500 bg-yellow-500/10" :
                      "text-slate-500 bg-slate-500/10"
                    )}>
                      {client.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    {client.reports_ready ? (
                      <CheckCircle2 size={18} className="text-green-500 mx-auto" />
                    ) : (
                      <Clock size={18} className="text-yellow-500 mx-auto" />
                    )}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      <MoreVertical size={16} className="text-slate-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No clients found</h3>
            <p className="text-slate-500 mb-4">Try adjusting your filters or invite new clients.</p>
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2 bg-electric text-carbon rounded-lg font-bold hover:brightness-110 transition-all"
            >
              Invite First Client
            </button>
          </div>
        )}
      </div>

      {/* Invite Client Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="card bg-carbon border border-white/10 p-8 rounded-2xl w-full max-w-md mx-4 animate-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-electric/10 rounded-lg">
                  <Mail className="text-electric" size={20} />
                </div>
                <h3 className="text-xl font-bold text-white">Invite Client</h3>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="text-slate-400" size={20} />
              </button>
            </div>

            {inviteSent ? (
              <div className="text-center py-8">
                <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-white mb-2">Invite Sent!</h4>
                <p className="text-slate-500">Your client will receive an email invitation shortly.</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2">Business Name</label>
                    <input
                      type="text"
                      placeholder="Client's business name"
                      value={inviteBusinessName}
                      onChange={(e) => setInviteBusinessName(e.target.value)}
                      className="w-full px-4 py-3 bg-[#111] border border-white/10 rounded-lg outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2">Email Address</label>
                    <input
                      type="email"
                      placeholder="client@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-[#111] border border-white/10 rounded-lg outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric text-white"
                    />
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-sm text-slate-500 mb-4">
                    Or copy an invite link to share directly:
                  </p>
                  <div className="flex gap-2">
                    <code className="flex-1 px-3 py-2 bg-[#111] rounded-lg text-xs text-slate-400 truncate">
                      https://taxflow.us/invite?accountant={userId?.slice(0, 8)}...
                    </code>
                    <button
                      onClick={copyInviteLink}
                      className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Copy size={16} className="text-slate-400" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 py-3 rounded-lg font-bold text-slate-300 bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInviteClient}
                    disabled={sendingInvite || !inviteEmail || !inviteBusinessName}
                    className="flex-1 py-3 rounded-lg font-bold text-carbon bg-electric hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {sendingInvite ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail size={18} />
                        Send Invite
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Client Details Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="card bg-carbon border border-white/10 p-8 rounded-2xl w-full max-w-4xl mx-4 my-8 animate-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white">{selectedClient.business_name}</h3>
                <p className="text-slate-500">{selectedClient.email} • {selectedClient.entity_type}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedClient(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="text-slate-400" size={20} />
                </button>
              </div>
            </div>

            {loadingDetails ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-electric" size={40} />
              </div>
            ) : clientDetails ? (
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-white/5 rounded-xl">
                    <div className="text-xs text-slate-500 mb-1">Net Profit</div>
                    <div className="text-xl font-bold text-white">
                      ${clientDetails.scheduleC.line29_netProfit.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <div className="text-xs text-slate-500 mb-1">Gross Profit</div>
                    <div className="text-xl font-bold text-white">
                      ${clientDetails.scheduleC.line7_grossProfit.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <div className="text-xs text-slate-500 mb-1">Total Expenses</div>
                    <div className="text-xl font-bold text-white">
                      ${clientDetails.scheduleC.line28_totalExpenses.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Tax Summary */}
                <div className="p-4 bg-white/5 rounded-xl">
                  <h4 className="font-bold text-white mb-4">Schedule C Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Gross Receipts (Line 1)</span>
                      <span className="text-white">${clientDetails.scheduleC.line1_grossReceipts.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Returns (Line 2)</span>
                      <span className="text-white">${clientDetails.scheduleC.line2_returns.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cost of Goods Sold (Line 4)</span>
                      <span className="text-white">${clientDetails.scheduleC.line4_costOfGoodsSold.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Commissions & Fees (Line 9)</span>
                      <span className="text-white">${clientDetails.scheduleC.line9_commissionsFees.toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t border-white/10 flex justify-between font-bold">
                      <span className="text-electric">Net Profit (Line 29)</span>
                      <span className="text-electric">${clientDetails.scheduleC.line29_netProfit.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Sales Tax Nexus */}
                <div className="p-4 bg-white/5 rounded-xl">
                  <h4 className="font-bold text-white mb-4">Sales Tax Nexus</h4>
                  <div className="space-y-2">
                    {clientDetails.salesTax.states.map((state: any) => (
                      <div key={state.code} className="flex justify-between items-center p-2 bg-white/5 rounded">
                        <span className="text-white font-bold">{state.code}</span>
                        <div className="text-right">
                          <div className="text-sm text-white">${state.sales.toLocaleString()}</div>
                          <div className="text-xs text-slate-500">Tax: ${state.taxCollected.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <button className="flex-1 py-3 bg-electric text-carbon rounded-lg font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2">
                    <Download size={18} />
                    Export All Reports
                  </button>
                  <button className="flex-1 py-3 bg-white/5 text-white rounded-lg font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                    <Mail size={18} />
                    Send Reminder
                  </button>
                  <button className="flex-1 py-3 bg-white/5 text-white rounded-lg font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                    <ExternalLink size={18} />
                    View Full Profile
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
