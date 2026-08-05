import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../hooks/useTheme';

interface AnimatedButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  ...props
}) => {
  const { accentStyles } = useTheme();

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs font-medium rounded-lg',
    md: 'px-4 py-2 text-sm font-semibold rounded-xl',
    lg: 'px-5 py-2.5 text-base font-semibold rounded-2xl'
  };

  const variantClasses = {
    primary: `${accentStyles.bg} text-white shadow-md hover:opacity-90 transition-opacity`,
    secondary: 'bg-white/10 hover:bg-white/20 text-white border border-white/15 light:bg-slate-200 light:text-slate-900 light:hover:bg-slate-300',
    outline: 'border border-white/20 text-white hover:bg-white/10 light:border-slate-300 light:text-slate-800 light:hover:bg-slate-100',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30',
    ghost: 'text-white/80 hover:text-white hover:bg-white/10 light:text-slate-700 light:hover:bg-slate-200/60'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'inline-flex items-center justify-center transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses[size],
        variantClasses[variant],
        fullWidth ? 'w-full' : '',
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
};
