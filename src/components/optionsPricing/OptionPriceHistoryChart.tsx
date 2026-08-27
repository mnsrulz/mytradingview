'use client';
import { useCallback, useMemo, useRef, useState } from "react";
import { useTheme } from "@mui/material";
import { useColorScheme } from "@mui/material";
import { Box, Stack, Typography } from "@mui/material";
import { grey, green, red } from "@mui/material/colors";
import { Chart, CandlestickSeries, HistogramSeries, Pane, TimeScale, TimeScaleFitContentTrigger, WatermarkText } from "lightweight-charts-react-components";
import type { SeriesApiRef } from "lightweight-charts-react-components";
import { CrosshairMode } from "lightweight-charts";
import type { CandlestickData, MouseEventParams, Time } from "lightweight-charts";
import { OptionPriceHistoryResponse } from "@/lib/optionPriceHistory";

type LegendData = {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    color: string;
};

const isCandlestickData = (data: unknown): data is CandlestickData<Time> => {
    return typeof data === 'object' && data !== null && 'close' in data && 'open' in data && 'high' in data && 'low' in data;
};

const timeToString = (time: Time): string => {
    if (typeof time === 'number') {
        return new Date(time * 1000).toLocaleDateString();
    }
    if (typeof time === 'object' && 'year' in time) {
        return `${time.year}-${String(time.month).padStart(2, '0')}-${String(time.day).padStart(2, '0')}`;
    }
    return String(time);
};

const mapToLegendData = (d: CandlestickData<Time>, upColor: string, downColor: string): LegendData => {
    const decreased = d.open > d.close;
    return {
        time: timeToString(d.time),
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
        color: decreased ? downColor : upColor,
    };
};

const Watermark = ({ text, color }: { text: string, color: string }) => {
    const theme = useTheme();
    return (
        <WatermarkText
            lines={[{ text, color, fontSize: 24, fontFamily: theme.typography.fontFamily }]}
            horzAlign="center"
            vertAlign="center"
        />
    );
};

