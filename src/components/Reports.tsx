import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Calendar,
  ArrowRight,
  Shield,
  CheckCircle2,
  Loader2,
  FileSpreadsheet,
  Package
} from 'lucide-react';
import { cn } from '../lib/utils';
import { db, auth } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { calculateScheduleC } from '../lib/scheduleCMappings';
import { calculateSalesTaxSummary, getNexusStatus } from '../lib/salesTaxLogic';
import { calculateReconciliation } from '../lib/reconciliationEngine';
import { exportScheduleCToExcel, exportSalesTaxToExcel, exportReconciliationToExcel, exportAllReportsToExcel } from '../lib/exportToExcel';
import { exportScheduleCToPDF, exportSalesTaxToPDF, exportReconciliationToPDF } from '../lib/exportToPDF';

const reports = [
  {
    id: 'schedule-c',
    title: 'IRS Schedule C (Form 1040)',
    description: 'Profit or Loss from Business. Automated mapping of your e-commerce income and expenses.',
    type: 'TAX FORM'
  },
  {
    id: 'sales-tax',
    title: 'Sales Tax Summary',
    description: 'Breakdown of your taxable sales per state, taxes collected, and nexus status.',
    type: 'SUMMARY'
  },
  {
    id: '1099-nec',
    title: '1099-NEC Reconciliation',
    description: 'Verify platform-reported income against your actual bank deposits.',
    type: 'RECONCILIATION'
  },
];

export default function Reports() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | null>(null);
  const [loading, setLoading] = useState(true);
  const [clientInfo, setClientInfo] = useState<{ storeName?: string; taxId?: string }>({});

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const orgId = user.uid;
    const txQuery = collection(db, `organizations/${orgId}/transactions`);

    const unsub = onSnapshot(txQuery, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(txs);
      setLoading(false);
    }, (err) => {
      console.error("Firestore Error (Transactions):", err);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleGenerateReport = (reportId: string, format: 'pdf' | 'excel') => {
    setSelectedReport(reportId);
    setExportFormat(format);

    try {
      switch (reportId) {
        case 'schedule-c':
          const scheduleC = calculateScheduleC(transactions);
          if (format === 'excel') {
            exportScheduleCToExcel(scheduleC);
          } else {
            exportScheduleCToPDF(scheduleC, transactions);
          }
          break;

        case 'sales-tax':
          const salesTax = calculateSalesTaxSummary(transactions);
          if (format === 'excel') {
            exportSalesTaxToExcel(salesTax);
          } else {
            exportSalesTaxToPDF(salesTax, clientInfo);
          }
          break;

        case '1099-nec':
          const stripeTx = transactions.filter(t => t.platform === 'Stripe');
          const bankTx = transactions.filter(t => t.platform === 'Bank');
          const reconciliation = calculateReconciliation(stripeTx, bankTx);
          if (format === 'excel') {
            exportReconciliationToExcel(reconciliation);
          } else {
            exportReconciliationToPDF(reconciliation);
          }
          break;
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
    } finally {
      setSelectedReport(null);
      setExportFormat(null);
    }
  };

  const handleExportAllReports = () => {
    try {
      const scheduleC = calculateScheduleC(transactions);
      const salesTax = calculateSalesTaxSummary(transactions);
      const stripeTx = transactions.filter(t => t.platform === 'Stripe');
      const bankTx = transactions.filter(t => t.platform === 'Bank');
      const reconciliation = calculateReconciliation(stripeTx, bankTx);

      exportAllReportsToExcel(scheduleC, salesTax, reconciliation);
      alert('All reports exported to Excel with 3 sheets!');
    } catch (error) {
      console.error('Error exporting all reports:', error);
      alert('Error exporting reports. Please try again.');
    }
  };

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
        <h2 className="text-2xl font-bold text-white tracking-tight">Tax Reports Center</h2>
        <p className="text-slate-500">Generate and export IRS-ready documents.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {reports.map((report) => (
            <div key={report.id} className="card bg-carbon border-white/5 p-6 hover:border-electric/30 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 text-electric rounded-lg">
                    <FileText size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-electric uppercase tracking-widest">{report.type}</span>
                    <h3 className="font-bold text-lg text-white">{report.title}</h3>
                  </div>
                </div>
                <button className="p-2 text-slate-500 hover:text-white transition-colors">
                  <Download size={20} />
                </button>
              </div>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                {report.description}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleGenerateReport(report.id, 'pdf')}
                  disabled={selectedReport === report.id}
                  className="flex-1 flex items-center justify-center gap-2 text-sm font-bold text-electric bg-white/5 border border-white/10 rounded-lg py-2.5 hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  {selectedReport === report.id && exportFormat === 'pdf' ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                  {selectedReport !== report.id && <Download size={16} />}
                  PDF
                </button>
                <button
                  onClick={() => handleGenerateReport(report.id, 'excel')}
                  disabled={selectedReport === report.id}
                  className="flex-1 flex items-center justify-center gap-2 text-sm font-bold text-electric bg-white/5 border border-white/10 rounded-lg py-2.5 hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  {selectedReport === report.id && exportFormat === 'excel' ? <Loader2 className="animate-spin" size={16} /> : <FileSpreadsheet size={16} />}
                  {selectedReport !== report.id && <FileSpreadsheet size={16} />}
                  Excel
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-8">
          <div className="card p-8 bg-carbon border-white/5 text-white">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Calendar className="text-electric" size={24} />
              Tax Year 2024
            </h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="text-slate-500 text-sm">Status</span>
                <span className="flex items-center gap-1.5 text-electric text-sm font-bold">
                  <CheckCircle2 size={14} />
                  Ready to File
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="text-slate-500 text-sm">Last Updated</span>
                <span className="text-white text-sm font-medium">Today, 10:45 AM</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-slate-500 text-sm">Data Sources</span>
                <span className="text-white text-sm font-medium">Shopify, Amazon, Stripe</span>
              </div>
            </div>
            
            <button
              onClick={handleExportAllReports}
              className="w-full py-4 bg-electric text-carbon rounded-xl font-black text-lg hover:brightness-110 transition-all shadow-xl shadow-electric/20 flex items-center justify-center gap-2"
            >
              <Package size={20} />
              Download All Reports (Excel)
            </button>
          </div>

          <div className="card p-6 border-dashed border-2 border-white/5 bg-white/[0.01]">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="text-slate-500" size={20} />
              <h4 className="font-bold text-slate-300">Audit Protection</h4>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              Our reports include a detailed <strong>audit trail</strong> for every transaction, linking your Schedule C lines directly to original platform API records.
            </p>
            <a href="#" className="text-xs font-bold text-electric hover:underline">Learn about our compliance standards</a>
          </div>
        </div>
      </div>
    </div>
  );
}
