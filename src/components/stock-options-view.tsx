import { Autocomplete, TextField, debounce } from '@mui/material';
import * as React from 'react';
import { SearchTickerItem, searchTicker, useOptionTracker } from '../lib/socket';
import { useEffect, useMemo, useState } from 'react';
import { GridColDef, DataGrid } from '@mui/x-data-grid';

interface ITickerProps {
    item: SearchTickerItem
}

const columns: GridColDef<SearchTickerItem>[] = [
    { field: 'symbol', headerName: 'Ticker', width: 150 },
    { field: 'name', headerName: 'Name', flex: 1 }
];


export const StockOptionsView = (props: ITickerProps) => {
    const oddata = useOptionTracker(props.item)
    const opt = oddata?.options;
    // const d1 = [];
    // if (opt) {
    //     for (const [key, value] of opt.entries()) {
    //         for(const [kk, vv] of value.c) {

    //         }
    //     }
    // }

    return <div>
        my options data {props.item.name} : {props.item.symbol}
        {JSON.stringify(oddata)}

        {/* <DataGrid rows={d1}
            columns={columns}
            sx={{ display: 'grid' }}
            getRowId={(r) => `${r.symbol} - ${r.name}`} /> */}
    </div>
}