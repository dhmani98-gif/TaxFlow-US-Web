import { motion } from 'framer-motion';

export function SkeletonCard() {
  return (
    <div className="bg-carbon border border-white/5 rounded-xl p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-slate-700 rounded-lg animate-pulse" />
        <div className="flex-1">
          <div className="h-4 bg-slate-700 rounded w-32 mb-2 animate-pulse" />
          <div className="h-3 bg-slate-700 rounded w-20 animate-pulse" />
        </div>
      </div>
      <div className="h-8 bg-slate-700 rounded w-24 mb-2 animate-pulse" />
      <div className="h-3 bg-slate-700 rounded w-full animate-pulse" />
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="bg-carbon border border-white/5 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-white/5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-4 bg-slate-700 rounded w-24 animate-pulse" />
        ))}
      </div>
      {/* Rows */}
      {[1, 2, 3, 4, 5].map((row) => (
        <div key={row} className="flex items-center gap-4 p-4 border-b border-white/5">
          {[1, 2, 3, 4, 5].map((col) => (
            <div key={col} className="h-4 bg-slate-700 rounded w-24 animate-pulse" style={{ animationDelay: `${row * col * 0.05}s` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="bg-carbon border border-white/5 rounded-xl p-6">
      <div className="h-6 bg-slate-700 rounded w-40 mb-6 animate-pulse" />
      <div className="h-64 bg-slate-700/50 rounded-lg animate-pulse" />
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div
          key={i}
          className="h-4 bg-slate-700 rounded animate-pulse"
          style={{
            width: `${Math.random() * 40 + 60}%`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-carbon border border-white/5 rounded-xl p-6">
          <div className="h-4 bg-slate-700 rounded w-24 mb-4 animate-pulse" />
          <div className="h-8 bg-slate-700 rounded w-20 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-8 p-8">
      <SkeletonStats />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonChart />
        <SkeletonChart />
      </div>
      <SkeletonTable />
    </div>
  );
}
