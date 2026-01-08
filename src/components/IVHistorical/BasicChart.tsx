'use client';
import { VolatilityResponse } from "@/lib/socket";
import { LineChart } from "@mui/x-charts/LineChart";
import dayjs from "dayjs";
import { useState } from "react";
import { percentageNoDecimalFormatter } from "@/lib/formatters";
import { SeriesLegendItemContext } from "@mui/x-charts/ChartsLegend";


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

    return <LineChart
        sx={{
            width: '100%',
            minWidth: 600,
            height: 540
        }}
        series={[
            { data: disabledDataPoints.includes('iv30') ? [] : volatility.iv30, label: 'IV30', id: "iv30", yAxisId: 'leftAxisId', showMark: false, color: 'cyan' },
            { data: disabledDataPoints.includes('cv') ? [] : volatility.cv, label: 'CALL IV', id: "cv", yAxisId: 'leftAxisId', showMark: false, color: 'green' },
            { data: disabledDataPoints.includes('pv') ? [] : volatility.pv, label: 'PUT IV', id: "pv", yAxisId: 'leftAxisId', showMark: false, color: 'red' },
            { data: disabledDataPoints.includes('cp') ? [] : volatility.cp, label: 'CALL Price', id: "cp", yAxisId: 'rightAxisId', showMark: false, color: 'lightgreen' },
            { data: disabledDataPoints.includes('pp') ? [] : volatility.pp, label: 'PUT Price', id: "pp", yAxisId: 'rightAxisId', showMark: false, color: 'pink' },
            { data: disabledDataPoints.includes('straddle') ? [] : volatility.straddle, label: 'STRADDLE Price', id: "straddle", yAxisId: 'rightAxisId', showMark: false, color: 'purple' },
            { data: disabledDataPoints.includes('close') ? [] : volatility.close, label: 'Stock Price', id: "close", yAxisId: 'rightAxisId', showMark: false, color: 'orange' },
        ]}
        xAxis={[{ scaleType: 'point', data: volatility.dt, valueFormatter: xAxisFormatter }]}
        yAxis={[
            { id: 'leftAxisId', label: 'IV %', valueFormatter: percentageNoDecimalFormatter },
            { id: 'rightAxisId', position: 'right', label: 'Stock / Contract Price $', min: getMinYAxisValue() }
        ]}
        slotProps={{
            legend: {
                onItemClick: (args: any, li: SeriesLegendItemContext) => {
                    setDisabledDataPoints(v => {
                        if (v.includes(li.seriesId.toString()))
                            return v.filter(k => k !== li.seriesId.toString());
                        return [...v, li.seriesId.toString()];
                    });
                }
            }
        }}
        // grid={{ horizontal: true, vertical: true }}
    />
}