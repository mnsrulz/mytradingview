'use client';
import { useMemo } from 'react';

export const useModifierKey = () => {
    return useMemo(() => {
        const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
        return {
            isMac,
            modifierKey: isMac ? '⌘' : 'Ctrl',
            modifierLabel: isMac ? '⌘K' : 'Ctrl+K',
            enterKey: isMac ? '↵' : 'Enter',
        };
    }, []);
};
