
import * as React from 'react';
import { useOptionTracker } from '../lib/socket';
import { GridColDef, DataGrid, gridClasses } from '@mui/x-data-grid';
import { Slider, Stack } from '@mui/material';
import { useState } from 'react';

interface ITickerProps {
    symbol: string
}

type NumberRange = { start: number, end: number }
type IStrikePriceSliderPorps = { allStrikePricesValues: number[], onChange: (v: NumberRange) => void }

const StrikePriceSlider = (props: IStrikePriceSliderPorps) => {
    const { allStrikePricesValues, onChange } = props;
    const [minStrikePrice, maxStrikePrice] = [Math.min.apply(null, allStrikePricesValues), Math.max.apply(null, allStrikePricesValues)];
    const strikePriceMarks = allStrikePricesValues.map(m => ({ value: m }));
    const [strikePriceRange, setStrikePriceRange] = useState([minStrikePrice, maxStrikePrice]);
    const handleChange = (e: Event, v: number | number[]) => {
        const value = v as number[];
        setStrikePriceRange(value);
        onChange({
            start: value[0],
            end: value[1]
        });
    };

    return <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
        <span>Strike Price Range:</span>
        <Slider
            getAriaLabel={() => 'Temperature range'}
            value={strikePriceRange}
            onChange={handleChange}
            valueLabelDisplay="on"
            min={minStrikePrice}
            max={maxStrikePrice}
            marks={strikePriceMarks}
            step={null}
        //getAriaValueText={valuetext}
        />
    </Stack>
}

const numberFormatter = (v: string) => v && Number(v);
export const StockOptionsView = (props: ITickerProps) => {
    const { data, isLoading } = useOptionTracker(props.symbol);
    const [sps, setsps] = useState<NumberRange>({ start: 0, end: Number.MAX_VALUE });
    if (isLoading) return <div>loading...</div>;
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
    })).filter(n => n.value >= sps.start && n.value <= sps.end);

    workingStrikePrices.sort(function (a, b) { return a.value - b.value; }).forEach(s => {
        columns.push({
            field: s.strikePrice, width: 10, headerName: `${parseFloat(s.strikePrice)}`, valueFormatter: numberFormatter, type: 'number'
        })
    })

    const traderows = allDates?.map(d => {
        const o: any = {
            id: d
        }
        workingStrikePrices.forEach(s => {
            o[s.strikePrice] = data.options[d].c[s.strikePrice]?.l;
        });
        return o;
    });

    return <div>
        Symbol: {props.symbol}
        <StrikePriceSlider allStrikePricesValues={allStrikePricesValues} onChange={setsps} />
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
        {/* <DataGrid rows={d1}
            columns={columns}
            sx={{ display: 'grid' }}
            getRowId={(r) => `${r.symbol} - ${r.name}`} /> */}
    </div>
}