'use client';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';

interface ExpiryModeSelectorProps {
    value: 'fixed' | 'rolling';
    onChange: (mode: 'fixed' | 'rolling') => void;
    compact?: boolean;
}

export const ExpiryModeSelector = ({ value, onChange, compact }: ExpiryModeSelectorProps) => {
    return (
        <ToggleButtonGroup
            value={value}
            exclusive
            onChange={(_, newValue) => { if (newValue !== null) onChange(newValue); }}
            size="small"
        >
            <ToggleButton value="rolling" sx={{ px: compact ? 1 : 1.5, py: 0.25, minHeight: 28, textTransform: 'none' }}>
                {compact ? 'Roll' : 'Rolling'}
            </ToggleButton>
            <ToggleButton value="fixed" sx={{ px: compact ? 1 : 1.5, py: 0.25, minHeight: 28, textTransform: 'none' }}>
                {compact ? 'Fix' : 'Fixed'}
            </ToggleButton>
        </ToggleButtonGroup>
    );
};
