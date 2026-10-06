'use client';

import { ToggleButton, ToggleButtonGroup } from '@mui/material';

interface TimeframeSelectorProps {
    value: number;
    onChange: (lookbackDays: number) => void;
}

const TIMEFRAMES = [
    { label: '1m', days: 30 },
    { label: '3m', days: 90 },
    { label: '6m', days: 180 },
    { label: '1y', days: 365 },
];

export const TimeframeSelector = ({
    value,
    onChange,
}: TimeframeSelectorProps) => (
    <ToggleButtonGroup
        value={value}
        exclusive
        size="small"
        onChange={(_, value) => value !== null && onChange(value)}
    >
        {TIMEFRAMES.map(({ label, days }) => (
            <ToggleButton key={days} value={days}>
                {label}
            </ToggleButton>
        ))}
    </ToggleButtonGroup>
);