import { getColorPallete } from "@/lib/color";
import { humanAbsCurrencyFormatter } from "@/lib/formatters";
import { ExposureDataType } from "@/lib/hooks";
import { DexGexType } from "@/lib/types";
import { calculateChartHeight, calculateYAxisTickWidth } from "@/lib/utils";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { BarChart, ChartsText, ChartsReferenceLine } from "@mui/x-charts"
import { memo, useMemo } from "react";
import { CallPutWallLine } from "./CallPutWallLine";
import { ExposureChartLegend } from "./ExposureChartLegend";
const colorCodes = getColorPallete();
const ghUrl = process.env.GH_REPO_URL || 'github.com/mnsrulz/mytradingview';

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

export const GreeksExposureChart = (props: { exposureData: ExposureDataType, skipAnimation?: boolean, symbol: string, dte: number, exposureType: DexGexType, isLoading: boolean }) => {
    const { symbol, exposureType, dte, exposureData, skipAnimation, isLoading } = props;
    const { strikes, expirations, items, maxPosition, spotPrice, callWall, putWall } = exposureData;
    // debugger;
    // const emaData = { "ema21d": 73.311932116876, "ema9d": 71.9165385595376 }
    const height = calculateChartHeight(expirations, strikes);
    const yaxisline = strikes.length > 0 ? Math.max(...strikes.filter(j => j <= spotPrice)) : 0;
    const maxStrike = strikes.length > 0 ? Math.max(...strikes) : 0;
    const leftMarginValue = calculateYAxisTickWidth(maxStrike);
    const gammaOrDelta = GreeksChartLabelMapping[exposureType]
    const title = `$${symbol.toUpperCase()} ${gammaOrDelta} (${dte == -1 ? 'Custom' : dte} DTE)`;
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    return <Box>
        <Typography variant={isSmallScreen ? "subtitle1" : "h6"} align="center">{title}</Typography>
        <BarChart
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
                    trigger: 'none'
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
            <ChartsText x="25%" y="5%" style={{ textAnchor: 'middle' }} fill="grey" text="CALLS" opacity="0.2" />
            <ChartsText x="75%" y="5%" style={{ textAnchor: 'middle' }} fill="grey" text="PUTS" opacity="0.2" />
            <ChartsText x="100%" y="85%" fill="grey" text={ghUrl} opacity="0.15" style={{ textAnchor: 'end' }} fontSize={10} />
            {
                (strikes.length > 0 && !isLoading && strikes.includes(yaxisline)) && <>
                    <ChartsReferenceLine x={0} />
                    <ChartsReferenceLine y={yaxisline} label={"SPOT PRICE: $" + (spotPrice.toFixed(2))}
                        labelAlign="start"
                        lineStyle={{ strokeDasharray: '4', color: 'red', stroke: 'red' }}
                        labelStyle={{ stroke: 'red', strokeWidth: 0.25, fontSize: '8px' }} />
                </>
            }

            {
                exposureType == DexGexType.GEX && <CallPutWallLine strikes={strikes} callWall={Number(callWall)} putWall={Number(putWall)} spotPriceLineValue={yaxisline} />
            }

            {/* <EmaIndicatorLine strikes={strikes} emaData={emaData} /> */}
        </BarChart>
    </Box>
}

export const MemoizedGreeksExposureChart = memo(GreeksExposureChart);