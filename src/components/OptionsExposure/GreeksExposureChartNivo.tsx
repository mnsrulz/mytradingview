import { getColorPallete } from "@/lib/color";
import { humanAbsCurrencyFormatter } from "@/lib/formatters";
import { DexGexType, ExposureDataType } from "@/lib/types";
import { calculateChartHeight, calculateYAxisTickWidth } from "@/lib/utils";
import { Box, LinearProgress, Typography, useMediaQuery, useTheme } from "@mui/material";
import { BarChart, ChartsText, ChartsReferenceLine } from "@mui/x-charts"
import { memo, useContext, useMemo } from "react";
import { CallPutWallLine } from "./CallPutWallLine";
import { ExposureChartLegend } from "./ExposureChartLegend";
import { SpotPriceLine } from "./SpotPriceLine";
import { LoadingOverlay } from "./LoadingOverlay";
import { useBarSeries, useAnimateLine } from '@mui/x-charts/hooks'
import { BarLegendProps, ResponsiveBar, ResponsiveBarCanvas } from '@nivo/bar'
import { CartesianMarkerProps, DatumValue } from "@nivo/core";
import { getLegends, getMarkers, getTheme } from "./utils";
import { ThemeContext } from "@emotion/react";

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

export const GreeksExposureChartNivo = (props: { exposureData: ExposureDataType, skipAnimation?: boolean, symbol: string, isLoading: boolean, darkMode: boolean }) => {
    console.log(`rendering GreeksExposureChart`)
    const { symbol, exposureData, skipAnimation, isLoading, darkMode } = props;
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    // debugger;
    // const emaData = { "ema21d": 73.311932116876, "ema9d": 71.9165385595376 }
    const { nivoItems, maxPosition, exposureType } = exposureData;
    const { colors, gammaOrDelta, height, keys, leftMarginValue, spotPriceLine, title, markers, legends } = useMemo(() => {
        const { strikes, exposureType, dte, expirations, spotPrice, callWall, putWall } = exposureData;
        const gammaOrDelta = GreeksChartLabelMapping[exposureType];
        const spotPriceLine = Math.max(...strikes.filter(j => j <= spotPrice));
        const colors = expirations.reduce((pv, cv, ix) => {
            pv[`call_${cv}`] = colorCodes[ix]
            pv[`put_${cv}`] = colorCodes[ix]
            return pv;
        }, {} as Record<string, string>);
        const keys = Object.keys(colors);
        const markers = getMarkers({ spotPrice, exposureType, spotPriceLine, callWall: Number(callWall), putWall: Number(putWall) });
        return {
            height: calculateChartHeight(expirations, strikes),
            spotPriceLine: Math.max(...strikes.filter(j => j <= spotPrice)),
            leftMarginValue: calculateYAxisTickWidth(Math.max(...strikes)),
            gammaOrDelta,
            title: `$${symbol.toUpperCase()} ${gammaOrDelta} (${dte == -1 ? 'Custom' : dte} DTE)`,
            colors,
            keys,
            markers,
            legends: getLegends(expirations) as BarLegendProps[]
        }
    }, [exposureData, symbol])

    const { rightMargin, legendPosition } = isSmallScreen ? { rightMargin: 0, legendPosition: 'top-right' } : { rightMargin: 100, legendPosition: 'top-right' }

    return <div style={{ height: height }}>
        <ResponsiveBar
            theme={getTheme(darkMode)}
            data={nivoItems}
            keys={keys}
            indexBy="strike"
            layout="horizontal"
            reverse={true}
            margin={{ top: 40, right: rightMargin, bottom: 50, left: leftMarginValue + 8 }}
            valueScale={{ type: 'linear', min: -maxPosition * 1.1, max: maxPosition * 1.1 }}
            indexScale={{ type: 'band', round: true }}
            colors={({ id }) => colors[id]}
            borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: gammaOrDelta,
                legendPosition: 'middle',
                legendOffset: 40,
                format: v => xAxixFormatter(exposureType, v)
            }}
            axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                format: (tick) => `$${Number(tick).toFixed(2)}`
            }}
            enableGridX={false}
            enableGridY={false}
            enableLabel={false}
            // labelSkipWidth={12}
            // labelSkipHeight={12}
            // labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
            animate={!skipAnimation}
            markers={markers}
            legends={legends}
        />
    </div>


    // return <Box sx={{ m: 1 }} minHeight={400}>
    //     <Typography variant={isSmallScreen ? "subtitle1" : "h6"} align="center">{title}</Typography>
    //     <BarChart
    //         loading={isLoading}
    //         skipAnimation={skipAnimation}
    //         height={height}
    //         margin={{ right: 0, left: 0 }}
    //         // tooltip={{
    //         //     trigger: 'none'
    //         // }}            
    //         series={series}
    //         yAxis={[{
    //             data: strikes,
    //             scaleType: 'band',
    //             // label: 'Strikes',
    //             reverse: true,
    //             //valueFormatter: (tick) => `$${Number(tick).toFixed(2)}`,
    //             width: leftMarginValue
    //         }]}
    //         xAxis={[{
    //             min: -maxPosition * 1.1,
    //             max: maxPosition * 1.1,
    //             reverse: true,
    //             label: `${gammaOrDelta}`,
    //             barGapRatio: 0.1,
    //             //valueFormatter: (v: number) => xAxixFormatter(exposureType, v)
    //         }]}
    //         layout="horizontal"
    //         slots={{
    //             //loadingOverlay: LoadingOverlay
    //             legend: () => <ExposureChartLegend expirations={expirations} showLegendOnTop={isSmallScreen} />
    //         }}
    //         hideLegend
    //         slotProps={{
    //             tooltip: {
    //                 trigger: 'none'
    //             },
    //             legend: {
    //                 direction: isSmallScreen ? 'horizontal' : 'vertical',
    //                 position: {
    //                     vertical: 'top',
    //                     horizontal: 'end'
    //                 }
    //             }
    //         }}
    //     >
    //         <ChartsText x="25%" y="5%" style={{ textAnchor: 'middle' }} fill="grey" text="CALLS" opacity="0.2" />
    //         <ChartsText x="75%" y="5%" style={{ textAnchor: 'middle' }} fill="grey" text="PUTS" opacity="0.2" />
    //         <ChartsText x="100%" y="85%" fill="grey" text={ghUrl} opacity="0.15" style={{ textAnchor: 'end' }} fontSize={10} />
    //         {/* {series.length > 0 && <ChartsReferenceLine x={0} />} */}
    //         {series.length > 0 && <SpotPriceLine spotPriceLineValue={yaxisline} spotPrice={spotPrice} />}

    //         {
    //             exposureType == DexGexType.GEX && <CallPutWallLine callWall={Number(callWall)} putWall={Number(putWall)} spotPriceLineValue={yaxisline} />
    //         }

    //         {/* <EmaIndicatorLine strikes={strikes} emaData={emaData} /> */}
    //     </BarChart>
    // </Box>
}

export const MemoizedGreeksExposureChartNivo = memo(GreeksExposureChartNivo);