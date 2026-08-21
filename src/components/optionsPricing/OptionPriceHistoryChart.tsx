'use client';
import { useTheme } from "@mui/material";
import { useColorScheme } from "@mui/material";
import { grey } from "@mui/material/colors";
import { Chart, CandlestickSeries, HistogramSeries, Pane, TimeScale, TimeScaleFitContentTrigger, WatermarkText } from "lightweight-charts-react-components";
import { OptionPriceHistoryResponse } from "@/lib/optionPriceHistory";

const Watermark = ({ text, color }: { text: string, color: string }) => {
    const theme = useTheme();
    return (
        <WatermarkText
            lines={[
                {
                    text,
                    color,
                    fontSize: 24,
                    fontFamily: theme.typography.fontFamily,
                },
            ]}
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

    const candles = data.dt.map((d, ix) => ({
        time: d,
        open: data.open[ix],
        high: data.high[ix],
        low: data.low[ix],
        close: data.close[ix],
    }));
    const volume = data.dt.map((d, ix) => ({
        time: d,
        value: data.volume[ix],
        color: data.close[ix] >= data.open[ix] ? volumeUpColor : volumeDownColor,
    }));

    return <Chart
        options={{
            autoSize: true,
            layout: {
                fontFamily: "Inter, Roboto, sans-serif",
                fontSize: 11,
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
                height: 440
            }
        }}>
        <Pane stretchFactor={3}>
            <CandlestickSeries data={candles} />
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
}