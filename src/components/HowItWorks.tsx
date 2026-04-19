import React from 'react';
import { 
  Link2, 
  Cpu, 
  FileText,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: Link2,
      step: '01',
      title: 'Connect Your Store',
      description: 'Link your Amazon, Shopify, or any e-commerce platform with a single click. No technical expertise needed - just authorize the connection and we\'ll handle the rest.',
      details: [
        'Secure OAuth integration',
        'Support for 50+ platforms',
        'One-time setup takes 2 minutes'
      ]
    },
    {
      icon: Cpu,
      step: '02',
      title: 'Automatic Processing',
      description: 'TAXFLOW analyzes every single sale in real-time. We calculate the exact tax amount based on the buyer\'s location, product type, and applicable tax laws.',
      details: [
        'Real-time tax calculation',
        'Multi-jurisdiction support',
        'Automatic nexus tracking'
      ]
    },
    {
      icon: FileText,
      step: '03',
      title: 'Generate Reports',
      description: 'At the end of each tax period, get your complete tax report ready for filing. Download in multiple formats or file directly with tax authorities.',
      details: [
        'IRS-ready Schedule C',
        'ZATCA compliant reports',
        'Export to PDF, Excel, or CSV'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-carbon py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-5xl font-black text-white mb-6 tracking-tight">
            How TAXFLOW
            <span className="text-electric"> Works</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Three simple steps to automate your entire tax compliance workflow. 
            We handle the complexity so you can focus on your business.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-12 mb-20">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative animate-in fade-in slide-in-from-bottom-4 duration-700"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute left-16 top-24 bottom-0 w-0.5 bg-gradient-to-b from-electric/50 to-transparent"></div>
              )}
              
              <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Step Number & Icon */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 bg-[#111] border border-white/5 rounded-2xl flex flex-col items-center justify-center relative z-10">
                    <span className="text-3xl font-black text-electric mb-2">{step.step}</span>
                    <step.icon className="text-white" size={32} />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 bg-[#111] border border-white/5 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                  <p className="text-slate-400 mb-6 leading-relaxed">{step.description}</p>
                  
                  <ul className="space-y-3">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-center gap-3 text-slate-300">
                        <CheckCircle2 className="text-electric flex-shrink-0" size={20} />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-electric/10 to-electric/5 border border-electric/20 rounded-3xl p-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-3xl font-bold text-white mb-4">
            Start Automating Your Taxes Today
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            Join thousands of retailers who save hours every month with TAXFLOW's automated tax compliance.
          </p>
          <button className="bg-electric text-carbon px-8 py-4 rounded-xl font-bold text-lg hover:brightness-110 transition-all shadow-xl shadow-electric/20 flex items-center gap-3 mx-auto">
            Start Free Trial
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
