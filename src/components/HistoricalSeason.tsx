'use client';
import { HistoricalDataResponse, EarningsSeason } from "@/lib/types"
import dayjs from "dayjs";
import { Box, Divider, FormControl, Grid, InputLabel, MenuItem, Select, Tab, Tabs } from "@mui/material";
import { TickerSearchDialog } from "./TickerSearchDialog";
import { HeatMap } from "./HeatMap";
import { useQueryState, parseAsStringEnum, parseAsBoolean } from 'nuqs';
import { useRouter } from 'next/navigation';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { currencyFormatter, percentageFormatter } from "@/lib/formatters";

dayjs.extend(customParseFormat);

const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
];

const days = [
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri'
]

enum DataMode {
    Daily = 'Daily',
    Monthly = 'Monthly',
    Earnings = 'Earnings'
}

export const SeasonHeader = (props: { symbol: string, mode: string }) => {
    const { mode } = props;
    const { push } = useRouter();
    return <><TickerSearchDialog {...props} basePath='/seasonal' />
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={mode} onChange={(e, v) => push(`?mode=${v}`)} variant="fullWidth" indicatorColor="secondary"
                textColor="secondary">
                <Tab label="Daily" value='Daily' />
                <Tab label="Monthly" value='Monthly' />
                <Tab label="Earnings" value='Earnings' />
            </Tabs>
        </Box></>
}

export const HistoricalSeason = (props: { data: HistoricalDataResponse, symbol: string, mode: string }) => {
    // const [mode, setMode] = useQueryState<DataMode>('mode', parseAsStringEnum<DataMode>(Object.values(DataMode)).withDefault(DataMode.Monthly));
    const { mode } = props;
    const dt = props.data;
    const data = getHistoricalData(mode, dt);
    return <HeatMap {...data} formatter='percent' />;
}

const cssFn = (v: any) => {
    return v > 0 ? 'positive' : 'negative';
}



export const EarningsSeasonComponent = (props: { data: EarningsSeason[], symbol: string, mode: string }) => {
    const { data } = props;
    const cellRenderer = (price?: number, change?: number) => {
        let returnValue = '';
        if (price) {
            returnValue += currencyFormatter(price);
            if (change) {
                returnValue += ` (${percentageFormatter(change)})`;
            }
        }
        return returnValue;
    }

    const columns: GridColDef<EarningsSeason>[] = [
        { field: 'date', headerName: 'Date' },
        { field: 'openPercentage', headerName: 'Open', type: 'number', valueFormatter: (v: number, row) => cellRenderer(row.open, v), width: 160, cellClassName: ({ value }) => cssFn(value) },
        { field: 'closePercentage', headerName: 'Close', type: 'number', valueFormatter: (v: number, row) => cellRenderer(row.close, v), width: 160, cellClassName: ({ value }) => cssFn(value) },
        { field: 'nextOpenPercentage', headerName: 'Next Day Open', type: 'number', valueFormatter: (v: number, row) => cellRenderer(row.nextOpen, v), width: 160, cellClassName: ({ value }) => cssFn(value) },
        { field: 'nextClosePercentage', headerName: 'Next Day Close', type: 'number', valueFormatter: (v: number, row) => cellRenderer(row.nextClose, v), width: 160, cellClassName: ({ value }) => cssFn(value) },
    ];
    return data.length > 0 ? <DataGrid
        sx={{
            border: 0,
            '& .positive': {
                color: 'green'
            },
            '& .negative': {
                color: 'red'
            }
        }}
        density="compact"
        getRowId={(r: EarningsSeason) => r.date}
        rows={data}
        columns={columns}
        disableRowSelectionOnClick
    /> : <span>There is no earnings data for this symbol.</span>;
}

function getHistoricalData(mode: string, data: HistoricalDataResponse) {
    switch (mode) {
        case DataMode.Daily:
            return getDailyData(data);
        case DataMode.Monthly:
            return getMonthlyData(data);
        case DataMode.Earnings:
            return getDailyData(data);
        default:
            throw new Error('invalid mode supplied');
    }
}

function getDailyData(dt: HistoricalDataResponse) {
    if (dt.history.day.length < 2) throw new Error('not enough data...');
    const startDate = dayjs(dt.history.day.at(0)?.date, 'YYYY-MM-DD', true);
    const endDate = dayjs(dt.history.day.at(-1)?.date, 'YYYY-MM-DD', true);
    const firstMonday = startDate.subtract(startDate.day() - 1, 'd');
    const numberOfWeeks = endDate.diff(startDate, 'w') + 1;
    const ys = [...Array(numberOfWeeks).keys()].reduce((j: string[], c) => {
        j.push(`${firstMonday.add(c, 'w').format('DD MMM YY')}`);
        return j;
    }, []);
    let lastClosingPrice = 0;

    // console.log(`startDate: ${startDate.format('YYYY-MM-DD')}  dayOfWeek: ${startDate.day()} ${startDate.subtract(startDate.day() - 1, 'd')}`);
    // console.log(`firstMonday: ${firstMonday.toISOString()} ${firstMonday.format('YYYY-MM-DD')}`);
    // console.log(`startDate: ${startDate.toISOString()} ${startDate.format('YYYY-MM-DD')}`);

    //split this data dt into weekly data
    const data = dt.history.day.reduce((acc: number[][], current) => {
        const lp = lastClosingPrice || current.open
        const pm = ((current.close - lp) / lp);
        const currentItemDate = dayjs(current.date, 'YYYY-MM-DD', true)
        const dayOfWeek = currentItemDate.day() - 1;
        const weekNumber = currentItemDate.diff(firstMonday, 'w');
        // if (ys[weekNumber] == '14 Oct 2024') {
        //     console.log(`${dayOfWeek}  -- ${currentItemDate.toISOString()} -- ${currentItemDate.format('YYYY-MM-DD')} -- weeddif: ${currentItemDate.diff(firstMonday, 'w', true)}`)
        // }
        acc[weekNumber][dayOfWeek] = pm;
        lastClosingPrice = current.close;
        return acc;
    }, [...Array<number[]>(numberOfWeeks)].map(_ => Array<number>(5).fill(0)));
    return {
        data: data.reverse(),
        xLabels: days,
        yLabels: ys.reverse(),
        zeroHeaderLabel: 'Week'
    }
}

function getMonthlyData(dt: HistoricalDataResponse) {
    const ys = [...new Set(dt.history.day.map(j => dayjs(j.date).format('YYYY')))];
    const data = dt.history.day.reduce((acc: number[][], current) => {
        const year = dayjs(current.date).format('YYYY');
        const pm = ((current.close - current.open) / current.open);
        const month = dayjs(current.date).month();
        acc[month][ys.indexOf(year)] = pm;
        return acc;
    }, [...Array<number[]>(12)].map(_ => Array<number>(ys.length).fill(0)));
    return {
        data,
        xLabels: ys,
        yLabels: months,
        zeroHeaderLabel: 'Month'
    }
}