'use client';

import * as React from 'react';
import { Box, Link } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { getHistoricalExposureWallsByDate } from '@/lib/mzDataService';
import { useQueryState, parseAsStringLiteral, parseAsNumberLiteral } from 'nuqs';
import { useEffect, useState } from 'react';
import { OptionGreeksExposureWallsByDateResponse } from '@/lib/types';
import { currencyFormatter } from '@/lib/formatters';
import { GridTopFilter } from './GridTopFilter';
import { dteOptions } from './constants';
import { OptionsGreekWallReportBySymbol } from './OptionsGreekWallReportBySymbol';

export const GreeksWallReport = (props: { cachedDates: string[] }) => {
    const { cachedDates } = props;
    const [date, setDate] = useQueryState('dt', parseAsStringLiteral(cachedDates).withDefault(cachedDates.at(0) || ''));
    const [rows, setRows] = useState<OptionGreeksExposureWallsByDateResponse[]>([]);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [dte, setDte] = useQueryState('dte', parseAsNumberLiteral(dteOptions).withDefault(50));

    const [selectedSymbol, setSelectedSymbol] = useState('');
    const [openSymbolSummaryDialog, setOpenSymbolSummaryDialog] = useState(false);
    const columns: GridColDef<OptionGreeksExposureWallsByDateResponse>[] = [
        {
            field: 'symbol', headerName: 'Symbol', renderCell: (v) => <Link href="#" onClick={() => handleSymbolClick(v.value)}>{v.value}</Link>
        },
        {
            field: 'price', headerName: 'Price', type: 'number', valueFormatter: (v) => currencyFormatter(v)
        },
        {
            field: 'call_wall_strike', headerName: 'Call Wall', type: 'number'
        },
        {
            field: 'put_wall_strike', headerName: 'Put Wall', type: 'number'
        }
    ];

    useEffect(() => {
        setHasLoaded(false);
        setRows([]);
        getHistoricalExposureWallsByDate(date, dte).then(d => {
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
            date={date}
            setDate={setDate}
        />

        <DataGrid
            rows={rows}
            columns={columns}
            initialState={{
                pagination: {
                    paginationModel: {
                        pageSize: 20,
                    },
                }
            }}
            loading={!hasLoaded}
            getRowId={(r: OptionGreeksExposureWallsByDateResponse) => r.symbol}
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
            showToolbar            
            slotProps={{
                toolbar: {
                    showQuickFilter: true,
                },
            }}
        />

        {openSymbolSummaryDialog && selectedSymbol && <OptionsGreekWallReportBySymbol onClose={handleCloseAddTrade}
            symbol={selectedSymbol}
            dte={dte}
            open={openSymbolSummaryDialog} />}
    </Box>
}
