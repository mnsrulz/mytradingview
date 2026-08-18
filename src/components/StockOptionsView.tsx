'use client';
import { Box, Divider, IconButton, LinearProgress, Paper, Tab, Tabs } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import { useState } from 'react';
import { useOptionTrackerV2 } from '../lib/hooks';
import { OptionsPricingGrid } from './optionsPricing/OptionsPricingGrid';
import { OptionsPricingControls } from './optionsPricing/OptionsPricingControls';
import { OptionsPricingHeader } from './optionsPricing/OptionsPricingHeader';
import { PutCallRatio } from './PutCallRatio';
import { buildRows, getWorkingStrikes } from '@/lib/optionsPricing/calculator';
import { OptionsInnerData, PriceModeTypeEnum, PutCallType, ValueModeTypeEnum } from '@/lib/types';
import { useQueryState, parseAsStringEnum } from 'nuqs';

interface ITickerProps {
    symbol: string
}

export const StockOptionsView = (props: ITickerProps) => {
    const [refreshToken, setRefreshToken] = useState('');
    const { data, isLoading, strikePriceRange, setStrikePriceRange, targetPrice, setTargetPrice, costBasis, setCostBasis } = useOptionTrackerV2(props.symbol, refreshToken);
    const [putCallTabValue, handleCallTabValue] = useQueryState<PutCallType>('tab', parseAsStringEnum<PutCallType>(Object.values(PutCallType)).withDefault(PutCallType.PUT));
    const [priceMode, setPriceMode] = useQueryState<PriceModeTypeEnum>('pricemode', parseAsStringEnum<PriceModeTypeEnum>(Object.values(PriceModeTypeEnum)).withDefault(PriceModeTypeEnum.BID_PRICE));
    const [valueMode, setValueMode] = useQueryState<ValueModeTypeEnum>('valuemode', parseAsStringEnum<ValueModeTypeEnum>(Object.values(ValueModeTypeEnum)).withDefault(ValueModeTypeEnum.ANNUAL_RETURN));
    const [pcrSelectedData, setPcrSelectedData] = useState<OptionsInnerData | undefined>();
    const [pcrOpen, setPcrOpen] = useState(false);
    const [controlsAnchorEl, setControlsAnchorEl] = useState<HTMLElement | null>(null);

    function handlePcrSelection(v: string) {
        const fss = data?.options[v];
        if (fss) {
            setPcrSelectedData(fss);
            setPcrOpen(true);
        }
    }

    if (isLoading) return <LinearProgress />;
    const allDates = data && Array.from(Object.keys(data.options));
    const allStrikePrices = allDates && Array.from(new Set(allDates.flatMap(d => Object.keys(data.options[d].c))));
    if (!allDates || !allStrikePrices) return <div>no option data found!!!</div>;

    const workingStrikes = getWorkingStrikes(allStrikePrices, strikePriceRange);
    const rows = buildRows({
        dates: allDates,
        chain: data.options,
        workingStrikes,
        putCallType: putCallTabValue,
        priceMode,
        valueMode,
        targetPrice,
        costBasis
    });

    return <Paper>
        <OptionsPricingHeader symbol={props.symbol} spotPrice={data.spotPrice} timestamp={data.timestamp} onRefresh={() => setRefreshToken(Date.now().toString())}
            mobileActions={
                <IconButton size="small" title="Options controls" aria-label="Options controls"
                    onClick={(e) => setControlsAnchorEl(e.currentTarget)}>
                    <TuneIcon />
                </IconButton>
            }>
            <OptionsPricingControls
                priceMode={priceMode}
                onPriceModeChange={setPriceMode}
                valueMode={valueMode}
                onValueModeChange={setValueMode}
                targetPrice={targetPrice}
                onTargetPriceChange={setTargetPrice}
                costBasis={costBasis}
                onCostBasisChange={setCostBasis}
                putCallTabValue={putCallTabValue}
                strikePriceRange={strikePriceRange}
                allStrikePricesValues={allStrikePrices.map(Number)}
                onStrikePriceRangeChange={setStrikePriceRange}
                popoverAnchorEl={controlsAnchorEl}
                onPopoverClose={() => setControlsAnchorEl(null)}
            />
        </OptionsPricingHeader>
        <Divider />
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={putCallTabValue} onChange={(e, v) => handleCallTabValue(v)} variant="fullWidth" indicatorColor="secondary"
                textColor="secondary">
                <Tab label="PUT" value={'PUT'} />
                <Tab label="CALL" value='CALL' />
            </Tabs>
        </Box>
        <OptionsPricingGrid rows={rows} workingStrikes={workingStrikes} valueMode={valueMode} onExpiryClick={handlePcrSelection} />
        {
            pcrSelectedData && <PutCallRatio
                open={pcrOpen}
                data={pcrSelectedData}
                currentPrice={data.spotPrice}
                onClose={() => setPcrOpen(false)} />
        }
    </Paper>
}