'use client';

import * as React from 'react';
import { Box, Link } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { getHistoricalGreeksSummaryByDate } from '@/lib/mzDataService';
import { useQueryState, parseAsStringLiteral, parseAsNumberLiteral } from 'nuqs';
import { useEffect, useMemo, useState } from 'react';
import { OptionGreeksSummaryByDateResponse } from '@/lib/types';
import { OptionsGreekReportBySymbolDialog } from './OptionsGreekReportBySymbol';
import { currencyCompactFormatter, currencyFormatter, numberCompactFormatter } from '@/lib/formatters';
import { columnGroupingModel, dteOptions } from './constants';
import { GridTopFilter } from './GridTopFilter';

export const GreeksReport = (props: { cachedDates: string[] }) => {
    const { cachedDates } = props;
    const [date, setDate] = useQueryState('dt', parseAsStringLiteral(cachedDates).withDefault(cachedDates.at(0) || ''));
    const [rows, setRows] = useState<OptionGreeksSummaryByDateResponse[]>([]);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [minVolume, setMinVolume] = useState(1000);
    const [minOpenInterest, setMinOpenInterest] = useState(10000);
    const [dte, setDte] = useQueryState('dte', parseAsNumberLiteral(dteOptions).withDefault(50));

    const [selectedSymbol, setSelectedSymbol] = useState('');
    const [openSymbolSummaryDialog, setOpenSymbolSummaryDialog] = useState(false);
    const columns: GridColDef<OptionGreeksSummaryByDateResponse>[] = [
        {
            field: 'symbol', headerName: 'Symbol', renderCell: (v) => <Link href="#" onClick={() => handleSymbolClick(v.value)}>{v.value}</Link>
        },
        {
            field: 'price', headerName: 'Price', type: 'number', valueFormatter: (v) => currencyFormatter(v)
        },
        {
            field: 'call_delta', headerName: 'Calls', type: 'number', valueFormatter: (v) => currencyCompactFormatter(v)
        },
        {
            field: 'put_delta', headerName: 'Puts', type: 'number', valueFormatter: (v) => currencyCompactFormatter(v)
        },
        {
            field: 'call_put_dex_ratio', headerName: 'Calls/Puts', type: 'number', width: 120
        },
        {
            field: 'call_gamma', headerName: 'Calls', type: 'number', valueFormatter: (v) => currencyCompactFormatter(v)
        },
        {
            field: 'put_gamma', headerName: 'Puts', type: 'number', valueFormatter: (v) => currencyCompactFormatter(v)
        },
        {
            field: 'net_gamma', headerName: 'NET', type: 'number', valueFormatter: (v) => currencyCompactFormatter(v)
        },
        {
            field: 'call_volume', headerName: 'Calls', type: 'number', valueFormatter: (v) => numberCompactFormatter(v)
        },
        {
            field: 'put_volume', headerName: 'Puts', type: 'number', valueFormatter: (v) => numberCompactFormatter(v)
        },
        {
            field: 'call_put_volume_ratio', headerName: 'Calls/Puts', type: 'number', width: 120
        },
        {
            field: 'call_oi', headerName: 'Calls', type: 'number', valueFormatter: (v) => numberCompactFormatter(v)
        },
        {
            field: 'put_oi', headerName: 'Puts', type: 'number', valueFormatter: (v) => numberCompactFormatter(v)
        },
        {
            field: 'call_put_oi_ratio', headerName: 'Calls/Puts', type: 'number', width: 120
        }
    ];

    const filteredData = useMemo(() => rows.filter(k => {
        if (minVolume && (k.call_volume + k.put_volume < minVolume)) return false;
        if (minOpenInterest && (k.call_oi + k.put_oi < minOpenInterest)) return false;
        return true;
    }), [rows, minVolume, minOpenInterest]);

    useEffect(() => {
        setHasLoaded(false);
        setRows([]);
        getHistoricalGreeksSummaryByDate(date, dte).then(d => {
            setRows(d);
            setHasLoaded(true)
        });
    }, [date, dte])

    const handleCloseAddTrade = () => { setOpenSymbolSummaryDialog(false); };
    const handleSymbolClick = (v: string) => {
        setSelectedSymbol(v)
        setOpenSymbolSummaryDialog(true);
    }

    return <Box sx={{ mb: 1 }}>
        <GridTopFilter {...props}
            dte={dte}
            setDte={setDte}
            minOpenInterest={minOpenInterest}
            setMinOpenInterest={setMinOpenInterest}
            minVolume={minVolume}
            setMinVolume={setMinVolume}
            date={date}
            setDate={setDate}
        />

        <DataGrid
            rows={filteredData}
            columns={columns}
            columnGroupingModel={columnGroupingModel}
            initialState={{
                pagination: {
                    paginationModel: {
                        pageSize: 20,
                    },
                }
            }}
            loading={!hasLoaded}
            getRowId={(r: OptionGreeksSummaryByDateResponse) => r.symbol}
            // pageSizeOptions={[5]}
            checkboxSelection={false}
            disableColumnFilter
            disableRowSelectionOnClick
            disableColumnMenu={true}
            density='compact'
            sx={{
                '.MuiDataGrid-columnSeparator': {
                    display: 'none'
                }
            }}
            // slots={{ toolbar: GridToolbar }}
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
