'use client';
import React from 'react';
import {
    useHits,
    UseHitsProps,
    useInstantSearch,
    usePagination,
} from 'react-instantsearch';

import { ListItemText } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { OIAnomalyReportDataResponse } from '@/lib/types';
import { numberCompactFormatter, numberFormatter, positiveNegativeNonDecimalFormatter, positiveNegativeNumberFormatter } from '@/lib/formatters';
import { red, green } from '@mui/material/colors';
import CopyToClipboardButton from '../CopyToClipboard';
// import { OptionsGreekReportBySymbolDialog } from './OptionsGreekReportBySymbol';
// import { columnGroupingModel, dteOptions } from './constants';

const [primaryTextSize, secondaryTextSize] = ['1em', '0.85em'];


export const CustomHits = (props: UseHitsProps<OIAnomalyReportDataResponse>) => {
    const { items, sendEvent, results } = useHits<OIAnomalyReportDataResponse>(props);
    const { status } = useInstantSearch();
    const {
        pages,
        currentRefinement,
        nbHits,
        nbPages,
        isFirstPage,
        isLastPage,
        canRefine,
        refine,
        createURL,
    } = usePagination();
    const pageSize = results?.hitsPerPage;
    const page = currentRefinement;

    const columns: GridColDef<OIAnomalyReportDataResponse>[] = [
        {
            field: 'dt', headerName: 'Date'
        },
        {
            field: 'option', headerName: 'Option', width: 200, renderCell: (p) => {
                const primarText = `${p.row.option_symbol} $${p.row.strike} ${p.row.option_type} `;
                const os = p.row.option;
                const strike = parseFloat(p.row.strike);
                const fCopyText = `-${os.substring(0, os.lastIndexOf(p.row.option_type))}${p.row.option_type}${strike}`;

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
                        {primarText}<CopyToClipboardButton text={fCopyText}></CopyToClipboardButton>                        
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
            field: 'dte', headerName: 'DTE', type: 'number'
        },
        {
            field: 'volume', headerName: 'Volume', type: 'number'
        },
        {
            field: 'anomaly_score', headerName: 'Score', type: 'number', valueFormatter: (v) => numberCompactFormatter(v)
        }
    ];

    return <div style={{ display: 'flex', flexDirection: 'column' }}><DataGrid
        rows={items}
        columns={columns}
        // columnGroupingModel={columnGroupingModel}
        initialState={{
            pagination: {
                paginationModel: {
                    pageSize: pageSize,
                    page: page
                },
                rowCount: nbHits
            }
        }}
        paginationModel={{
            page: page || 0,
            pageSize: pageSize || 12
        }}
        rowCount={nbHits}
        onPaginationModelChange={(m) => {
            refine(m.page);
        }}
        paginationMode='server'
        loading={status === 'loading'}
        getRowId={(r) => `${r.option}-${r.dt}`}
        pageSizeOptions={[12]}
        checkboxSelection={false}
        disableColumnFilter
        disableRowSelectionOnClick
        disableColumnMenu={true}
        disableColumnSorting={true}
        density='compact'
        rowHeight={72}
        sx={{
            '.MuiDataGrid-columnSeparator': {
                display: 'none'
            }
        }} />
    </div>
}