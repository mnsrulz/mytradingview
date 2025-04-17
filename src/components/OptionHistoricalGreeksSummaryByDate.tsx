'use client';

import * as React from 'react';
import { Stack, Box, IconButton, Drawer, useMediaQuery, useTheme } from '@mui/material';
import { DataGrid, GridColDef, GridColumnGroupingModel, GridDensity, GridToolbar } from '@mui/x-data-grid';
import { getHistoricalGreeksSummaryByDate } from '@/lib/mzDataService';
import { useQueryState, parseAsStringLiteral, parseAsNumberLiteral } from 'nuqs';
import { useEffect, useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem, Paper } from '@mui/material';
import { OptionGreeksSummaryByDateResponse } from '@/lib/types';
import FilterListIcon from '@mui/icons-material/FilterList';
import { OptionsGreekReportBySymbolDialog } from './OptionsGreekReportBySymbol';
import { currencyCompactFormatter, currencyFormatter, numberCompactFormatter } from '@/lib/formatters';

const dteOptions = [7,
    30,
    50,
    90,
    180,
    400,
    1000];
const volumeOptions = [
    { value: 100, display: '100' },
    { value: 500, display: '500' },
    { value: 1000, display: '1K' },
    { value: 10000, display: '10K' },
    { value: 50000, display: '50K' },
    { value: 100000, display: '100K' }
];

const oiOptions = [
    { value: 100, display: '100' },
    { value: 500, display: '500' },
    { value: 1000, display: '1K' },
    { value: 10000, display: '10K' },
    { value: 50000, display: '50K' },
    { value: 100000, display: '100K' }
];



