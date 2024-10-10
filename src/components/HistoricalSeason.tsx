import { HistoricalDataResponse } from "@/lib/types"
import dayjs from "dayjs";
import { ConditionalFormattingBox } from "./ConditionalFormattingBox";
import { numberFormatter, percentageFormatter } from "@/lib/formatters";
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider } from "@mui/material";
import { TickerSearchDialog } from "./TickerSearchDialog";

type MyProps = {
    xLabels: string[],
    yLabels: string[],
    data: number[][],
    formatter: 'percent' | 'number'
}
const formatters = {'percent': percentageFormatter, number: numberFormatter}
const HeatComponent = (props: MyProps) => {
    const { xLabels, yLabels, data, formatter } = props;
    const fmt = formatters[formatter];
    return <TableContainer component={Paper} sx={{
        width: 'auto', // Set width of the TableContainer to auto
        maxWidth: '100%', // Optional: prevent it from exceeding the parent width
        display: 'inline-block', // Make sure the container doesn't stretch
        mt: 1
    }}>
        <Table size="small" sx={{
            tableLayout: 'auto', // Allow table to auto-adjust to content
            width: 'auto' // Ensure the table takes only the width it needs
        }} padding='none'>
            <TableHead>
                <TableRow >
                    <TableCell sx={{ px: 1 }}>Month</TableCell>
                    {
                        xLabels.map(c => <TableCell align="right" sx={{ px: 1 }} key={c}>{c}</TableCell>)
                    }
                </TableRow>
            </TableHead>
            <TableBody>
                {data.map((row, ix) => (
                    <TableRow
                        key={ix}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 }, padding: 0 }}
                    >
                        <TableCell component="th" scope="row" sx={{ width: 100, px: 1 }}>
                            {yLabels[ix]}
                        </TableCell>
                        {
                            row.map(c => <TableCell key={c} align="right" sx={{ padding: 0, width: 80, height: '32px' }} padding="none">
                                {/* {row[`d${c}`]} */}
                                <ConditionalFormattingBox value={c * 1000} formattedValue={`${fmt(c)}`} />
                            </TableCell>)
                        }
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>
}

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
    // const rowsData = dt.history.day.reduce((acc: { id: string }[], current) => {
    //     const year = dayjs(current.date).format('YYYY');
    //     const pm = ((current.close - current.open) / current.open);
    //     const month = dayjs(current.date).month();
    //     const row = (acc.find(j => j.id === months[month]) as any);
    //     row[`d${year}`] = pm.toFixed(2);
    //     row[`f${year}`] = percentageFormatter(pm);

    //     if (!years.includes(year)) years.push(year);
    //     return acc
    // }, months.map(j => ({ id: j })));

    const ys = [...new Set(dt.history.day.map(j => dayjs(j.date).format('YYYY')))].toSorted();
    const afsd = [...Array<number[]>(12)].map(_ => Array<number>(ys.length).fill(0));

    const rowsData = dt.history.day.reduce((acc: number[][], current) => {
        const year = dayjs(current.date).format('YYYY');
        const pm = ((current.close - current.open) / current.open);
        const month = dayjs(current.date).month();
        acc[month][ys.indexOf(year)] = pm;
        // const row = (acc.find(j => j.id === months[month]) as any);
        // row[`d${year}`] = pm.toFixed(2);
        // row[`f${year}`] = percentageFormatter(pm);

        // if (!years.includes(year)) years.push(year);
        // acc
        return acc;
    }, [...Array<number[]>(12)].map(_ => Array<number>(ys.length).fill(0)));

    // const columns: GridColDef[] = [
    //     { field: 'id', width: 120, headerName: 'Month' },
    //     ...years.map(j => {
    //         return {
    //             field: `d${j}`, width: 10, headerName: j, align: 'right',
    //             valueFormatter: percentageFormatter,
    //             type: 'number',
    //             renderCell: (p) => <ConditionalFormattingBox value={p.value * 1000} formattedValue={p.formattedValue} />
    //         } as GridColDef
    //     })
    // ]

    return <Box sx={{ mt: 1 }}>
        {/* <Typography variant="h6">Ticker: {props.symbol}</Typography> */}
        <TickerSearchDialog {...props} />
        <Divider />
        <HeatComponent xLabels={ys} yLabels={months} data={rowsData} formatter='percent' />
        {/* <TableContainer component={Paper} sx={{
            width: 'auto', // Set width of the TableContainer to auto
            maxWidth: '100%', // Optional: prevent it from exceeding the parent width
            display: 'inline-block', // Make sure the container doesn't stretch
            mt: 1
        }}>
            <Table size="small" sx={{
                tableLayout: 'auto', // Allow table to auto-adjust to content
                width: 'auto' // Ensure the table takes only the width it needs
            }} padding='none'>
                <TableHead>
                    <TableRow >
                        <TableCell sx={{ px: 1 }}>Month</TableCell>
                        {
                            years.map(c => <TableCell align="right" sx={{ px: 1 }} key={c}>{c}</TableCell>)
                        }
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rowsData.map((row: any) => (
                        <TableRow
                            key={row.id}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 }, padding: 0 }}
                        >
                            <TableCell component="th" scope="row" sx={{ width: 100, px: 1 }}>
                                {row.id}
                            </TableCell>
                            {
                                years.map(c => <TableCell key={c} align="right" sx={{ padding: 0, width: 80, height: '32px' }} padding="none">
                                    {/* {row[`d${c}`]} */}
        {/* <ConditionalFormattingBox value={row[`d${c}`] * 1000} formattedValue={row[`f${c}`]} />
    </TableCell>)
}
                        </TableRow >
                    ))}
                </TableBody >
            </Table >
        </TableContainer > */} 
        
{/* <DataGrid rows={rowsData}
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
        /> */}

    </Box >
}