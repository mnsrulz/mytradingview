'use client';
import { VolatilityResponse } from "@/lib/socket";
import { LineChart } from "@mui/x-charts/LineChart";
import dayjs from "dayjs";
import { useState } from "react";
import { percentageNoDecimalFormatter } from "@/lib/formatters";
import { Box, Stack, Typography } from "@mui/material";

const seriesDefinition = [
    { id: 'iv30', label: 'IV30', color: 'cyan', yAxisId: 'leftAxisId' },
    { id: 'cv', label: 'CALL IV', color: 'green', yAxisId: 'leftAxisId' },
    { id: 'pv', label: 'PUT IV', color: 'red', yAxisId: 'leftAxisId' },
    { id: 'straddle', label: 'STRADDLE Price', color: 'purple', yAxisId: 'rightAxisId' },
    { id: 'close', label: 'Stock Price', color: 'orange', yAxisId: 'rightAxisId' },
    { id: 'cp', label: 'CALL Price', color: 'lightgreen', yAxisId: 'rightAxisId' },
    { id: 'pp', label: 'PUT Price', color: 'pink', yAxisId: 'rightAxisId' },
] as { id: 'cv' | 'pv' | 'straddle' | 'close' | 'cp' | 'pp' | 'iv30', label: string, color: string, yAxisId: string }[];

export const BasicChart = ({ volatility }: { volatility: VolatilityResponse & { straddle: number[] } }) => {
    const [disabledDataPoints, setDisabledDataPoints] = useState<string[]>([]);
    const xAxisFormatter = (v: string) => dayjs(v).format("MMM D");
    const getMinYAxisValue = () => {
        const values: number[] = [];
        if (!disabledDataPoints.includes('close')) values.push(...volatility.close);
        if (!disabledDataPoints.includes('cp')) values.push(...volatility.cp);
        if (!disabledDataPoints.includes('pp')) values.push(...volatility.pp);
        if (!disabledDataPoints.includes('straddle')) values.push(...volatility.straddle);

        return Math.min(...values) * .8 || 0;
    }

    const items = seriesDefinition.filter(j => !disabledDataPoints.includes(j.id));
    const series = items.map(j => ({
        data: volatility[j.id], label: j.label, id: j.id, yAxisId: j.yAxisId, color: j.color, showMark: false
    }));

    return <LineChart
        sx={{
            width: '100%',
            minWidth: 600,
            height: 540
        }}
        series={series}
        xAxis={[{ scaleType: 'point', data: volatility.dt, valueFormatter: xAxisFormatter }]}
        yAxis={[
            { id: 'leftAxisId', label: 'IV %', valueFormatter: percentageNoDecimalFormatter },
            { id: 'rightAxisId', position: 'right', label: 'Stock / Contract Price $', min: getMinYAxisValue() }
        ]}
        slots={{
            legend: () => <ChartLegend items={seriesDefinition} onItemClick={(seriesId) => {
                setDisabledDataPoints(v => {
                    if (v.includes(seriesId.toString()))
                        return v.filter(k => k !== seriesId.toString());
                    return [...v, seriesId.toString()];
                });
            }} />
        }}
        slotProps={{
            legend: {
                direction: 'horizontal',
                position: {
                    horizontal: 'center'
                }
            }
        }}
    // grid={{ horizontal: true, vertical: true }}
    />
}

const ChartLegend = (props: { items: { label: string, color: string, id: string }[], onItemClick: (id: string) => void }) => {
    const { items } = props;
    return <Stack direction={'row'} sx={{ flexWrap: 'wrap' }} columnGap={2}>
        {
            items.map(item => <Stack key={item.id} direction={'column'} justifyContent={'space-evenly'}
                onClick={() => props.onItemClick(item.id)}>
                <Stack direction="row" alignItems="center" columnGap={1} >
                    <Box width={16} height={4} sx={{ bgcolor: item.color }}></Box>
                    <Typography variant="caption">{item.label}</Typography>
                </Stack>
            </Stack>)
        }
    </Stack>
}
