import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  ArrowRight,
  Shield,
  CheckCircle2,
  Upload,
  File,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

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
  const [files, setFiles] = useState<{name: string, size: string}[]>([
    { name: 'Identity_Verification.pdf', size: '1.2 MB' },
    { name: 'Bank_Statement_Jan.pdf', size: '2.4 MB' }
  ]);

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
              <button className="flex items-center gap-2 text-sm font-bold text-electric group-hover:gap-3 transition-all">
                Generate Report
                <ArrowRight size={16} />
              </button>
            </div>
          ))}

          {/* File Center Section */}
          <div className="card p-6 bg-carbon border-white/5">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
              <Upload className="text-electric" size={24} />
              File Center
            </h3>
            <div className="space-y-3 mb-6">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <File size={18} className="text-slate-500" />
                    <div>
                      <p className="text-sm font-bold text-slate-300">{file.name}</p>
                      <p className="text-[10px] text-slate-500">{file.size}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                    className="text-slate-500 hover:text-red-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="border-2 border-dashed border-white/5 rounded-2xl p-8 text-center hover:border-electric/50 transition-all cursor-pointer group">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-electric/10 transition-colors">
                <Upload className="text-slate-500 group-hover:text-electric" size={24} />
              </div>
              <p className="text-sm font-bold text-slate-400">Drag files here or click to upload</p>
              <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG (Max 10MB)</p>
            </div>
          </div>
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
            
            <button className="w-full py-4 bg-electric text-carbon rounded-xl font-black text-lg hover:brightness-110 transition-all shadow-xl shadow-electric/20">
              Download Full Tax Package (.zip)
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
