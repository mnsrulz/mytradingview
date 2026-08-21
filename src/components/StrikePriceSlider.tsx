import * as React from 'react';
import { Box, Slider, Stack, Typography } from '@mui/material';
import { IStrikePriceSliderPorps } from '@/lib/types';

export const StrikePriceSlider = (props: IStrikePriceSliderPorps) => {
    const { allStrikePricesValues, onChange, strikePriceRange } = props;
    const range = [strikePriceRange.start, strikePriceRange.end];
    const [minStrikePrice, maxStrikePrice] = [Math.min(...allStrikePricesValues), Math.max(...allStrikePricesValues)];
    const strikePriceMarks = allStrikePricesValues.map(m => ({ value: m }));
    const handleChange = (e: Event, v: number | number[]) => {
        const value = v as number[];
        onChange({
            start: value[0],
            end: value[1]
        });
    };

    return <Box sx={{ px: 2, py: 1.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">Strike Price Range</Typography>
            <Typography variant="body2">${range[0]} — ${range[1]}</Typography>
        </Stack>
        <Slider
            getAriaLabel={() => 'Strike price'}
            value={range}
            onChange={handleChange}
            valueLabelDisplay="auto"
            min={minStrikePrice}
            max={maxStrikePrice}
            marks={strikePriceMarks}
            step={null} />
    </Box>;
};