export const OptionHistoricalGreeksSummaryByDate = (props: { cachedDates: string[] }) => {
    const { cachedDates } = props;
    const [date, setDate] = useQueryState('dt', parseAsStringLiteral(cachedDates).withDefault(cachedDates.at(0) || ''));
    const [rows, setRows] = useState<OptionGreeksSummaryByDateResponse[]>([]);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [minVolume, setMinVolume] = useState(1000);
    const [minOpenInterest, setMinOpenInterest] = useState(10000);
    const [dte, setDte] = useQueryState('dte', parseAsNumberLiteral(dteOptions).withDefault(50));
    const [gridDensity, setGridDensity] = useState<GridDensity>('compact');
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const filteredData = rows.filter(k => {
        if (minVolume && (k.call_volume + k.put_volume < minVolume)) return false;
        if (minOpenInterest && (k.call_oi + k.put_oi < minOpenInterest)) return false;
        return true;
    })
    const [open, setOpen] = useState(false);

    const toggleDrawer = (newOpen: boolean) => () => {
        setOpen(newOpen);
    };


    const [selectedSymbol, setSelectedSymbol] = useState('');
    const [openSymbolSummaryDialog, setOpenSymbolSummaryDialog] = useState(false);
    const handleCloseAddTrade = () => { setOpenSymbolSummaryDialog(false); };
    const handleSymbolClick = (v: string) => {
        setSelectedSymbol(v)
        setOpenSymbolSummaryDialog(true);
    }
    const columns: GridColDef<OptionGreeksSummaryByDateResponse>[] = [
        {
            field: 'symbol', headerName: 'Symbol', renderCell: (v) => <a href='#' onClick={() => handleSymbolClick(v.value)}>{v.value}</a>
        },
        {
            field: 'price', headerName: 'Price', type: 'number', valueFormatter: (v)=> currencyFormatter(v)
        },
        {
            field: 'call_delta', headerName: 'Calls', type: 'number', valueFormatter: (v)=> currencyCompactFormatter(v)
        },
        {
            field: 'put_delta', headerName: 'Puts', type: 'number', valueFormatter: (v)=> currencyCompactFormatter(v)
        },
        {
            field: 'call_put_dex_ratio', headerName: 'Calls/Puts', type: 'number', width: 120
        },
        {
            field: 'call_gamma', headerName: 'Calls', type: 'number', valueFormatter: (v)=> currencyCompactFormatter(v)
        },
        {
            field: 'put_gamma', headerName: 'Puts', type: 'number', valueFormatter: (v)=> currencyCompactFormatter(v)
        },
        {
            field: 'net_gamma', headerName: 'NET', type: 'number', valueFormatter: (v)=> currencyCompactFormatter(v)
        },
        {
            field: 'call_volume', headerName: 'Calls', type: 'number', valueFormatter: (v)=> numberCompactFormatter(v)
        },
        {
            field: 'put_volume', headerName: 'Puts', type: 'number', valueFormatter: (v)=> numberCompactFormatter(v)
        },
        {
            field: 'call_put_volume_ratio', headerName: 'Calls/Puts', type: 'number', width: 120
        },
        {
            field: 'call_oi', headerName: 'Calls', type: 'number', valueFormatter: (v)=> numberCompactFormatter(v)
        },
        {
            field: 'put_oi', headerName: 'Puts', type: 'number', valueFormatter: (v)=> numberCompactFormatter(v)
        },
        {
            field: 'call_put_oi_ratio', headerName: 'Calls/Puts', type: 'number', width: 120
        }
    ];
    useEffect(() => {
        setHasLoaded(false)
        getHistoricalGreeksSummaryByDate(date, dte).then(d => {
            // debugger;
            setRows(d);
            setHasLoaded(true)
        })
    }, [date, dte])

    const dteFilter = <FormControl sx={{ m: 1, minWidth: 60 }} size="small">
        <InputLabel>DTE</InputLabel>
        <Select id="dte" value={dte} label="DTE" onChange={(e) => setDte(e.target.value as number)}>
            {dteOptions.map((dte) => <MenuItem key={dte} value={dte}>{dte}</MenuItem>)}
        </Select>
    </FormControl>

    const volumeFilter = <FormControl sx={{ m: 1 }} size="small">
        <InputLabel>Volume</InputLabel>
        <Select value={minVolume} label="Volume" onChange={(e) => setMinVolume(e.target.value as number)}>
            {volumeOptions.map(c => {
                return <MenuItem key={c.value} value={c.value}>{`${c.display}+`}</MenuItem>
            })}
        </Select>
    </FormControl>
    const oiFilter = <FormControl sx={{ m: 1 }} size="small">
        <InputLabel>OI</InputLabel>
        <Select value={minOpenInterest} label="OI" onChange={(e) => setMinOpenInterest(e.target.value as number)}>
            {oiOptions.map(c => {
                return <MenuItem key={c.value} value={c.value}>{`${c.display}+`}</MenuItem>
            })}
        </Select>
    </FormControl>
    const additionalFilter = <>
        {dteFilter}
        {volumeFilter}
        {oiFilter}
    </>
    const dataGridTopFilter = <Paper sx={{ my: 2 }}>
        <Stack direction="row" spacing={2} padding={1}>
            {
                isMobile && <><IconButton onClick={toggleDrawer(true)}>
                    <FilterListIcon />
                </IconButton>
                    <Drawer anchor="left" open={open} onClose={toggleDrawer(false)}>
                        <Box sx={{ width: 250, padding: 2 }}>
                            {additionalFilter}
                        </Box>
                    </Drawer>
                </>
            }
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
            {!isMobile && additionalFilter}
        </Stack>
    </Paper>
    const columnGroupingModel: GridColumnGroupingModel = [
        {
            groupId: 'Delta Exposure',
            description: '',
            children: [
                { field: 'call_delta' },
                { field: 'put_delta' },
                { field: 'call_put_dex_ratio' }
            ],
        },
        {
            groupId: 'Gamma Exposure',
            children: [
                { field: 'call_gamma' },
                { field: 'put_gamma' },
                { field: 'net_gamma' },
            ],
        },
        {
            groupId: 'Volume',
            children: [
                { field: 'call_volume' },
                { field: 'put_volume' },
                { field: 'call_put_volume_ratio' },
            ],
        },
        {
            groupId: 'Open Interest',
            children: [
                { field: 'call_oi' },
                { field: 'put_oi' },
                { field: 'call_put_oi_ratio' },
            ],
        },
    ];
    return <Box sx={{ mb: 1 }}>
        {dataGridTopFilter}
        <DataGrid
            rows={filteredData}
            columns={columns}
            columnGroupingModel={columnGroupingModel}
            initialState={{
                pagination: {
                    paginationModel: {
                        pageSize: 20,
                    },
                },
            }}
            loading={!hasLoaded}
            getRowId={(r: OptionGreeksSummaryByDateResponse) => r.symbol}
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

        {openSymbolSummaryDialog && selectedSymbol && <OptionsGreekReportBySymbolDialog onClose={handleCloseAddTrade}
            symbol={selectedSymbol}
            open={openSymbolSummaryDialog} />}
    </Box>
}
