
import * as React from 'react';
import { NumberRange, useOptionTracker } from '../lib/socket';
import { GridColDef, DataGrid, gridClasses } from '@mui/x-data-grid';
import { Box, FormControl, Grid, InputLabel, MenuItem, Paper, Select, Slider, Stack, Tab, Tabs, LinearProgress, TextField } from '@mui/material';
import { useState } from 'react';
import dayjs from 'dayjs';
import { percentageFormatter } from '@/lib/formatters';
import { ConditionalFormattingBox } from './conditional-formatting';

interface ITickerProps {
    symbol: string
}


type IStrikePriceSliderPorps = { allStrikePricesValues: number[], onChange: (v: NumberRange) => void, currentPrice: number, strikePriceRange: NumberRange }

const StrikePriceSlider = (props: IStrikePriceSliderPorps) => {
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
                step={null}
            // scale={calculateValue}
            //getAriaValueText={valuetext}
            />
        </Stack>
    </div>
}
type PriceModeType = 'LAST_PRICE' | 'BID_PRICE' | 'ASK_PRICE' | 'AVG_PRICE'
type ValueModeType = 'PRICE' | 'ANNUAL_RETURN' | 'TOTAL_RETURN'

const numberFormatter = (v: string) => v && Number(v);
const todaysDate = dayjs().format('YYYY-MM-DD');
export const StockOptionsView = (props: ITickerProps) => {
    const { data, isLoading, strikePriceRange, setStrikePriceRange, targetPrice, setTargetPrice } = useOptionTracker(props.symbol);

    const [putCallTabValue, setPutCallTabValue] = useState<'PUT' | 'CALL'>('PUT');
    const [priceMode, setPriceMode] = useState<PriceModeType>('AVG_PRICE');
    const [valueMode, setValueMode] = useState<ValueModeType>('PRICE');

    if (isLoading) return <LinearProgress />;
    const allDates = data && Array.from(Object.keys(data.options));
    const allStrikePrices = allDates && Array.from(new Set(allDates.flatMap(d => Object.keys(data.options[d].c))))//.map(Number).sort(function (a, b) { return a - b; });
    if (!allDates || !allStrikePrices) return <div>no option data found!!!</div>;
    const allStrikePricesValues = allStrikePrices?.map(Number)
    const columns: GridColDef[] = [
        { field: 'id', width: 120, headerName: 'expiry' },
    ];

    const workingStrikePrices = allStrikePrices.map(s => ({
        strikePrice: s,
        value: Number(s)
    })).filter(n => n.value >= strikePriceRange.start && n.value <= strikePriceRange.end);

    workingStrikePrices.sort(function (a, b) { return a.value - b.value; }).forEach(s => {
        columns.push({
            field: s.strikePrice,
            width: 10, headerName: `${parseFloat(s.strikePrice)}`,
            valueFormatter: valueMode == 'PRICE' ? numberFormatter : percentageFormatter, type: 'number',
            renderCell: valueMode == 'PRICE' ? undefined : (p) => <ConditionalFormattingBox value={p.value * 1000} formattedValue={p.formattedValue} />
        })
    })

    const traderows = allDates?.map(d => {
        if (dayjs(d).isBefore(todaysDate)) return null;
        const o: any = {
            id: d
        }
        const numberofdays = dayjs(d).diff(todaysDate, 'days') + 1;
        workingStrikePrices.forEach(s => {
            const po = putCallTabValue == 'CALL' ? data.options[d].c[s.strikePrice] : data.options[d].p[s.strikePrice];
            const price = (() => {
                switch (priceMode) {
                    case 'LAST_PRICE':
                        return po?.l;
                    case 'ASK_PRICE':
                        return po?.a;
                    case 'AVG_PRICE':
                        return (po?.a + po?.b) ? (po?.a + po?.b) / 2 : null;
                    default:
                        return po?.b;
                }
            })();

            o[s.strikePrice] = price && (() => {
                switch (valueMode) {
                    case 'TOTAL_RETURN':
                        if (putCallTabValue == 'PUT') {
                            return (targetPrice > s.value ? price : (price - (s.value - targetPrice))) / (s.value);
                        } else {
                            return (price / targetPrice);
                        }
                    case 'ANNUAL_RETURN':
                        if (putCallTabValue == 'PUT') {
                            const sellCost = (targetPrice > s.value ? price : (price - (s.value - targetPrice)));
                            const risk = s.value;
                            return (sellCost / risk) * (365 / numberofdays);
                        } else {
                            const sellCost = (targetPrice < s.value ? price : (price - (targetPrice - s.value)));
                            return (sellCost / targetPrice) * (365 / numberofdays);
                        }
                    default:
                        return price?.toFixed(2);
                }
            })();
        });
        return o;
    }).filter(r => r);

    return <Paper>
        Symbol: {props.symbol} - {data.currentPrice}
        {/* <FormControl sx={{ m: 1 }} variant="standard">
            <InputLabel htmlFor="demo-customized-textbox">Age</InputLabel>
            <BootstrapInput id="demo-customized-textbox" />
        </FormControl> */}
        <StrikePriceSlider currentPrice={data.currentPrice}
            allStrikePricesValues={allStrikePricesValues}
            onChange={setStrikePriceRange}
            strikePriceRange={strikePriceRange}
        />
        <FormControl sx={{ m: 1 }} variant="standard">
            <InputLabel>Price Mode</InputLabel>
            <Select value={priceMode} onChange={(e, v) => setPriceMode(e.target.value as PriceModeType)}            >
                <MenuItem value="LAST_PRICE">LAST_PRICE</MenuItem>
                <MenuItem value="BID_PRICE">BID_PRICE</MenuItem>
                <MenuItem value="ASK_PRICE">ASK_PRICE</MenuItem>
                <MenuItem value="AVG_PRICE">AVG_PRICE</MenuItem>
            </Select>
        </FormControl>
        <FormControl sx={{ m: 1 }} variant="standard">
            <InputLabel>Value Mode</InputLabel>
            <Select value={valueMode} onChange={(e, v) => setValueMode(e.target.value as ValueModeType)}>
                <MenuItem value="PRICE">PRICE</MenuItem>
                <MenuItem value="ANNUAL_RETURN">ANNUAL_RETURN</MenuItem>
                <MenuItem value="TOTAL_RETURN">TOTAL_RETURN</MenuItem>
            </Select>
        </FormControl>
        <FormControl sx={{ m: 1 }} variant="standard">
            <TextField label="Target price" variant="standard" value={targetPrice} onChange={v => setTargetPrice(Number(v.target.value))} type='number' />
        </FormControl>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={putCallTabValue} onChange={(e, v) => setPutCallTabValue(v)} variant="fullWidth" indicatorColor="secondary"
                textColor="secondary">
                <Tab label="PUT" value={'PUT'} />
                <Tab label="CALL" value='CALL' />
            </Tabs>
        </Box>
        {
            <DataGrid rows={traderows}
                disableColumnMenu={true}
                disableColumnFilter={true}
                disableColumnSorting={true}
                columns={columns}
                density="compact"
                // disableRowSelectionOnClick
                columnHeaderHeight={32}
                rowHeight={32}
                hideFooter={true}
                showColumnVerticalBorder={true}
                showCellVerticalBorder={true}
                sx={{
                    [`& .${gridClasses.cell}:focus, & .${gridClasses.cell}:focus-within`]: {
                        outline: 'none',
                    },
                    [`& .${gridClasses.columnHeader}:focus, & .${gridClasses.columnHeader}:focus-within`]:
                    {
                        outline: 'none',
                    },
                    [`& .${gridClasses.columnHeader}`]:
                    {
                        fontSize: '0.7rem',
                        fontWeight: 500
                    },
                    [`& .${gridClasses.cell}`]:
                    {
                        fontSize: '0.7rem',
                        padding: 0
                    },
                }}
            // style={{
            //     // fontSize: '12px'
            // }}
            // apiRef={apiRef} 
            />
        }
        {/* <DataGrid rows={d1}
            columns={columns}
            sx={{ display: 'grid' }}
            getRowId={(r) => `${r.symbol} - ${r.name}`} /> */}
    </Paper>
}
