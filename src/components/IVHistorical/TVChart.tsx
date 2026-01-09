'use client';
import { VolatilityResponse } from "@/lib/socket";
import { useTheme } from "@mui/material";
import { Chart, LineSeries, Pane, TimeScale, TimeScaleFitContentTrigger, WatermarkText } from "lightweight-charts-react-components";
import { useColorScheme } from '@mui/material/styles';
import { red, green, grey, orange, cyan } from '@mui/material/colors'


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

export const TVChart = ({ volatility }: { volatility: VolatilityResponse }) => {
    const theme = useTheme();

    const { mode: colorMode } = useColorScheme();
    const isDarkMode = colorMode === 'dark';

    const {
        mainColor,
        stockPriceColor,
        callPriceColor,
        putPriceColor,
        callIVColor,
        putIVColor,
        iv30Color,
        watermarkColor,
    } = isDarkMode
            ? {
                // DARK MODE
                mainColor: theme.palette.grey[200],
                stockPriceColor: orange[300],

                callPriceColor: green[300],
                putPriceColor: red[300],

                callIVColor: green[300],
                putIVColor: red[300],
                iv30Color: cyan[200],    // reference line

                watermarkColor: grey[800],
            }
            : {
                // LIGHT MODE
                mainColor: theme.palette.grey[900],
                stockPriceColor: orange[800],

                callPriceColor: green[700],
                putPriceColor: red[700],

                callIVColor: green[700],
                putIVColor: red[700],

                iv30Color: cyan[600],    // reference line

                watermarkColor: grey[500],
            };

    return <Chart
        options={{
            autoSize: true,
            layout: {
                fontFamily: "Inter, Roboto, sans-serif",
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
                height: 540
            }

        }}>
        {/* <LineSeries data={data} /> */}
        <Pane stretchFactor={3}>
            <LineSeries options={{
                color: stockPriceColor,
                lineWidth: 2
            }} data={volatility.dt.map((k, ix) => ({ time: k, value: volatility.close[ix] }))} />
            <Watermark color={watermarkColor} text="Stock Pricing" />
        </Pane>
        <Pane stretchFactor={2}>
            <LineSeries data={volatility.dt.map((k, ix) => ({ time: k, value: volatility.cp[ix] }))}
                options={{
                    priceLineVisible: false,
                    color: callPriceColor,
                    lineWidth: 2,
                    priceScaleId: "right",
                }} />
            <LineSeries data={volatility.dt.map((k, ix) => ({ time: k, value: volatility.pp[ix] }))}
                options={{
                    priceLineVisible: false,
                    color: putPriceColor,
                    lineWidth: 2,
                    priceScaleId: "right",
                }}
            />
            <Watermark color={watermarkColor} text="Options Pricing" />
        </Pane>
        <Pane stretchFactor={2}>
            <LineSeries data={volatility.dt.map((k, ix) => ({ time: k, value: volatility.cv[ix] }))}
                options={{
                    priceLineVisible: false,
                    color: callIVColor,
                    lineWidth: 2,
                    priceScaleId: "right",
                }} />
            <LineSeries data={volatility.dt.map((k, ix) => ({ time: k, value: volatility.pv[ix] }))}
                options={{
                    priceLineVisible: false,
                    color: putIVColor,
                    lineWidth: 2,
                    priceScaleId: "right",
                }}
            />
            <Watermark color={watermarkColor} text="IV" />
        </Pane>
        <Pane stretchFactor={2}>
            <LineSeries data={volatility.dt.map((k, ix) => ({ time: k, value: volatility.iv30[ix] }))}
                options={{
                    priceLineVisible: false,
                    color: iv30Color,
                    lineWidth: 2,
                    priceScaleId: "right",
                }} />
            <Watermark color={watermarkColor} text="IV30" />
        </Pane>
        <TimeScale>
            <TimeScaleFitContentTrigger deps={[]} />
        </TimeScale>
    </Chart>
}