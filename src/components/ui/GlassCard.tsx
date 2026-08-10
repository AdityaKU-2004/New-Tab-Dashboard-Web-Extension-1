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
  style,
  ...props
}) => {
  const { backgroundBlur, cardOpacity, enableAnimations, theme } = useDashboardStore((state) => state.settings);
  const opacityVal = cardOpacity ?? 0.6;
  const isLight = theme === 'light';
  const isCyberpunk = theme === 'cyberpunk';

  const defaultBgColor = isCyberpunk
    ? `rgba(8, 13, 26, ${Math.max(0.2, opacityVal * 0.85)})`
    : isLight
    ? `rgba(255, 255, 255, ${opacityVal})`
    : `rgba(15, 23, 42, ${opacityVal})`;

  return (
    <motion.div
      initial={enableAnimations ? { opacity: 0, y: 12 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={enableAnimations && hoverEffect ? { y: -2, transition: { duration: 0.2 } } : undefined}
      style={{
        backdropFilter: `blur(${backgroundBlur}px)`,
        WebkitBackdropFilter: `blur(${backgroundBlur}px)`,
        backgroundColor: defaultBgColor,
        ...style,
      }}
      className={cn(
        'relative rounded-3xl border shadow-2xl transition-all overflow-hidden',
        isCyberpunk
          ? 'border-[#00f3ff]/40 text-[#00f3ff] shadow-[0_0_15px_rgba(0,243,255,0.15)]'
          : 'dark:border-white/10 dark:text-slate-50 light:border-slate-300/80 light:text-slate-900 light:shadow-slate-300/40',
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
