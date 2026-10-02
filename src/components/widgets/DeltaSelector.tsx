'use client';

import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
} from '@mui/material';

interface DeltaSelectorProps {
    value: number;
    onChange: (delta: number) => void;
    compact?: boolean;
}

const DELTA_OPTIONS = [10, 15, 20, 25, 30, 40, 50, 70];

export const DeltaSelector = ({
    value,
    onChange,
    compact = false,
}: DeltaSelectorProps) => {
    const handleChange = (event: SelectChangeEvent<number>) => {
        onChange(Number(event.target.value));
    };

    return (
        <FormControl
            size="small"
            sx={{
                minWidth: 56,
            }}
        >
            <InputLabel sx={{ fontSize: '0.9rem' }} id="delta-selector-label">Delta</InputLabel>
            <Select<number>
                labelId="delta-selector-label"
                value={value}
                onChange={handleChange}
                sx={{
                    height: compact ? 26 : 34,
                    fontSize: compact ? '0.7rem' : '0.875rem',
                    '& .MuiSelect-select': {
                        py: 0,
                        px: compact ? 0.75 : 1,
                        pr: compact ? '20px !important' : undefined,
                    },
                    '& .MuiSelect-icon': {
                        right: compact ? 1 : 4,
                        fontSize: compact ? 16 : 20,
                    },
                }}
            >
                {DELTA_OPTIONS.map((delta) => (
                    <MenuItem
                        key={delta}
                        value={delta}
                        sx={{
                            minHeight: 30,
                            fontSize: '0.75rem',
                            px: 1.25,
                            py: 0.5,
                        }}
                    >
                        {delta}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};