import React, { useState } from 'react';
import { DashboardCard } from '../ui/DashboardCard';
import { RecentTabItem } from './RecentTabItem';
import { useDashboardStore } from '../../store/useDashboardStore';
import { Layers, Search } from 'lucide-react';
import { AnimatePresence } from 'motion/react';

export const RecentTabsList: React.FC = () => {
  const recentTabs = useDashboardStore((state) => state.recentTabs);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTabs = recentTabs.filter(
    (t) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardCard
      title="Recent & Open Tabs"
      subtitle={`${recentTabs.length} active sessions`}
      icon={Layers}
    >
      {/* Search Filter input */}
      <div className="relative mb-3">
        <Search className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-white/40 light:text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter recent tabs..."
          className="w-full pl-9 pr-3.5 py-2 bg-white/10 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 light:bg-slate-100 light:text-slate-900 light:border-slate-300 transition-all"
        />
      </div>

      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {filteredTabs.map((tab) => (
            <RecentTabItem key={tab.id} tab={tab} />
          ))}
        </AnimatePresence>

        {filteredTabs.length === 0 && (
          <div className="py-6 text-center text-xs text-white/50 light:text-slate-400 italic">
            No tabs match search query.
          </div>
        )}
      </div>
    </DashboardCard>
  );
};
