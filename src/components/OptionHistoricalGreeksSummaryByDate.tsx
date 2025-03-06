'use client';

import * as React from 'react';
import { Stack, Box } from '@mui/material';
import { DataGrid, GridColDef, GridDensity, GridToolbar } from '@mui/x-data-grid';
import { getHistoricalGreeksSummaryByDate } from '@/lib/mzDataService';
import { useQueryState, parseAsStringLiteral, parseAsNumberLiteral } from 'nuqs';
import { useEffect, useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem, Paper } from '@mui/material';
import { OptionGreeksSummaryByDateResponse } from '@/lib/types';

const columns: GridColDef<OptionGreeksSummaryByDateResponse>[] = [
    {
        field: 'option_symbol', headerName: 'Symbol'
    },
    {
        field: 'call_delta', headerName: 'CALL Delta', type: 'number'
    },
    {
        field: 'put_delta', headerName: 'PUT Delta', type: 'number'
    },
    {
        field: 'call_put_dex_ratio', headerName: 'CALL/PUT DEX', type: 'number'
    },
    {
        field: 'call_gamma', headerName: 'CALL y', type: 'number'
    },
    {
        field: 'put_gamma', headerName: 'PUT y', type: 'number'
    },
    {
        field: 'net_gamma', headerName: 'NET y', type: 'number'
    },
    {
        field: 'call_volume', headerName: 'Call Volume', type: 'number'
    },
    {
        field: 'put_volume', headerName: 'Put Volume', type: 'number'
    },
    {
        field: 'call_put_volume_ratio', headerName: 'CALL/PUT Volume', type: 'number'
    },
    {
        field: 'call_oi', headerName: 'Call OI', type: 'number'
    },
    {
        field: 'put_oi', headerName: 'Put OI', type: 'number'
    },
    {
        field: 'call_put_oi_ratio', headerName: 'CALL/PUT OI', type: 'number'
    }
];
const dteOptions = [7,
    30,
    50,
    90,
    180,
    400,
    1000];

export const OptionHistoricalGreeksSummaryByDate = (props: { cachedDates: string[] }) => {
    const { cachedDates } = props;
    const [date, setDate] = useQueryState('dt', parseAsStringLiteral(cachedDates).withDefault(cachedDates.at(0) || ''));
    const [rows, setRows] = useState<OptionGreeksSummaryByDateResponse[]>([]);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [minVolume, setMinVolume] = useState(1000);
    const [minOpenInterest, setMinOpenInterest] = useState(10000);
    const [dte, setDte] = useQueryState('dte', parseAsNumberLiteral(dteOptions).withDefault(50));
    const [gridDensity, setGridDensity] = useState<GridDensity>('compact');    
    const filteredData = rows.filter(k => {
        if (minVolume && (k.call_volume + k.put_volume < minVolume)) return false;
        if (minOpenInterest && (k.call_oi + k.put_oi < minOpenInterest)) return false;
        return true;
    })
    useEffect(() => {
        setHasLoaded(false)
        getHistoricalGreeksSummaryByDate(date, dte).then(d => {
            // debugger;
            setRows(d);
            setHasLoaded(true)
        })
    }, [date, dte])

    return <Box>
        <Paper sx={{ my: 2 }}>
            <Stack direction="row" spacing={2} padding={1}>
                <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                    <InputLabel>Data Mode</InputLabel>
                    <Select value={date} label="Data Mode" onChange={(e) => setDate(e.target.value)}>
                        {
                            cachedDates.map(c => {
                                return <MenuItem key={c} value={c}>{c}</MenuItem>
                            })
                        }
                    </Select>
                </FormControl>
                <FormControl sx={{ m: 1, justifyItems: 'right' }} size="small">
                    <InputLabel>DTE</InputLabel>
                    <Select id="dte" value={dte} label="DTE" onChange={(e) => setDte(e.target.value as number)}>
                        {dteOptions.map((dte) => <MenuItem key={dte} value={dte}>{dte}</MenuItem>)}                        
                    </Select>
                </FormControl>
                <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                    <InputLabel>Volume</InputLabel>
                    <Select value={minVolume} label="Volume" onChange={(e) => setMinVolume(e.target.value as number)}>
                        {
                            [100, 500, 1000, 10000, 50000, 100000].map(c => {
                                return <MenuItem key={c} value={c}>{`>=${c}`}</MenuItem>
                            })
                        }
                    </Select>
                </FormControl>
                <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                    <InputLabel>OI</InputLabel>
                    <Select value={minOpenInterest} label="OI" onChange={(e) => setMinOpenInterest(e.target.value as number)}>
                        {
                            [100, 500, 1000, 10000, 50000, 100000].map(c => {
                                return <MenuItem key={c} value={c}>{`>=${c}`}</MenuItem>
                            })
                        }
                    </Select>
                </FormControl>
            </Stack>
        </Paper>
        <DataGrid
            rows={filteredData}
            columns={columns}
            initialState={{
                pagination: {
                    paginationModel: {
                        pageSize: 20,
                    },
                },
            }}
            loading={!hasLoaded}
            getRowId={(r: OptionGreeksSummaryByDateResponse) => r.option_symbol}
            // pageSizeOptions={[5]}
            checkboxSelection={false}
            disableColumnFilter
            disableRowSelectionOnClick
            onDensityChange={setGridDensity}
            disableColumnMenu={true}
            density={gridDensity}
            sx={{
                '.MuiDataGrid-columnSeparator': {
                    display: 'none'
                },
                fontFamily: 'sans-serif'
            }}
            slots={{ toolbar: GridToolbar }}
            slotProps={{
                toolbar: {
                    showQuickFilter: true,
                },
            }}
        />

    </Box>
}
