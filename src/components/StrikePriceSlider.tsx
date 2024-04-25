import * as React from 'react';
import { Grid, Slider, Stack } from '@mui/material';
import { IStrikePriceSliderPorps } from './stock-options-view';

export const StrikePriceSlider = (props: IStrikePriceSliderPorps) => {
    const { allStrikePricesValues, onChange, strikePriceRange } = props;
    const t = [strikePriceRange.start, strikePriceRange.end];
    const [minStrikePrice, maxStrikePrice] = [Math.min.apply(null, allStrikePricesValues), Math.max.apply(null, allStrikePricesValues)];
    // const [minStrikePrice, maxStrikePrice] = [currentPrice - thresholdValue, currentPrice + thresholdValue];
    const strikePriceMarks = allStrikePricesValues.map(m => ({ value: m }));
    const handleChange = (e: Event, v: number | number[]) => {
        const value = v as number[];
        onChange({
            start: value[0],
            end: value[1]
        });
    };

    return <div>
        <div>Strike Price Range: {t[0]} - {t[1]}</div>
        <Stack direction="row" sx={{ m: 1 }} alignItems="center">
            <Grid item>
            </Grid>
            <Slider
                getAriaLabel={() => 'Strike price'}
                value={t}
                onChange={handleChange}
                valueLabelDisplay="auto"
                min={minStrikePrice}
                max={maxStrikePrice}
                marks={strikePriceMarks}
                step={null} />
        </Stack>
    </div>;
};
