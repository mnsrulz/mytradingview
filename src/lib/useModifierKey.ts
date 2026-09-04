'use client';
import { useEffect, useState } from 'react';

export const useModifierKey = () => {
    const [modifierKey, setModifierKey] = useState('⌘');
    const [modifierLabel, setModifierLabel] = useState('⌘K');
    const [enterKey, setEnterKey] = useState('↵');

    useEffect(() => {
        const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
        setModifierKey(isMac ? '⌘' : 'Ctrl');
        setModifierLabel(isMac ? '⌘K' : 'Ctrl+K');
        setEnterKey(isMac ? '↵' : 'Enter');
    }, []);

    return {
        isMac: modifierKey === '⌘',
        modifierKey,
        modifierLabel,
        enterKey,
    };
};
