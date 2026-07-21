'use client';
import { useExpectedMove, useOhlc } from "@/lib/socket";
import { LinearProgress, Paper, Typography, useTheme } from "@mui/material";
import { useColorScheme } from "@mui/material";
import Box from "@mui/material/Box";
import { green, grey } from "@mui/material/colors";
import { Chart, LineSeries, Pane, TimeScale, TimeScaleFitContentTrigger, WatermarkText, SeriesPrimitive, CandlestickSeries, } from "lightweight-charts-react-components";
import { useEffect, useMemo } from "react";
import { ExpecteMoveDisplayOptions, ExpectedMovePrimitive } from "./ExpectedMovePrimitive";
import dayjs from "dayjs";
import { CrosshairMode } from "lightweight-charts";

type ExpectedMoveChartOptions = { symbol: string, mode: 'weekly' | 'monthly', useMagnetCrossHair?: boolean, expectedMoveDisplayOption: ExpecteMoveDisplayOptions, lookbackDays: number }
export const ExpectedMoveChart = ({ symbol, mode, useMagnetCrossHair, expectedMoveDisplayOption, lookbackDays }: ExpectedMoveChartOptions) => {
    const { data: expectedMove, isLoading } = useExpectedMove(symbol, lookbackDays, mode);
    const { data: dailyData, isLoading: isOhlcLoading } = useOhlc(symbol, lookbackDays);

    const theme = useTheme();

    const { mode: colorMode } = useColorScheme();
    const isDarkMode = colorMode === 'dark';

    // 1. Prepare the data inside your component
    const boxes = useMemo(() => {
        if (expectedMove.length === 0 || dailyData.length == 0) return [];
        return expectedMove.map((d, ix) => {
            //const endTime = data.length == (ix + 1) ? dayjs(d.start).add(1, mode === 'weekly' ? 'week' : 'month').format('YYYY-MM-DD') : dayjs(data[ix + 1].start).subtract(1, 'day').format('YYYY-MM-DD');
            //const endTime = dayjs(data[ix + 1]?.start).add(-1, 'day').format('YYYY-MM-DD') || dayjs(d.start).add(1, mode === 'weekly' ? 'week' : 'month').format('YYYY-MM-DD')


            return {
                startTime: d.dt,
                endTime: d.expiry,
                lastClose: d.last_close,
                straddlePrice: d.straddle_price,
                low: Math.min(...dailyData.filter(k => k.dt >= d.dt && k.dt <= d.expiry).map(k => k.low)),
                high: Math.max(...dailyData.filter(k => k.dt >= d.dt && k.dt <= d.expiry).map(k => k.high)),
                spanDays: dayjs(d.expiry).diff(d.dt, 'day')
            }
        });
    }, [expectedMove, dailyData]);

    // 2. Memoize the Primitive instance itself
    const weeklyBoxPlugin = useMemo(() => {
        if (boxes.length === 0) return null;
        return new ExpectedMovePrimitive(boxes, isDarkMode);
    }, [boxes, isDarkMode]);

    useEffect(() => {
        weeklyBoxPlugin?.updateOptions({
            useDarkTheme: isDarkMode,
            expectedMoveDisplayOption: expectedMoveDisplayOption
        });
    }, [isDarkMode, expectedMoveDisplayOption, weeklyBoxPlugin]);

    const {
        mainColor,
        callPriceColor,
        watermarkColor,
    } = isDarkMode
            ? {
                // DARK MODE
                mainColor: theme.palette.grey[200],
                callPriceColor: green[300],
                watermarkColor: grey[800],
            }
            : {
                // LIGHT MODE
                mainColor: theme.palette.grey[900],
                callPriceColor: green[700],
                watermarkColor: grey[500],
            };

    if (isOhlcLoading || isLoading) {
        return <LinearProgress />
    }

    return <Paper sx={{ height: '90%', display: 'flex', flexDirection: 'column' }}>
        <Chart
            options={{
                autoSize: true,
                layout: {
                    fontFamily: "Roboto Mono, monospace",
                    fontSize: 10,
                    attributionLogo: false,
                    background: {
                        color: "transparent",
                    },
                    textColor: mainColor,
                },
                grid: {
                    vertLines: {
                        visible: false,
                    },
                    horzLines: {
                        visible: false,
                    },
                },
                crosshair: {
                    mode: useMagnetCrossHair ? CrosshairMode.MagnetOHLC : CrosshairMode.Normal,
                    vertLine: {
                        style: 3,
                        color: mainColor,
                    },
                    horzLine: {
                        style: 3,
                        color: mainColor,
                    },
                }
            }}
            containerProps={{
                style: {
                    flexGrow: 1,
                    height: '100%'
                }

            }}>
            <Pane stretchFactor={3}>
                <CandlestickSeries
                    data={dailyData.map(({ dt, open, high, low, close }, ix) => ({ time: dt, open, high, low, close }))}>
                    {weeklyBoxPlugin && <SeriesPrimitive plugin={weeklyBoxPlugin} />}
                </CandlestickSeries>
            </Pane>
            <Pane stretchFactor={1}>
                <LineSeries data={dailyData.map((d, ix) => ({ time: d.dt, value: d.iv30 }))}
                    options={{
                        priceLineVisible: false,
                        color: callPriceColor,
                        lineWidth: 2,
                        priceScaleId: "right",
                    }} />
                <Watermark color={watermarkColor} text="IV30" />
            </Pane>
            <TimeScale>
                <TimeScaleFitContentTrigger deps={[]} />
            </TimeScale>
        </Chart>
        <Typography variant="caption" color="text.secondary" sx={{ p: 2 }}>
            Displaying chart for <strong>${symbol}</strong> expected and actual <strong>{mode}</strong> move.
            <Box component="span" sx={{ color: 'error.main', fontWeight: 'medium', ml: 0.5 }}>
                Red color
            </Box> indicating the price crossed straddle price during that period.
            Calculation is done based on the ATM straddle price given at the close of {mode} options.
        </Typography>
    </Paper>
}

const Watermark = ({ text, color }: { text: string, color: string }) => {
    const theme = useTheme();
    return (
        <WatermarkText
            lines={[
                {
                    text,
                    color: color,
                    fontSize: 32,
                    fontFamily: theme.typography.fontFamily,
                },
            ]}
            horzAlign="center"
            vertAlign="center"
        />
    );
};
