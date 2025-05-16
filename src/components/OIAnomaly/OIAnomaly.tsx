'use client';

import * as React from 'react';
import { Box, ListItemText } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { getOIAnomalyReport } from '@/lib/mzDataService';
import { useQueryState, parseAsStringLiteral, parseAsNumberLiteral } from 'nuqs';
import { useEffect, useState } from 'react';
import { OIAnomalyReportDataResponse } from '@/lib/types';
import { GridTopFilter } from './GridTopFilter';
import { dteOptions } from '../GreeksReport/constants';
import { numberCompactFormatter, numberFormatter, positiveNegativeNumberFormatter } from '@/lib/formatters';
import { red, green } from '@mui/material/colors';
// import { OptionsGreekReportBySymbolDialog } from './OptionsGreekReportBySymbol';
// import { columnGroupingModel, dteOptions } from './constants';

const [primaryTextSize, secondaryTextSize] = ['1em', '0.85em'];

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
            field: 'option', headerName: 'Option', width: 200, renderCell: (p) => {
                const primarText = `${p.row.option_symbol} $${p.row.strike} ${p.row.option_type} `;
                return <ListItemText
                    slotProps={{
                        primary: {
                            fontSize: primaryTextSize
                        },
                        secondary: {
                            fontSize: secondaryTextSize,
                        }
                    }}
                    primary={primarText}
                    secondary={p.row.expiration}
                />
            }
        },        
        {
            field: 'prev_open_interest', align: 'right', flex: 0.5, headerName: 'Open Interest', type: 'number', renderCell: (p) => {
                const { oi_change, prev_open_interest, open_interest } = p.row;
                const changePercent = (oi_change / prev_open_interest) * 100;
                const secondaryColor = changePercent < 0 ? red[500] : green[500];
                const secondaryText = `${positiveNegativeNumberFormatter(oi_change)} (${positiveNegativeNumberFormatter(changePercent)})%`
                return <ListItemText
                    slotProps={{
                        primary: {
                            fontSize: primaryTextSize
                        },
                        secondary: {
                            fontSize: secondaryTextSize,
                            color: secondaryColor
                        }
                    }}
                    primary={numberFormatter(open_interest)}
                    secondary={secondaryText}
                />
            }
        },        
        {
            field: 'volume', headerName: 'Volume', type: 'number'
        },
        {
            field: 'anomaly_score', headerName: 'Score', type: 'number', valueFormatter: (v) => numberCompactFormatter(v)
        }
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
        rowHeight={72}
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
