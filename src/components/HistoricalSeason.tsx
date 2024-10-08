'use client'

import { HistoricalDataResponse } from "@/lib/types"
import { GridColDef, DataGrid, gridClasses } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { ConditionalFormattingBox } from "./ConditionalFormattingBox";
import { percentageFormatter } from "@/lib/formatters";
import { Box, Typography } from "@mui/material";

const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

export const HistoricalSeason = (props: { data: HistoricalDataResponse, symbol: string }) => {
    // const currentYear = dayjs().year();
    // use to render the graph/chart
    // const dkk = dt.history.day.reduce((acc: Record<string, number[]>, current) => {
    //     const year = dayjs(current.date).format('YYYY');
    //     if (!acc[year]) {
    //         const currentMonth = dayjs().month();
    //         if (year === `${currentYear}`) {
    //             acc[year] = new Array(currentMonth + 1).fill(0);
    //         } else {
    //             acc[year] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    //         }
    //     };
    //     const pm = ((current.close - current.open) / current.open) * 100;
    //     const month = dayjs(current.date).month();
    //     acc[year][month] = pm;
    //     return acc;
    // }, {});

    /*
{month: 'Jan', d2022: 1, d2023: 1.6...},
{}
const seriesData = Object.keys(dkk).map(year => ({
    label: year,
    data: dkk[year]
}));
    */
    const dt = props.data;
    const years: string[] = []
    const rowsData = dt.history.day.reduce((acc: { id: string }[], current) => {
        const year = dayjs(current.date).format('YYYY');
        const pm = ((current.close - current.open) / current.open);
        const month = dayjs(current.date).month();
        (acc.find(j => j.id === months[month]) as any)[`d${year}`] = pm.toFixed(2);
        if (!years.includes(year)) years.push(year);
        return acc
    }, months.map(j => ({ id: j })));

    const columns: GridColDef[] = [
        { field: 'id', width: 120, headerName: 'Month' },
        ...years.map(j => {
            return {
                field: `d${j}`, width: 10, headerName: j, align: 'right',
                valueFormatter: percentageFormatter,
                type: 'number',
                renderCell: (p) => <ConditionalFormattingBox value={p.value * 1000} formattedValue={p.formattedValue} />
            } as GridColDef
        })
    ]

    return <Box sx={{ mt: 1 }}>
        <Typography variant="h6">Ticker: {props.symbol}</Typography>
        <DataGrid rows={rowsData}
            disableColumnMenu={true}
            disableColumnFilter={true}
            disableColumnSorting={true}
            columns={columns}
            density="compact"
            disableRowSelectionOnClick
            columnHeaderHeight={32}
            rowHeight={32}
            hideFooter={true}
            showColumnVerticalBorder={true}
            showCellVerticalBorder={true}
            sx={{
                [`& .${gridClasses.cell}:focus, & .${gridClasses.cell}:focus-within`]: {
                    outline: 'none',
                },
                [`& .${gridClasses.columnHeader}:focus, & .${gridClasses.columnHeader}:focus-within`]:
                {
                    outline: 'none',
                },
                [`& .${gridClasses.columnHeader}`]:
                {
                    fontSize: '0.7rem',
                    fontWeight: 500
                },
                [`& .${gridClasses.cell}`]:
                {
                    fontSize: '0.7rem',
                    padding: 0
                },
            }}
        />
    </Box>
}