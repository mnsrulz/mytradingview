'use client';

import * as React from 'react';
import { Box } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { getOIAnomalyReport } from '@/lib/mzDataService';
import { useQueryState, parseAsStringLiteral, parseAsNumberLiteral } from 'nuqs';
import { useEffect, useState } from 'react';
import { OIAnomalyReportDataResponse } from '@/lib/types';
import { GridTopFilter } from './GridTopFilter';
import { dteOptions } from '../GreeksReport/constants';
import { numberCompactFormatter } from '@/lib/formatters';
// import { OptionsGreekReportBySymbolDialog } from './OptionsGreekReportBySymbol';
// import { columnGroupingModel, dteOptions } from './constants';


export const OIAnomalyReport = (props: { cachedDates: string[], symbols: string[] }) => {
    const { cachedDates, symbols } = props;
    const [date, setDate] = useQueryState('dt', parseAsStringLiteral(cachedDates).withDefault(cachedDates.at(0) || ''));
    const [rows, setRows] = useState<OIAnomalyReportDataResponse[]>([]);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [minVolume, setMinVolume] = useState(1000);
    const [minOpenInterest, setMinOpenInterest] = useState(10000);
    const [dte, setDte] = useQueryState('dte', parseAsNumberLiteral(dteOptions).withDefault(50));

    const [selectedSymbol, setSelectedSymbol] = useState('');
    const [openSymbolSummaryDialog, setOpenSymbolSummaryDialog] = useState(false);
    const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
    const [dteFrom, setDteFrom] = useState(30);

    const columns: GridColDef<OIAnomalyReportDataResponse>[] = [
        {
            field: 'dt', headerName: 'Date'
        },
        {
            field: 'option', headerName: 'Option', width: 200
        },
        {
            field: 'option_symbol', headerName: 'Symbol'
        },
        {
            field: 'expiration', headerName: 'DTE'
        },
        {
            field: 'option_type', headerName: 'Type'
        },
        {
            field: 'dte', headerName: 'DTE', type: 'number'
        },
        {
            field: 'prev_open_interest', headerName: 'Prev OI', type: 'number'
        },
        {
            field: 'open_interest', headerName: 'OI', type: 'number'
        },
        {
            field: 'oi_change', headerName: 'OI Change', type: 'number'
        },
        {
            field: 'volume', headerName: 'Volume', type: 'number'
        },
        {
            field: 'anomaly_score', headerName: 'Score', type: 'number', valueFormatter: (v) => numberCompactFormatter(v)
        },
    ];

    useEffect(() => {
        setHasLoaded(false);
        setRows([]);
        getOIAnomalyReport({
            dt: date,
            symbols: selectedSymbols.join(','),
            dteFrom: dteFrom > 0 ? dteFrom : undefined
        }).then(d => {
            setRows(d);
            setHasLoaded(true)
        });
    }, [date, selectedSymbols, dteFrom]);

    // const handleCloseAddTrade = () => { setOpenSymbolSummaryDialog(false); };
    // const handleSymbolClick = (v: string) => {
    //     setSelectedSymbol(v)
    //     setOpenSymbolSummaryDialog(true);
    // }

    return <Box sx={{ mb: 1 }}>
        <GridTopFilter {...props}
            date={date}
            setDate={setDate}
            selectedSymbols={selectedSymbols}
            setSelectedSymbols={setSelectedSymbols}
            dteFrom={dteFrom}
            setDteFrom={setDteFrom}
        />

        <DataGrid
            rows={rows}
            columns={columns}
            // columnGroupingModel={columnGroupingModel}
            initialState={{
                pagination: {
                    paginationModel: {
                        pageSize: 20,
                    },
                }
            }}
            loading={!hasLoaded}
            getRowId={(r: OIAnomalyReportDataResponse) => `${r.option}-${r.dt}`}
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
        // showToolbar            
        // slotProps={{
        //     toolbar: {
        //         showQuickFilter: true,
        //     },
        // }}
        />

        {/* {openSymbolSummaryDialog && selectedSymbol && <OptionsGreekReportBySymbolDialog onClose={handleCloseAddTrade}
            symbol={selectedSymbol}
            open={openSymbolSummaryDialog} />} */}
    </Box>
}
