'use client';
import { VolatilityResponse } from "@/lib/socket";
import { useMemo } from "react";
import { Box, Grow, Typography, useTheme } from "@mui/material";
import { Chart, LineSeries, Pane, TimeScale, TimeScaleFitContentTrigger, WatermarkText } from "lightweight-charts-react-components";
import { useColorScheme } from '@mui/material/styles';
import { red, green, grey, orange, cyan } from '@mui/material/colors'
import { useOptionsPricingTooltip } from "./useTooltip";


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

export const TVChart = ({ volatility }: { volatility: VolatilityResponse & { straddle: number[] } }) => {
    const theme = useTheme();

    const { mode: colorMode } = useColorScheme();
    const isDarkMode = colorMode === 'dark';

    const { onCrosshairMove, tooltipData } = useOptionsPricingTooltip(volatility);

    const {
        mainColor,
        stockPriceColor,
        callPriceColor,
        putPriceColor,
        callIVColor,
        putIVColor,
        iv30Color,
        watermarkColor,
        straddlePriceColor
    } = isDarkMode
            ? {
                // DARK MODE
                mainColor: theme.palette.grey[200],
                stockPriceColor: orange[300],

                callPriceColor: green[300],
                putPriceColor: red[300],
                
                straddlePriceColor: orange[300],

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

                straddlePriceColor: orange[800],

                callIVColor: green[700],
                putIVColor: red[700],

                iv30Color: cyan[600],    // reference line

                watermarkColor: grey[500],
            };

    const chartOptions = useMemo(() => ({
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
    }), [mainColor]);

    const containerProps = useMemo(() => ({
        style: {
            flexGrow: 1,
            height: 540,
            position: 'relative' as const,
        }
    }), []);

    return <Chart
        onCrosshairMove={onCrosshairMove}
        options={chartOptions}
        containerProps={containerProps}>
        {/* <LineSeries data={data} /> */}
        <Pane stretchFactor={3}>
            <LineSeries options={{
                color: stockPriceColor,
                lineWidth: 2
            }} data={volatility.dt.map((k, ix) => ({ time: k, value: volatility.close[ix] }))} />
            <Watermark color={watermarkColor} text="Stock Pricing" />
        </Pane>
        <Pane stretchFactor={2}>
            <LineSeries data={volatility.dt.map((k, ix) => ({ time: k, value: volatility.straddle[ix] }))}
                options={{
                    priceLineVisible: true,
                    color: straddlePriceColor,
                    lineWidth: 2,
                    priceScaleId: "right",
                }} />
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
        <Grow in={tooltipData.show} timeout={{ enter: 300 }}>
            <Box
                sx={{
                    position: 'absolute',
                    top: tooltipData.position.y,
                    left: tooltipData.position.x,
                    zIndex: 10,
                    bgcolor: isDarkMode ? 'grey.900' : 'white',
                    color: isDarkMode ? 'grey.100' : 'grey.900',
                    borderRadius: 1,
                    px: 1.5,
                    py: 1,
                    boxShadow: 2,
                    pointerEvents: 'none',
                    minWidth: 160,
                }}
            >
                <Typography variant="caption" sx={{ opacity: 0.7 }}>{tooltipData.time}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 0.5 }}>
                    <Typography variant="body2" sx={{ color: callPriceColor }}>Call</Typography>
                    <Typography variant="body2" fontWeight="bold">${tooltipData.callPrice.toFixed(2)}</Typography>
                    <Typography variant="body2" sx={{ color: callPriceColor, opacity: 0.7 }}>${tooltipData.callStrike.toFixed(0)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                    <Typography variant="body2" sx={{ color: putPriceColor }}>Put</Typography>
                    <Typography variant="body2" fontWeight="bold">${tooltipData.putPrice.toFixed(2)}</Typography>
                    <Typography variant="body2" sx={{ color: putPriceColor, opacity: 0.7 }}>${tooltipData.putStrike.toFixed(0)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 0.5, pt: 0.5, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="body2" sx={{ color: straddlePriceColor }}>Straddle</Typography>
                    <Typography variant="body2" fontWeight="bold">${tooltipData.straddle.toFixed(2)}</Typography>
                </Box>
            </Box>
        </Grow>
        <TimeScale>
            <TimeScaleFitContentTrigger deps={[]} />
        </TimeScale>
    </Chart>
}