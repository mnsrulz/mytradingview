import { getColor, getColorPallete } from "@/lib/color";
import { humanAbsCurrencyFormatter } from "@/lib/formatters";
import { ExposureDataType } from "@/lib/hooks";
import { DexGexType } from "@/lib/types";
import { calculateChartHeight, calculateYAxisTickWidth, percentile } from "@/lib/utils";
import { Box, Checkbox, FormControl, FormControlLabel, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { BarChart, ChartsText, ChartsReferenceLine } from "@mui/x-charts"
import { memo, useState } from "react";
import { CallPutWallLine } from "./CallPutWallLine";
import { ExposureChartLegend } from "./ExposureChartLegend";
const colorCodes = getColorPallete();
import { ghUrl } from '@/lib/constants'
import { GetColorProps, HeatMap } from "../HeatMap";
import { parseAsBoolean, useQueryState } from "nuqs";
import { sendGAEvent } from '@next/third-parties/google';
import { ExpiryValue } from "./ExpirySelectorDropdown";

const xAxixFormatter = (datasetType: DexGexType, v: number) => {
    if (datasetType == 'GEX' && v < 0) {
        return `-${humanAbsCurrencyFormatter(v)}`;
    }
    return humanAbsCurrencyFormatter(v);
}

const GreeksChartLabelMapping = {
    'DEX': 'ABS Delta Exposure',
    'GEX': 'NET Gamma Exposure',
    'OI': 'Open interest',
    'VOLUME': 'Volume'
}

const MobileScreenGreeksChartLabelMapping = {
    'DEX': 'ABS DEX',
    'GEX': 'NET GEX',
    'OI': 'Open interest',
    'VOLUME': 'Volume'
}

export const GreeksExposureChart = (props: { exposureData: ExposureDataType, skipAnimation?: boolean, symbol: string, expiryValue: ExpiryValue, exposureType: DexGexType, isLoading: boolean }) => {
    const { symbol, exposureType, expiryValue, exposureData, skipAnimation, isLoading } = props;
    const { strikes, expirations, items, maxPosition, spotPrice, callWall, putWall, gammaWall, volTrigger, timestamp } = exposureData;
    // debugger;
    // const emaData = { "ema21d": 73.311932116876, "ema9d": 71.9165385595376 }
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const height = calculateChartHeight(expirations, strikes);
    const yaxisline = strikes.length > 0 ? Math.max(...strikes.filter(j => j <= spotPrice)) : 0;
    const maxStrike = strikes.length > 0 ? Math.max(...strikes) : 0;
    const leftMarginValue = calculateYAxisTickWidth(maxStrike);
    const gammaOrDelta = isSmallScreen ? MobileScreenGreeksChartLabelMapping[exposureType] : GreeksChartLabelMapping[exposureType];
    const title = `$${symbol.toUpperCase()} ${gammaOrDelta} (${expiryValue.mode === "dte" ? expiryValue.value : "Custom"} DTE)`;
    const [showAsHeatmap, setShowAsHeatmap] = useQueryState('showHeatmap', parseAsBoolean.withDefault(false));
    const testid = `EXPSOURE-CHART-${symbol}-${exposureType}`
    const enableHeatmap = exposureType == DexGexType.GEX && showAsHeatmap;
    console.log(`Renderring GreeksExposureChart... ${symbol} ${expiryValue} ${exposureType} ${isLoading} items:${items.length} expirations:${expirations.length} strikes:${strikes.length} maxPosition:${maxPosition} spotPrice:${spotPrice} callWall:${callWall} putWall:${putWall} gammaWall:${gammaWall} volTrigger:${volTrigger} timestamp:${timestamp}`)
    return <Box>
        <Stack direction="row" alignItems="center" justifyContent="center" position={"relative"} mb={1}>
            {/* Left */}
            <Box sx={{ minWidth: 80 }}>
                {exposureType == DexGexType.GEX && (
                    <FormControl size="small">
                        <FormControlLabel control={<Checkbox checked={showAsHeatmap} 
                            onChange={(ev) => {
                                sendGAEvent('event', 'exposure_heatmap_toggle', { value: ev.target.checked });
                                setShowAsHeatmap(ev.target.checked);
                            }} />}
                            label="Heatmap" />
                    </FormControl>
                )}
            </Box>
            {/* Center */}
            <Typography variant={isSmallScreen ? "subtitle1" : "h6"} align="center" sx={{ flex: 1 }}>{title}</Typography>
            {/* Right (spacer to balance layout) */}
            <Box sx={{ minWidth: 80 }} />
        </Stack>
        {!isLoading && <div data-testid={testid}></div>}
        {enableHeatmap ? <GexHeatmapChart {...props} spotPriceLineValue={yaxisline} /> : <BarChart
            loading={isLoading}
            skipAnimation={skipAnimation}
            height={height}
            margin={{ right: 0, left: 0 }}
            // tooltip={{
            //     trigger: 'none'
            // }}            
            series={items.map((j, ix) => {
                return { data: j.data, stack: 'A', color: colorCodes[expirations.indexOf(j.expiration)], label: j.expiration, type: 'bar', labelMarkType: 'line' }
            })}
            yAxis={[{
                data: strikes,
                scaleType: 'band',
                // label: 'Strikes',
                reverse: true,
                valueFormatter: (tick) => `$${Number(tick).toFixed(2)}`,
                width: leftMarginValue
            }]}
            xAxis={[{
                min: -maxPosition * 1.1,
                max: maxPosition * 1.1,
                reverse: true,
                label: `${gammaOrDelta}`,
                barGapRatio: 0.1,
                valueFormatter: (v: number) => xAxixFormatter(props.exposureType, v)
            }]}
            layout="horizontal"
            slots={{
                legend: () => <ExposureChartLegend expirations={expirations} showLegendOnTop={isSmallScreen} />
            }}
            slotProps={{
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    direction: isSmallScreen ? 'horizontal' : 'vertical',
                    position: {
                        vertical: 'top',
                        horizontal: 'end'
                    }
                }
            }}
        >
            <ChartsText key='calls' x="25%" y="5%" style={{ textAnchor: 'middle' }} fill="grey" text="CALLS" opacity="0.2" />
            <ChartsText key='puts' x="75%" y="5%" style={{ textAnchor: 'middle' }} fill="grey" text="PUTS" opacity="0.2" />
            <ChartsText key='ghurl' x="100%" y="85%" fill="grey" text={ghUrl} opacity="0.15" style={{ textAnchor: 'end' }} fontSize={10} />
            {
                (strikes.length > 0 && !isLoading && strikes.includes(yaxisline)) && <>
                    <ChartsReferenceLine key='ref-line' x={0} />
                    <ChartsReferenceLine key='spot-price' y={yaxisline} label={"SPOT PRICE: $" + (spotPrice.toFixed(2))}
                        labelAlign="start"
                        lineStyle={{ strokeDasharray: '4', color: 'red', stroke: 'red' }}
                        labelStyle={{ stroke: 'red', strokeWidth: 0.25, fontSize: '10px' }} />
                </>
            }

            {
                exposureType == DexGexType.GEX && <CallPutWallLine key='call-put-wall' strikes={strikes}
                    callWall={Number(callWall)}
                    putWall={Number(putWall)}
                    spotPriceLineValue={yaxisline}
                    volTrigger={Number(volTrigger)}
                    gammaWall={Number(gammaWall)} />
            }

            {/* <EmaIndicatorLine strikes={strikes} emaData={emaData} /> */}
        </BarChart>}
    </Box>
}

