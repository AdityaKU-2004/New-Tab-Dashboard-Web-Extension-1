import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SectionTitleProps {
  title: string;
  icon?: LucideIcon;
  badge?: string | number;
  action?: React.ReactNode;
  className?: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ title, icon: Icon, badge, action, className }) => {
  return (
    <div className={cn('flex items-center justify-between mb-3', className)}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-white/70 light:text-slate-600" />}
        <h2 className="text-sm font-semibold tracking-wider text-white/90 light:text-slate-800 uppercase">{title}</h2>
        {badge !== undefined && (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-white/10 text-white/80 light:bg-slate-200 light:text-slate-700">
            {badge}
          </span>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};
