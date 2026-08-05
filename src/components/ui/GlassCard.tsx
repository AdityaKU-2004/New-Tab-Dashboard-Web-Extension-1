import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { cn } from '../../utils/cn';
import { useDashboardStore } from '../../store/useDashboardStore';

export interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  noPadding?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  hoverEffect = true,
  noPadding = false,
  ...props
}) => {
  const { backgroundBlur, cardOpacity, enableAnimations } = useDashboardStore((state) => state.settings);

  return (
    <motion.div
      initial={enableAnimations ? { opacity: 0, y: 12 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={enableAnimations && hoverEffect ? { y: -2, transition: { duration: 0.2 } } : undefined}
      style={{
        backdropFilter: `blur(${backgroundBlur}px)`,
        WebkitBackdropFilter: `blur(${backgroundBlur}px)`,
        backgroundColor: `rgba(255, 255, 255, ${cardOpacity})`
      }}
      className={cn(
        'relative rounded-3xl border border-white/10 shadow-2xl text-slate-50 transition-all overflow-hidden backdrop-blur-xl',
        'light:bg-white/75 light:text-slate-900 light:border-slate-200/80 light:shadow-slate-300/50',
        noPadding ? 'p-0' : 'p-5 sm:p-6',
        className
      )}
      {...props}
    >
      {/* Subtle top subtle highlight glare */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {children}
    </motion.div>
  );
};
