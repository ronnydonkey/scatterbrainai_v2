import { useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface KeyboardShortcuts {
  [key: string]: () => void;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcuts, enabled: boolean = true) {
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;
    
    // Don't trigger if user is typing in an input
    if (event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement || 
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement).contentEditable === 'true') {
      return;
    }

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifierKey = isMac ? event.metaKey : event.ctrlKey;
    
    // Create key combination string
    let keyCombo = '';
    if (modifierKey) keyCombo += 'mod+';
    if (event.shiftKey) keyCombo += 'shift+';
    if (event.altKey) keyCombo += 'alt+';
    keyCombo += event.key.toLowerCase();
    
    // Check if shortcut exists and execute
    if (shortcuts[keyCombo]) {
      event.preventDefault();
      shortcuts[keyCombo]();
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [handleKeyPress, enabled]);
}

export function useGlobalKeyboardShortcuts() {
  const { toast } = useToast();

  const shortcuts = {
    'mod+enter': () => {
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
      if (textarea && textarea.value.trim()) {
        const submitButton = document.querySelector('[data-synthesis-submit]') as HTMLButtonElement;
        if (submitButton && !submitButton.disabled) {
          submitButton.click();
        }
      }
    },
    
    'mod+shift+g': () => {
      window.location.href = '/gallery';
    },
    
    'mod+k': () => {
      const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    },
    
    '?': () => {
      toast({
        title: "Keyboard Shortcuts",
        description: "Cmd+Enter: Synthesize, Cmd+K: Search, Cmd+Shift+G: Gallery",
        duration: 5000,
      });
    }
  };

  useKeyboardShortcuts(shortcuts, true);
}