import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { cn } from '../../utils/cn';

interface IconButtonProps extends HTMLMotionProps<'button'> {
  icon: React.ReactNode;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'glass' | 'ghost' | 'solid' | 'accent';
  className?: string;
  tooltip?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  label,
  size = 'md',
  variant = 'glass',
  className,
  tooltip,
  ...props
}) => {
  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-sm',
    lg: 'p-2.5 text-base'
  };

  const variantClasses = {
    glass: 'bg-white/10 hover:bg-white/20 text-white border border-white/10 light:bg-slate-200/60 light:hover:bg-slate-300 light:text-slate-800 light:border-slate-300',
    ghost: 'hover:bg-white/10 text-white/80 hover:text-white light:text-slate-600 light:hover:bg-slate-200/50 light:hover:text-slate-900',
    solid: 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 light:bg-slate-100 light:hover:bg-slate-200 light:text-slate-800',
    accent: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'relative inline-flex items-center justify-center rounded-xl transition-all font-medium focus:outline-none focus:ring-2 focus:ring-white/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      title={tooltip || label}
      aria-label={label || tooltip || 'Button'}
      {...props}
    >
      {icon}
      {label && <span className="ml-1.5">{label}</span>}
    </motion.button>
  );
};
