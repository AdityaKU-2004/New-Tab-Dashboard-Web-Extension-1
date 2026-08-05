import React from 'react';
import { GlassCard, GlassCardProps } from './GlassCard';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface DashboardCardProps extends GlassCardProps {
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  headerAction?: React.ReactNode;
  dragHandle?: boolean;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  subtitle,
  icon: Icon,
  headerAction,
  children,
  className,
  dragHandle = false,
  ...props
}) => {
  return (
    <GlassCard className={cn('flex flex-col h-full', className)} {...props}>
      {(title || Icon || headerAction) && (
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10 light:border-slate-200/80">
          <div className="flex items-center gap-2.5">
            {Icon && <Icon className="w-4 h-4 text-white/80 light:text-slate-600" />}
            <div>
              {title && <h3 className="text-sm font-semibold tracking-wide text-white/90 light:text-slate-800">{title}</h3>}
              {subtitle && <p className="text-xs text-white/50 light:text-slate-500">{subtitle}</p>}
            </div>
          </div>
          {headerAction && <div className="flex items-center gap-1.5">{headerAction}</div>}
        </div>
      )}
      <div className="flex-1 min-h-0 flex flex-col">{children}</div>
    </GlassCard>
  );
};
