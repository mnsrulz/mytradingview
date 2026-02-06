'use client';
import { OptionsStatsResponse } from "@/lib/socket";
import { LineChart } from "@mui/x-charts/LineChart";
import dayjs from "dayjs";
import { useState } from "react";
import { currencyCompactFormatter, numberCompactFormatter } from "@/lib/formatters";
import { Grid } from "@mui/material";

export const BasicChart = ({ stats }: { stats: OptionsStatsResponse }) => {
    const [disabledDataPoints, setDisabledDataPoints] = useState<string[]>([]);
    const xAxisFormatter = (v: string) => dayjs(v).format("MMM D");
    const getMinYAxisValue = () => {
        const values: number[] = [];
        if (!disabledDataPoints.includes('close')) values.push(...stats.close);
        return Math.min(...values) * .8 || 0;
    }

    return <Grid container spacing={1}>
        <Grid size={6}>
            <LineChart
                sx={{
                    width: '100%',
                    height: 320
                }}
                series={[
                    { data: stats.cp.map(k => k), label: 'Calls Total Price', yAxisId: 'leftAxisId', showMark: false },
                    { data: stats.pp.map(k => k), label: 'Puts Total Price', yAxisId: 'leftAxisId', showMark: false }
                ]}
                xAxis={[{ scaleType: 'point', data: stats.dt, valueFormatter: xAxisFormatter }]}
                yAxis={[
                    { id: 'leftAxisId', label: 'Total Money in the market in $', valueFormatter: currencyCompactFormatter }
                ]}
            />
        </Grid>
        <Grid size={6}>
            <LineChart
                sx={{
                    width: '100%',
                    height: 320
                }}
                series={[
                    { data: stats.cd.map(k => k), label: 'Calls Total Delta', yAxisId: 'leftAxisId', showMark: false },
                    { data: stats.pd.map(k => k), label: 'Puts Total Delta', yAxisId: 'leftAxisId', showMark: false }
                ]}
                xAxis={[{ scaleType: 'point', data: stats.dt, valueFormatter: xAxisFormatter }]}
                yAxis={[
                    { id: 'leftAxisId', label: 'Total Delta', valueFormatter: numberCompactFormatter }
                ]}
            />
        </Grid>
        <Grid size={6}>
            <LineChart
                sx={{
                    width: '100%',
                    height: 320
                }}
                series={[
                    { data: stats.co.map(k => k), label: 'Calls Total OI', yAxisId: 'leftAxisId', showMark: false },
                    { data: stats.po.map(k => k), label: 'Puts Total OI', yAxisId: 'leftAxisId', showMark: false }
                ]}
                xAxis={[{ scaleType: 'point', data: stats.dt, valueFormatter: xAxisFormatter }]}
                yAxis={[
                    { id: 'leftAxisId', label: 'Open Interest', valueFormatter: numberCompactFormatter }
                ]}
            />
        </Grid>
        <Grid size={6}>
            <LineChart
                sx={{
                    width: '100%',
                    height: 320
                }}
                series={[
                    { data: stats.close.map(k => k), label: 'Stock Last Close Price', yAxisId: 'leftAxisId', showMark: false },
                    { data: stats.options_count.map(k => k), label: 'Unique Options Count', yAxisId: 'rightAxisId', showMark: false }
                ]}
                xAxis={[{ scaleType: 'point', data: stats.dt, valueFormatter: xAxisFormatter }]}
                yAxis={[
                    { id: 'leftAxisId', label: 'Last Close Price', valueFormatter: currencyCompactFormatter },
                    { id: 'rightAxisId', position: 'right', label: 'Unique Options Count', valueFormatter: numberCompactFormatter }
                ]}
            />
        </Grid>
    </Grid>

}
