'use client';
import { HistoricalDataResponse } from "@/lib/types"
import dayjs from "dayjs";
import { Box, Divider, FormControl, InputLabel, MenuItem, Select, Tab, Tabs } from "@mui/material";
import { TickerSearchDialog } from "./TickerSearchDialog";
import { HeatMap } from "./HeatMap";
import { useQueryState, parseAsStringEnum, parseAsBoolean } from 'nuqs';
import { useRouter } from 'next/navigation';

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

const days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday'
]

enum DataMode {
    Daily = 'Daily',
    Monthly = 'Monthly'
}

export const HistoricalSeason = (props: { data: HistoricalDataResponse, symbol: string, mode: string }) => {
    // const [mode, setMode] = useQueryState<DataMode>('mode', parseAsStringEnum<DataMode>(Object.values(DataMode)).withDefault(DataMode.Monthly));
    const { mode } = props;
    const dt = props.data;
    const data = (mode == DataMode.Daily ? getDailyData : getMonthlyData)(dt);
    const { push } = useRouter();

    return <Box sx={{ mt: 1 }}>
        <TickerSearchDialog {...props} />
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={mode} onChange={(e, v) => push(`?mode=${v}`)} variant="fullWidth" indicatorColor="secondary"
                textColor="secondary">
                <Tab label="Daily" value={'Daily'} />
                <Tab label="Monthly" value='Monthly' />
            </Tabs>
        </Box>
        {/* <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
            <InputLabel>Data Mode</InputLabel>
            <Select
                value={mode}
                label="Data Mode"
                onChange={(e) => setMode(e.target.value as DataMode)}
            >
                <MenuItem key="Daily" value="Daily">Daily</MenuItem>
                <MenuItem key="Monthly" value="Monthly">Monthly</MenuItem>
            </Select>
        </FormControl> */}
        <Divider />
        <HeatMap {...data} formatter='percent' />
    </Box >
}

function getDailyData(dt: HistoricalDataResponse) {
    if (dt.history.day.length < 2) throw new Error('not enough data...');
    const startDate = dayjs(dt.history.day.at(0)?.date);
    const endDate = dayjs(dt.history.day.at(-1)?.date);
    const firstMonday = startDate.subtract(startDate.day() - 1);
    const numberOfWeeks = endDate.diff(startDate, 'w') + 1;
    const ys = [...Array(numberOfWeeks).keys()].reduce((j: string[], c) => {
        j.push(`${firstMonday.add(c, 'w').format('DD MMM YYYY')}`);
        return j;
    }, []);
    let lastClosingPrice = 0;

    //split this data dt into weekly data
    const data = dt.history.day.reduce((acc: number[][], current) => {
        const lp = lastClosingPrice || current.open
        const pm = ((current.close - lp) / lp);
        const currentItemDate = dayjs(current.date)
        const dayOfWeek = currentItemDate.day() - 1;
        const weekNumber = currentItemDate.diff(startDate, 'w');
        acc[weekNumber][dayOfWeek] = pm;
        lastClosingPrice = current.close;
        return acc;
    }, [...Array<number[]>(numberOfWeeks)].map(_ => Array<number>(5).fill(0)));
    return {
        data: data.reverse(),
        xLabels: days,
        yLabels: ys.reverse()
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
        yLabels: months
    }
}