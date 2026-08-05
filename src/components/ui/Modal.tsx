import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';
import { useDashboardStore } from '../../store/useDashboardStore';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md'
}) => {
  const enableAnimations = useDashboardStore((state) => state.settings.enableAnimations);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={enableAnimations ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={enableAnimations ? { opacity: 0, scale: 0.95, y: 16 } : false}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25 }}
            className={`relative w-full ${maxWidthClasses[maxWidth]} bg-slate-900/90 dark:bg-slate-950/95 backdrop-blur-xl border border-white/15 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 text-white light:bg-white light:text-slate-900 light:border-slate-200 z-10`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10 light:border-slate-200">
              <h3 className="text-lg font-semibold tracking-wide">{title}</h3>
              <IconButton
                icon={<X className="w-5 h-5" />}
                onClick={onClose}
                variant="ghost"
                size="sm"
                tooltip="Close (Esc)"
              />
            </div>
            <div className="mt-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
