import React from 'react';
import { motion } from 'framer-motion';
import { 
  Link2, 
  Calculator, 
  FileText, 
  RefreshCw, 
  ShieldCheck, 
  Zap,
  ArrowRight
} from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: Link2,
      title: 'Direct Integration',
      description: 'Seamlessly connect your Amazon and Shopify stores with a single click. Automatically sync all your financial data without manual entry.',
      highlight: 'No technical expertise required',
    },
    {
      icon: Calculator,
      title: 'Automated Tax Calculation',
      description: 'Real-time Sales Tax and VAT calculation based on buyer location. Stay compliant with multi-jurisdiction tax laws automatically.',
      highlight: 'Accurate down to the penny',
    },
    {
      icon: FileText,
      title: 'Ready-to-File Reports',
      description: 'Generate tax filing reports ready for direct upload to IRS, ZATCA, and other tax authorities. Save hours of manual work.',
      highlight: 'IRS and ZATCA compliant',
    },
    {
      icon: RefreshCw,
      title: 'Accounting Sync',
      description: 'Full compatibility with QuickBooks and Xero. Automatically transfer journal entries and keep your books in perfect sync.',
      highlight: 'No double-entry needed',
    },
    {
      icon: ShieldCheck,
      title: 'Legal Compliance',
      description: 'Rest easy knowing your tax calculations meet professional accounting standards. Built-in compliance checks protect your business.',
      highlight: 'Audit-ready documentation',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Process thousands of transactions in seconds. Our cloud-based infrastructure ensures your reports are ready when you need them.',
      highlight: '99.9% uptime guaranteed',
    },
  ];

  return (
    <div className="min-h-screen bg-carbon py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <h1 className="text-5xl font-black text-white mb-6 tracking-tight">
            Powerful Features for
            <span className="text-electric"> Modern Retailers</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            TAXFLOW automates your entire tax workflow, from data collection to filing. 
            Focus on growing your business while we handle the numbers.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-[#111] border border-white/5 rounded-2xl p-8 hover:border-electric/30 transition-all duration-300 group"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="w-14 h-14 bg-electric/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-electric/20 transition-all">
                <feature.icon className="text-electric" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-400 mb-4 leading-relaxed">{feature.description}</p>
              <div className="flex items-center gap-2 text-electric text-sm font-bold">
                <span className="w-1.5 h-1.5 bg-electric rounded-full"></span>
                {feature.highlight}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div 
          className="mt-20 bg-gradient-to-r from-electric/10 to-electric/5 border border-electric/20 rounded-3xl p-12 text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Simplify Your Tax Compliance?
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            Join thousands of retailers who trust TAXFLOW to automate their tax calculations and filings.
          </p>
          <motion.button 
            className="bg-electric text-carbon px-8 py-4 rounded-xl font-bold text-lg hover:brightness-110 transition-all shadow-xl shadow-electric/20 flex items-center gap-3 mx-auto"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Get Started Free
            <ArrowRight size={20} />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
