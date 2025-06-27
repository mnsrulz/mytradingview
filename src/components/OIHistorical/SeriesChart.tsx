'use client';

import { getHistoricalOISummaryBySymbol } from "@/lib/mzDataService";
import { useEffect, useState } from "react";
import { BarPlot } from '@mui/x-charts/BarChart';
import { Box, LinearProgress } from '@mui/material';
import { OIReportDataResponse } from "@/lib/types";
import { ChartContainer, ChartsLegend, ChartsXAxis, ChartsYAxis, LinePlot } from '@mui/x-charts';
import { fixedCurrencyFormatter, numberCompactFormatter } from "@/lib/formatters";
import { green, red, yellow } from '@mui/material/colors';
import { useNotifications } from "@toolpad/core";

const priceLineColor = yellow[900]; // Color for the price line
const barCallColor = green[900]; // Color for the call bar
const barPutColor = red[900]; // Color for the put bar

export const SeriesChart = (props: { symbol: string, expirationDates: string[] }) => {
    const { symbol, expirationDates } = props;
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<OIReportDataResponse[]>([]);
    const notifications = useNotifications();

    useEffect(() => {
        setIsLoading(true);
        getHistoricalOISummaryBySymbol(symbol, expirationDates).then((data) => {
            setData(data);
            setIsLoading(false);
        }).catch((error) => {
            notifications.show('Error fetching data!', {
                autoHideDuration: 3000,
            });
        });
    }, [symbol, expirationDates])

    if (isLoading) return <LinearProgress />

    // const map = new Map();
    // data.forEach(({ dt, option_type, total_open_interest }) => {
    //     if (!map.has(dt)) map.set(dt, { dt, Call: 0, Put: 0 });
    //     const entry = map.get(dt);
    //     if (option_type === "C") entry.Call += total_open_interest;
    //     else if (option_type === "P") entry.Put += total_open_interest;
    // });

    // data.forEach(({ dt, option_type, strike, total_open_interest }) => {
    //     if (!map.has(dt)) map.set(dt, { dt });
    //     const row = map.get(dt);
    //     const key = `${option_type}-${strike}`;
    //     row[key] = (row[key] || 0) + total_open_interest;
    // });

    // const dataset = Array.from(map.values());

    // const keys = new Set<string>();
    // data.forEach(({ option_type, strike }) => {
    //     keys.add(`${option_type}-${strike}`);
    // });
    // const seriesKeys = Array.from(keys);

    // const barchartv1 = <BarChart
    //     dataset={dataset}
    //     xAxis={[{ scaleType: 'band', dataKey: 'dt', label: 'Date' }]}
    //     series={[
    //         { dataKey: 'Call', label: 'Call OI', color: green[500] },
    //         { dataKey: 'Put', label: 'Put OI', color: red[500] },
    //     ]}
    //     // series={seriesKeys.map((key) => ({
    //     //     dataKey: key,
    //     //     label: key,
    //     //     stack: 'total',
    //     // }))}
    //     height={400}
    // />

    const dates = [...new Set(data.map(d => d.dt))];

    const callOI = dates.map(date =>
        data.filter(d => d.dt === date && d.option_type === 'C').reduce((acc, curr) => acc + (curr.total_open_interest || 0), 0)
    );

    const putOI = dates.map(date =>
        data.filter(d => d.dt === date && d.option_type === 'P').reduce((acc, curr) => acc + (curr.total_open_interest || 0), 0)
    );

    const prices = dates.map(date =>
        data.find(d => d.dt === date)?.price || 0
    );

    return <Box>
        <h2>Open Interest Report for {symbol}</h2>
        <ChartContainer
            // width={960}
            height={480}
            series={[
                {
                    type: 'bar',
                    stack: 'oi-calls',
                    yAxisId: 'left-axis',
                    data: callOI,
                    label: 'Calls OI',
                    color: barCallColor
                },
                {
                    type: 'bar',
                    stack: 'oi-puts',
                    yAxisId: 'left-axis',
                    data: putOI,
                    label: 'Puts OI',
                    color: barPutColor,
                },
                {
                    type: 'line',
                    yAxisId: 'right-axis',
                    data: prices,
                    label: 'Price',
                    color: priceLineColor,
                },
            ]}
            xAxis={[{ id: 'x-axis', scaleType: 'band', data: dates }]}
            yAxis={[
                { id: 'left-axis', scaleType: 'linear', position: 'left', label: 'Open Interest', valueFormatter: (v) => numberCompactFormatter(v) },
                { id: 'right-axis', scaleType: 'linear', position: 'right', label: 'Price', valueFormatter: (v) => fixedCurrencyFormatter(v) },
            ]}
        >
            <BarPlot />
            <LinePlot />
            <ChartsXAxis axisId={'x-axis'} />
            <ChartsYAxis axisId={'left-axis'} />
            <ChartsYAxis axisId={'right-axis'} />
            <ChartsLegend direction="horizontal" />
        </ChartContainer>
    </Box>;
}