export const OptionPriceHistoryChart = ({ data }: { data: OptionPriceHistoryResponse }) => {
    const theme = useTheme();
    const { mode: colorMode } = useColorScheme();
    const isDarkMode = colorMode === 'dark';

    const {
        mainColor,
        watermarkColor,
        volumeColor,
        volumeUpColor,
        volumeDownColor,
    } = isDarkMode
        ? {
            mainColor: theme.palette.grey[200],
            watermarkColor: grey[800],
            volumeColor: 'rgba(99, 110, 128, 0.5)',
            volumeUpColor: 'rgba(38, 166, 154, 0.6)',
            volumeDownColor: 'rgba(239, 83, 80, 0.6)',
        }
        : {
            mainColor: theme.palette.grey[900],
            watermarkColor: grey[500],
            volumeColor: 'rgba(99, 110, 128, 0.4)',
            volumeUpColor: 'rgba(0, 150, 136, 0.5)',
            volumeDownColor: 'rgba(244, 67, 54, 0.5)',
        };

    const candleRef = useRef<SeriesApiRef<"Candlestick">>(null);

    const upColor = isDarkMode ? green[300] : green[700];
    const downColor = isDarkMode ? red[300] : red[700];

    const candles = useMemo(() => data.dt.map((d, ix) => ({
        time: d,
        open: data.open[ix],
        high: data.high[ix],
        low: data.low[ix],
        close: data.close[ix],
    })), [data]);

    const volume = useMemo(() => data.dt.map((d, ix) => ({
        time: d,
        value: data.volume[ix],
        color: data.close[ix] >= data.open[ix] ? volumeUpColor : volumeDownColor,
    })), [data, volumeUpColor, volumeDownColor]);

    const [legend, setLegend] = useState<LegendData | null>(() => {
        if (candles.length === 0) return null;
        return mapToLegendData(candles[candles.length - 1], upColor, downColor);
    });

    const onCrosshairMove = useCallback((param: MouseEventParams<Time>) => {
        if (!candleRef.current) return;
        const seriesApi = candleRef.current.api();
        if (!seriesApi) return;

        if (!param.time) {
            const last = seriesApi.dataByIndex(Number.MAX_SAFE_INTEGER, -1);
            if (isCandlestickData(last)) {
                setLegend(prev => {
                    const next = mapToLegendData(last, upColor, downColor);
                    return prev?.time === next.time ? prev : next;
                });
            }
            return;
        }

        const d = param.seriesData.get(seriesApi);
        if (!isCandlestickData(d)) {
            setLegend(null);
            return;
        }
        setLegend(prev => {
            const next = mapToLegendData(d, upColor, downColor);
            return prev?.time === next.time ? prev : next;
        });
    }, [upColor, downColor]);

    const chartOptions = useMemo(() => ({
        autoSize: true,
        layout: {
            fontFamily: "Inter, Roboto, sans-serif",
            fontSize: 11,
            attributionLogo: false,
            background: { color: "transparent" },
            textColor: mainColor,
        },
        grid: {
            vertLines: { visible: false },
            horzLines: { visible: false },
        },
        crosshair: {
            mode: CrosshairMode.Normal,
            vertLine: { style: 3, color: mainColor },
            horzLine: { style: 3, color: mainColor },
        }
    }), [mainColor]);

    const containerProps = useMemo(() => ({
        style: { flexGrow: 1, height: 440, position: 'relative' as const }
    }), []);

    const change = legend ? legend.close - legend.open : 0;
    const changePct = legend ? (change / legend.open) * 100 : 0;
    const changeSign = change >= 0 ? '+' : '';

    return (
        <Box sx={{ position: 'relative', flexGrow: 1, height: 440 }}>
            {legend && (
                <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 10, pointerEvents: 'none' }}>
                    <Typography variant="caption" sx={{ opacity: 0.6, display: 'block', mb: 0.5 }}>
                        {legend.time}
                    </Typography>
                    <Stack direction="row" gap={1.5}>
                        <Typography variant="caption" fontWeight="bold">
                            O <span style={{ color: legend.color }}>{legend.open.toFixed(2)}</span>
                        </Typography>
                        <Typography variant="caption" fontWeight="bold">
                            H <span style={{ color: legend.color }}>{legend.high.toFixed(2)}</span>
                        </Typography>
                        <Typography variant="caption" fontWeight="bold">
                            L <span style={{ color: legend.color }}>{legend.low.toFixed(2)}</span>
                        </Typography>
                        <Typography variant="caption" fontWeight="bold">
                            C <span style={{ color: legend.color }}>{legend.close.toFixed(2)}</span>
                        </Typography>
                        <Typography variant="caption" fontWeight="bold" sx={{ color: legend.color }}>
                            {changeSign}{change.toFixed(2)} ({changeSign}{changePct.toFixed(2)}%)
                        </Typography>
                    </Stack>
                </Box>
            )}
            <Chart
                options={chartOptions}
                containerProps={containerProps}
                onCrosshairMove={onCrosshairMove}
            >
                <Pane stretchFactor={3}>
                    <CandlestickSeries ref={candleRef} data={candles} options={{
                        upColor,
                        downColor,
                        borderUpColor: upColor,
                        borderDownColor: downColor,
                        wickUpColor: upColor,
                        wickDownColor: downColor,
                    }} />
                    <Watermark color={watermarkColor} text="Option Price" />
                </Pane>
                <Pane stretchFactor={1}>
                    <HistogramSeries data={volume} options={{
                        priceFormat: { type: 'volume' },
                        priceScaleId: "right",
                        color: volumeColor,
                    }} />
                    <Watermark color={watermarkColor} text="Volume" />
                </Pane>
                <TimeScale>
                    <TimeScaleFitContentTrigger deps={[]} />
                </TimeScale>
            </Chart>
        </Box>
    );
}
