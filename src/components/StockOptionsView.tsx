
import * as React from 'react';
import { useOptionTracker } from '../lib/socket';
import { GridColDef, DataGrid, gridClasses } from '@mui/x-data-grid';
import { Box, FormControl, InputLabel, MenuItem, Paper, Select, Tab, Tabs, LinearProgress, TextField, Button, Link, IconButton, Dialog, DialogContent, DialogTitle, Input } from '@mui/material';
import { useState } from 'react';
import dayjs from 'dayjs';
import { percentageFormatter } from '@/lib/formatters';
import { ConditionalFormattingBox } from './ConditionalFormattingBox';
import { PutCallRatio } from './PutCallRatio';
import { IOptionsGrid, NumberRange, OptionsInnerData } from '@/lib/types';
import { StrikePriceSlider } from './StrikePriceSlider';
import { DeltaGammaHedging } from './DeltaGammaHedging';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryState, parseAsStringEnum, parseAsBoolean } from 'nuqs';
import EditIcon from '@mui/icons-material/Edit';
import { TickerSearch } from './TickerSearch';
import he from 'he';

interface ITickerProps {
    symbol: string
}


export type IStrikePriceSliderPorps = { allStrikePricesValues: number[], onChange: (v: NumberRange) => void, currentPrice: number, strikePriceRange: NumberRange }

type PriceModeType = 'LAST_PRICE' | 'BID_PRICE' | 'ASK_PRICE' | 'AVG_PRICE'
type ValueModeType = 'PRICE' | 'ANNUAL_RETURN' | 'TOTAL_RETURN' | 'PCR'
// type PutCallType = 'PUT' | 'CALL';
enum PutCallType {
    'PUT' = 'PUT',
    'CALL' = 'CALL'
}

const numberFormatter = (v: string) => v && Number(v);
const todaysDate = dayjs().format('YYYY-MM-DD');
export const StockOptionsView = (props: ITickerProps) => {
    const { data, isLoading, strikePriceRange, setStrikePriceRange, targetPrice, setTargetPrice } = useOptionTracker(props.symbol);
    const [openSearchTickerDialog, setOpenSearchTickerDialog] = useState(false);
    const router = useRouter();

    const [putCallTabValue, handleCallTabValue] = useQueryState<PutCallType>('tab', parseAsStringEnum<PutCallType>(Object.values(PutCallType)).withDefault(PutCallType.PUT));
    const [priceMode, setPriceMode] = useState<PriceModeType>('AVG_PRICE');
    const [valueMode, setValueMode] = useState<ValueModeType>('PRICE');
    const [pcrSelectedData, setPcrSelectedData] = useState<OptionsInnerData | undefined>();
    const [pcrOpen, setPcrOpen] = useState(false);
    const [deltaHedgingOpen, setDeltaHedgingOpen] = useQueryState('showDexGex', parseAsBoolean);

    function handlePcrSelection(v: string) {
        const fss = data?.options[v];
        if (fss) {
            setPcrSelectedData(fss);
            setPcrOpen(true);
        }
    }

    if (isLoading) return <LinearProgress />;
    const allDates = data && Array.from(Object.keys(data.options));
    const allStrikePrices = allDates && Array.from(new Set(allDates.flatMap(d => Object.keys(data.options[d].c))))//.map(Number).sort(function (a, b) { return a - b; });
    if (!allDates || !allStrikePrices) return <div>no option data found!!!</div>;
    const allStrikePricesValues = allStrikePrices?.map(Number)
    const columns: GridColDef[] = [
        { field: 'id', width: 120, headerName: 'expiry', renderCell: (v) => <Link title='View put call ratio' onClick={() => handlePcrSelection(v.value)}>{v.value}</Link> },
    ];

    const workingStrikePrices = allStrikePrices.map(s => ({
        strikePrice: s,
        value: Number(s)
    })).filter(n => n.value >= strikePriceRange.start && n.value <= strikePriceRange.end);

    workingStrikePrices.sort(function (a, b) { return a.value - b.value; }).forEach(s => {
        columns.push({
            field: s.strikePrice,
            width: 10, headerName: `${parseFloat(s.strikePrice)}`,
            valueFormatter: ['PRICE', 'PCR'].includes(valueMode) ? numberFormatter : percentageFormatter, type: 'number',
            renderCell: ['PRICE', 'PCR'].includes(valueMode) ? undefined : (p) => <ConditionalFormattingBox value={p.value * 1000} formattedValue={p.formattedValue} />
        })
    })

    const traderows = allDates?.map(d => {
        if (dayjs(d).isBefore(todaysDate)) return null;
        const o: IOptionsGrid = {
            id: d
        }
        const numberofdays = dayjs(d).diff(todaysDate, 'days') + 1;
        workingStrikePrices.forEach(s => {
            const po = putCallTabValue == PutCallType.CALL ? data.options[d].c[s.strikePrice] : data.options[d].p[s.strikePrice];
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

            (o as any)[s.strikePrice] = price && (() => {
                switch (valueMode) {
                    case 'TOTAL_RETURN':
                        if (putCallTabValue == PutCallType.PUT) {
                            return (targetPrice > s.value ? price : (price - (s.value - targetPrice))) / (s.value);
                        } else {
                            return (price / targetPrice);
                        }
                    case 'ANNUAL_RETURN':
                        if (putCallTabValue == PutCallType.PUT) {
                            const sellCost = (targetPrice > s.value ? price : (price - (s.value - targetPrice)));
                            const risk = s.value;
                            return (sellCost / risk) * (365 / numberofdays);
                        } else {
                            const sellCost = (targetPrice < s.value ? price : (price - (targetPrice - s.value)));
                            return (sellCost / targetPrice) * (365 / numberofdays);
                        }
                    case 'PCR':
                        return po.oi;
                    default:
                        return price?.toFixed(2);
                }
            })();
        });
        return o;
    }).filter(r => r);

    return <Paper>

        Symbol: <IconButton onClick={() => { setOpenSearchTickerDialog(true) }} sx={{ p: 0 }} size='small' disableFocusRipple disableRipple>
            <EditIcon /> {decodeURIComponent(props.symbol)}
        </IconButton>  - {data.currentPrice}
        <Button onClick={() => setDeltaHedgingOpen(true)}>Analyze Delta/Gamma hedging exposure</Button>
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
                <MenuItem value="PCR">PCR</MenuItem>
            </Select>
        </FormControl>
        <FormControl sx={{ m: 1 }} variant="standard">
            <TextField label="Target price" variant="standard" value={targetPrice} onChange={v => setTargetPrice(Number(v.target.value))} type='number' />
        </FormControl>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={putCallTabValue} onChange={(e, v) => handleCallTabValue(v)} variant="fullWidth" indicatorColor="secondary"
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
        {
            pcrSelectedData && <PutCallRatio
                open={pcrOpen}
                data={pcrSelectedData}
                currentPrice={data.currentPrice}
                onClose={() => setPcrOpen(false)} />
        }

        {
            deltaHedgingOpen && <DeltaGammaHedging
                symbol={props.symbol}
                onClose={() => setDeltaHedgingOpen(false)} />
        }

        <Dialog
            open={openSearchTickerDialog}
            fullWidth={true}
            onClose={() => setOpenSearchTickerDialog(false)}
        >
            <DialogTitle id="search-ticker-dialog-title">Search</DialogTitle>
            <DialogContent dividers={true}>
                <TickerSearch  onChange={(v) => router.push(`/options/analyze/${v.symbol}`)} />
            </DialogContent>
        </Dialog>

    </Paper>
}
