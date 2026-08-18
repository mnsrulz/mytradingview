'use client';
import * as React from 'react';
import { Popover, TextField } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { StrikePriceSlider } from '@/components/StrikePriceSlider';
import { IStrikePriceSliderPorps } from '@/lib/types';

export const StrikePriceRangePicker = (props: IStrikePriceSliderPorps) => {
    const { allStrikePricesValues, onChange, strikePriceRange } = props;
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
    const open = Boolean(anchorEl);
    const range = [strikePriceRange.start, strikePriceRange.end];

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setAnchorEl(e.currentTarget);
        }
    };

    return <>
        <TextField
            label="Strike Range"
            variant="standard"
            size="small"
            value={`$${range[0]} — $${range[1]}`}
            onClick={(e) => setAnchorEl(e.currentTarget)}
            onKeyDown={handleKeyDown}
            aria-haspopup="dialog"
            aria-expanded={open}
            sx={{ minWidth: { xs: '100%', sm: 170 }, cursor: 'pointer', '& *': { cursor: 'pointer' } }}
            slotProps={{
                input: {
                    readOnly: true,
                    endAdornment: <ArrowDropDownIcon sx={{ color: 'text.secondary' }} />
                },
                htmlInput: { sx: { cursor: 'pointer' } }
            }}
        />
        <Popover open={open} anchorEl={anchorEl} onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            slotProps={{ paper: { sx: { width: 420 } } }}>
            <StrikePriceSlider allStrikePricesValues={allStrikePricesValues} onChange={onChange} strikePriceRange={strikePriceRange} />
        </Popover>
    </>;
};