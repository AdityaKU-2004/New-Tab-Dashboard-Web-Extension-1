import React, { useRef, useEffect } from 'react';
import { Search, X, Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  shortcutHint?: string;
  autoFocusRef?: React.RefObject<HTMLInputElement | null>;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onClear,
  shortcutHint = '/',
  autoFocusRef,
  className,
  placeholder = 'Search the web...',
  ...props
}) => {
  const localRef = useRef<HTMLInputElement>(null);
  const inputRef = autoFocusRef || localRef;

  return (
    <div className={cn('relative w-full group', className)}>
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/50 light:text-slate-400 group-focus-within:text-accent transition-colors">
        <Search className="w-5 h-5" />
      </div>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn(
          'w-full pl-11 pr-20 py-3.5 bg-white/10 dark:bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white placeholder-white/40 text-sm font-medium transition-all shadow-xl',
          'light:bg-white/80 light:text-slate-900 light:placeholder-slate-400 light:border-slate-300 light:shadow-slate-200/50',
          'focus:outline-none focus:ring-2 ring-accent focus:border-accent-full focus:bg-white/15 light:focus:bg-white'
        )}
        {...props}
      />

      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center gap-2">
        {value ? (
          <button
            type="button"
            onClick={onClear}
            className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 light:text-slate-400 light:hover:text-slate-700 light:hover:bg-slate-200 cursor-pointer transition-colors"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          shortcutHint && (
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs font-mono font-medium text-white/60 bg-white/10 light:bg-slate-200 light:text-slate-600 rounded-md border border-white/10 light:border-slate-300">
              {shortcutHint}
            </kbd>
          )
        )}
      </div>
    </div>
  );
};
