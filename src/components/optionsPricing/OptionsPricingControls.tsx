'use client';
import { Box, FormControl, InputLabel, MenuItem, Popover, Select, Stack, TextField } from '@mui/material';
import { IStrikePriceSliderPorps, PriceModeTypeEnum, PutCallType, ValueModeTypeEnum } from '@/lib/types';
import { StrikePriceRangePicker } from './StrikePriceRangePicker';

interface OptionsPricingControlsProps {
    priceMode: PriceModeTypeEnum;
    onPriceModeChange: (v: PriceModeTypeEnum) => void;
    valueMode: ValueModeTypeEnum;
    onValueModeChange: (v: ValueModeTypeEnum) => void;
    targetPrice: number;
    onTargetPriceChange: (v: number) => void;
    costBasis: number;
    onCostBasisChange: (v: number) => void;
    putCallTabValue: PutCallType;
    strikePriceRange: IStrikePriceSliderPorps['strikePriceRange'];
    allStrikePricesValues: number[];
    onStrikePriceRangeChange: (v: IStrikePriceSliderPorps['strikePriceRange']) => void;
    popoverAnchorEl: HTMLElement | null;
    onPopoverClose: () => void;
}

export const OptionsPricingControls = (props: OptionsPricingControlsProps) => {
    const { priceMode, onPriceModeChange, valueMode, onValueModeChange, targetPrice, onTargetPriceChange, costBasis, onCostBasisChange, putCallTabValue, strikePriceRange, allStrikePricesValues, onStrikePriceRangeChange, popoverAnchorEl, onPopoverClose } = props;

    const controls = <>
        <FormControl sx={{ minWidth: { xs: '100%', sm: 110 } }} variant="standard" size="small">
            <InputLabel>Price Mode</InputLabel>
            <Select value={priceMode} label="Price Mode" onChange={(e) => onPriceModeChange(e.target.value as PriceModeTypeEnum)}>
                <MenuItem value="LAST_PRICE">Last</MenuItem>
                <MenuItem value="BID_PRICE">Bid</MenuItem>
                <MenuItem value="ASK_PRICE">Ask</MenuItem>
                <MenuItem value="AVG_PRICE">Mid</MenuItem>
            </Select>
        </FormControl>
        <FormControl sx={{ minWidth: { xs: '100%', sm: 150 } }} variant="standard" size="small">
            <InputLabel>Value Mode</InputLabel>
            <Select value={valueMode} onChange={(e) => onValueModeChange(e.target.value as ValueModeTypeEnum)}>
                <MenuItem value="PRICE">Price</MenuItem>
                <MenuItem value="ANNUAL_RETURN">Annual Return</MenuItem>
                <MenuItem value="TOTAL_RETURN">Total Return</MenuItem>
                <MenuItem value="PCR">OI</MenuItem>
                <MenuItem value="VOLUME">Volume</MenuItem>
            </Select>
        </FormControl>
        <TextField label="Target price" variant="standard" size="small" sx={{ width: { xs: '100%', sm: 110 } }} value={targetPrice} onChange={v => onTargetPriceChange(Number(v.target.value))} type='number' />
        {putCallTabValue == PutCallType.CALL &&
            <TextField label="Cost basis" variant="standard" size="small" sx={{ width: { xs: '100%', sm: 110 } }} value={costBasis} onChange={v => onCostBasisChange(Number(v.target.value))} type='number' />
        }
        <StrikePriceRangePicker allStrikePricesValues={allStrikePricesValues} onChange={onStrikePriceRangeChange} strikePriceRange={strikePriceRange} />
    </>;

    return <>
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Stack direction="row" spacing={2} alignItems="flex-end" sx={{ flexWrap: 'wrap' }}>
                {controls}
            </Stack>
        </Box>
        <Popover open={Boolean(popoverAnchorEl)} anchorEl={popoverAnchorEl} onClose={onPopoverClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
            <Stack direction="column" spacing={1.5} sx={{ p: 1.5, width: 280, maxWidth: 'calc(100vw - 32px)' }}>
                {controls}
            </Stack>
        </Popover>
    </>;
}