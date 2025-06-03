'use client';

import * as React from 'react';
import { ListItemText, Container } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { getOIAnomalyReport } from '@/lib/mzDataService';
import { useEffect, useState } from 'react';
import { OIAnomalyReportDataResponse } from '@/lib/types';
import { GridTopFilter } from './GridTopFilter';
import { numberCompactFormatter, numberFormatter, positiveNegativeNonDecimalFormatter, positiveNegativeNumberFormatter } from '@/lib/formatters';
import { red, green } from '@mui/material/colors';
import CopyToClipboardButton from '../CopyToClipboard';
// import { OptionsGreekReportBySymbolDialog } from './OptionsGreekReportBySymbol';
// import { columnGroupingModel, dteOptions } from './constants';

const [primaryTextSize, secondaryTextSize] = ['1em', '0.85em'];

export const OIAnomalyReport = (props: { cachedDates: string[], symbols: string[] }) => {
    const { cachedDates, symbols } = props;
    // const [date, setDate] = useQueryState('dt', parseAsStringLiteral(cachedDates).withDefault(cachedDates.at(0) || ''));
    const [rows, setRows] = useState<OIAnomalyReportDataResponse[]>([]);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
    const [selectedDt, setSelectedDt] = useState<string[]>([cachedDates.at(0) || '']);
    const [dteFrom, setDteFrom] = useState<number | undefined>(30);
    const [dteTo, setDteTo] = useState<number | undefined>();


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
                    primary={<>
                        {primarText}<CopyToClipboardButton text={p.row.option}></CopyToClipboardButton>
                    </>}
                    secondary={<>{p.row.expiration}
                        {p.row.delta ? ` | Δ: ${positiveNegativeNonDecimalFormatter(p.row.delta)}` : ''}
                        {p.row.gamma ? ` | \u03B3: ${positiveNegativeNonDecimalFormatter(p.row.gamma)}` : ''}
                    </>}
                />
            }
        },
        {
            field: 'prev_open_interest', align: 'right', headerName: 'Open Interest', minWidth: 200, type: 'number', renderCell: (p) => {
                const { oi_change, prev_open_interest, open_interest } = p.row;
                const changePercent = (oi_change / prev_open_interest) * 100;
                const secondaryColor = changePercent < 0 ? red[500] : green[500];
                const secondaryText = `${positiveNegativeNonDecimalFormatter(oi_change)} (${positiveNegativeNumberFormatter(changePercent)}%)`;
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
            dt: selectedDt.join(','),
            symbols: selectedSymbols.join(','),
            dteFrom: dteFrom,
            dteTo: dteTo
        }).then(d => {
            setRows(d);
            setHasLoaded(true)
        });
    }, [selectedDt, selectedSymbols, dteFrom, dteTo]);

    // const handleCloseAddTrade = () => { setOpenSymbolSummaryDialog(false); };
    // const handleSymbolClick = (v: string) => {
    //     setSelectedSymbol(v)
    //     setOpenSymbolSummaryDialog(true);
    // }

    return <Container sx={{ mb: 1 }} maxWidth='xl' disableGutters>
        <GridTopFilter {...props}
            selectedDates={selectedDt}
            setSelectedDates={setSelectedDt}
            selectedSymbols={selectedSymbols}
            setSelectedSymbols={setSelectedSymbols}
            dteFrom={dteFrom}
            setDteFrom={setDteFrom}
            dteTo={dteTo}
            setDteTo={setDteTo}
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
    </Container>
}