const transpose = (matrix: number[][]): number[][] => {
    if (!matrix?.length || !matrix[0]?.length) return [];

    return matrix[0].map((_, colIndex) =>
        matrix.map(row => row[colIndex])
    );
};


export const GexHeatmapChart = (props: { exposureData: ExposureDataType, skipAnimation?: boolean, symbol: string, exposureType: DexGexType, spotPriceLineValue: number }) => {
    const { exposureData, spotPriceLineValue } = props;
    const { expirations, strikes, items } = exposureData;
    const yAxisLabels = strikes.toReversed().map(k => k.toString());
    const data = transpose(items.map(k => k.data.toReversed()));
    const flattenedData = data.flat().map(k => Math.abs(k));

    //may be we can optimize this
    const percentileIxMap = new Map<number, {
        p99: number,
        p95: number,
        p90: number,
        p80: number,
        p70: number,
        p60: number,
        p50: number,
        p40: number,
        p30: number,
    }>();

    items.forEach(({ data: v }, ix) => {

        percentileIxMap.set(ix, {
            p99: percentile(v, 99),
            p95: percentile(v, 95),
            p90: percentile(v, 90),
            p80: percentile(v, 80),
            p70: percentile(v, 70),
            p60: percentile(v, 60),
            p50: percentile(v, 50),
            p40: percentile(v, 40),
            p30: percentile(v, 30)
        });
    });

    const colorScale = (v: GetColorProps) => {
        const { value, colIndex, rowIndex } = v;
        const negativeMultiplier = value < 0 ? -1 : 1;
        const absValue = Math.abs(value);
        const pix = percentileIxMap.get(colIndex);
        if (!pix) return '';

        const { p99, p95, p70, p80, p90, p60, p50, p30 } = pix;
        if (value == 0) return '';
        switch (true) {
            case absValue >= p99:
                return getColor(700 * negativeMultiplier);
            case absValue >= p95:
                return getColor(600 * negativeMultiplier);
            case absValue >= p80:
                return getColor(500 * negativeMultiplier);
            case absValue >= p60:
                return getColor(400 * negativeMultiplier);
            case absValue >= p30:
                return getColor(300 * negativeMultiplier);
        }
        return getColor(300 * negativeMultiplier);
    }

    return <Box pb={1}><HeatMap data={data}
        yLabels={yAxisLabels}
        xLabels={expirations.map(k=> k.substring(5))} 
        formatter="currency"
        zeroHeaderLabel=""
        useMinMaxValuesForColorScale={true}
        columnWidth={80}
        displayZeroValues={false}
        highlightRowIndex={yAxisLabels.indexOf(spotPriceLineValue.toString())}
        getColorCallback={colorScale}
    />
        <Typography align="center">Showing gamma exposure heatmap for each expiration</Typography>
    </Box>
}

export const MemoizedGreeksExposureChart = memo(GreeksExposureChart);