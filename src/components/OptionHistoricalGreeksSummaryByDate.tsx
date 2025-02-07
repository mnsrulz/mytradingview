'use client';

import * as React from 'react';
import { Stack, Box } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { getHistoricalGreeksSummaryByDate } from '@/lib/mzDataService';
import { useQueryState, parseAsStringLiteral } from 'nuqs';
import { useEffect, useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem, Paper } from '@mui/material';
import { OptionGreeksSummaryByDateResponse } from '@/lib/types';

const columns: GridColDef<OptionGreeksSummaryByDateResponse>[] = [
    {
        field: 'option_symbol', headerName: 'Symbol', flex: 1
    },
    {
        field: 'call_delta', headerName: 'CALL Delta', type: 'number', flex: 1
    },
    {
        field: 'put_delta', headerName: 'PUT Delta', type: 'number', flex: 1
    },
    {
        field: 'call_put_dex_ratio', headerName: 'CALL/PUT DEX', type: 'number', flex: 1
    },
    {
        field: 'call_gamma', headerName: 'CALL y', type: 'number', flex: 1
    },
    {
        field: 'put_gamma', headerName: 'PUT y', type: 'number', flex: 1
    },
    {
        field: 'net_gamma', headerName: 'NET y', type: 'number', flex: 1
    },
    {
        field: 'call_volume', headerName: 'Call Volume', type: 'number', flex: 1
    },
    {
        field: 'put_volume', headerName: 'Put Volume', type: 'number', flex: 1
    },
    {
        field: 'call_put_volume_ratio', headerName: 'CALL/PUT Volume', type: 'number', flex: 1
    },
    {
        field: 'call_oi', headerName: 'Call OI', type: 'number', flex: 1
    },
    {
        field: 'put_oi', headerName: 'Put OI', type: 'number', flex: 1
    },
    {
        field: 'call_put_oi_ratio', headerName: 'CALL/PUT OI', type: 'number', flex: 1
    }
];

export const OptionHistoricalGreeksSummaryByDate = (props: { cachedDates: string[] }) => {
    const { cachedDates } = props;
    const [date, setDate] = useQueryState('dt', parseAsStringLiteral(cachedDates).withDefault(cachedDates.at(0) || ''));
    const [rows, setRows] = useState<OptionGreeksSummaryByDateResponse[]>([]);
    const [hasLoaded, setHasLoaded] = useState<boolean>(false);
    const [minVolume, setMinVolume] = useState(1000);
    const [minOpenInterest, setMinOpenInterest] = useState(10000);
    const filteredData = rows.filter(k => {
        if (minVolume && (k.call_volume + k.put_volume < minVolume)) return false;
        if (minOpenInterest && (k.call_oi + k.put_oi < minOpenInterest)) return false;
        return true;
    })
    useEffect(() => {
        setHasLoaded(false)
        getHistoricalGreeksSummaryByDate(date).then(d => {
            debugger;
            setRows(d);
            setHasLoaded(true)
        })
    }, [date])

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
            density='compact'
            loading={!hasLoaded}
            getRowId={(r: OptionGreeksSummaryByDateResponse) => r.option_symbol}
            // pageSizeOptions={[5]}
            checkboxSelection={false}
            disableColumnFilter
            disableRowSelectionOnClick
            disableColumnMenu={true}
        />

    </Box>
}
