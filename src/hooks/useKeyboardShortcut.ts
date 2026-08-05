import { useEffect } from 'react';

type KeyComboHandler = (e: KeyboardEvent) => void;

export function useKeyboardShortcut(
  keyCombo: string,
  callback: KeyComboHandler,
  options: { preventDefault?: boolean } = { preventDefault: true }
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger search shortcut if user is typing in an input/textarea
      const target = e.target as HTMLElement | null;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      if (keyCombo === '/' && isInput) {
        return;
      }

      if (e.key === keyCombo || e.code === keyCombo) {
        if (options.preventDefault) {
          e.preventDefault();
        }
        callback(e);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyCombo, callback, options]);
}
