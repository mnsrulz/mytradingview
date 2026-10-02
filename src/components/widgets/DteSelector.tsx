'use client';

import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
} from '@mui/material';

interface DteSelectorProps {
    value: number;
    onChange: (dte: number) => void;
    compact?: boolean;
}

const DTE_OPTIONS = [10, 20, 30, 45, 60, 90];

export const DteSelector = ({
    value,
    onChange,
    compact = false,
}: DteSelectorProps) => {
    const handleChange = (event: SelectChangeEvent<number>) => {
        onChange(Number(event.target.value));
    };

    return (
        <FormControl
            size="small"
            sx={{
                minWidth: compact ? 45 : 70,
            }}
        >
            <InputLabel sx={{ fontSize: '0.75rem' }} id="dte-selector-label">DTE</InputLabel>
            <Select<number>
                labelId="dte-selector-label"
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
                {DTE_OPTIONS.map((dte) => (
                    <MenuItem
                        key={dte}
                        value={dte}
                        sx={{
                            minHeight: 30,
                            fontSize: '0.75rem',
                            px: 1.25,
                            py: 0.5,
                        }}
                    >
                        {dte}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};