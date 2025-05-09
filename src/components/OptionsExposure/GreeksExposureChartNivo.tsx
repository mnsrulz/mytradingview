import { getColorPallete } from "@/lib/color";
import { humanAbsCurrencyFormatter } from "@/lib/formatters";
import { DexGexType, ExposureDataType } from "@/lib/types";
import { calculateChartHeight, calculateYAxisTickWidth } from "@/lib/utils";
import { Box, LinearProgress, Typography, useMediaQuery, useTheme } from "@mui/material";
import { BarChart, ChartsText, ChartsReferenceLine } from "@mui/x-charts"
import { useMemo } from "react";
import { CallPutWallLine } from "./CallPutWallLine";
import { ExposureChartLegend } from "./ExposureChartLegend";
import { SpotPriceLine } from "./SpotPriceLine";
import { LoadingOverlay } from "./LoadingOverlay";
import { useBarSeries, useAnimateLine } from '@mui/x-charts/hooks'
import { ResponsiveBar } from '@nivo/bar'
import { CartesianMarkerProps, DatumValue } from "@nivo/core";
import { getMarkers } from "./utils";

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

export const GreeksExposureChartNivo = (props: { exposureData?: ExposureDataType, skipAnimation?: boolean, symbol: string, isLoading: boolean, hasData: boolean, hasError: boolean }) => {
    console.log(`rendering GreeksExposureChart`)
    const { symbol, exposureData, skipAnimation, isLoading, hasData, hasError } = props;
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const series = useMemo(() => exposureData?.items?.map((j, ix) => {
        return { data: j.data, stack: 'A', color: colorCodes[exposureData.expirations.indexOf(j.expiration)], label: j.expiration, type: 'bar' as const, labelMarkType: 'line' as const }
    }) || [], [exposureData]);

    if (!exposureData)   //keep it loading only if there's no data to display. Otherwise the mui charts loading indicator is enough
        return <Box sx={{ m: 1 }} minHeight={400}>
            <LinearProgress />
        </Box>
    else if (hasError)
        return <i>Error occurred! Please try again...</i>

    const { strikes, exposureType, dte, expirations, items, nivoItems, maxPosition, spotPrice, callWall, putWall } = exposureData;
    // debugger;
    // const emaData = { "ema21d": 73.311932116876, "ema9d": 71.9165385595376 }
    const height = calculateChartHeight(expirations, strikes);
    const spotPriceLine = Math.max(...strikes.filter(j => j <= spotPrice));
    const maxStrike = Math.max(...strikes);
    const leftMarginValue = calculateYAxisTickWidth(maxStrike);
    const gammaOrDelta = GreeksChartLabelMapping[exposureType]
    const title = `$${symbol.toUpperCase()} ${gammaOrDelta} (${dte == -1 ? 'Custom' : dte} DTE)`;

    const colors = expirations.reduce((pv, cv, ix) => {
        pv[`call_${cv}`] = colorCodes[ix]
        pv[`put_${cv}`] = colorCodes[ix]
        return pv;
    }, {} as Record<string, string>);
    const keys = Object.keys(colors);

    const { rightMargin, legendPosition } = isSmallScreen ? { rightMargin: 0, legendPosition: 'top-right' } : { rightMargin: 100, legendPosition: 'top-right' }

    const markers = getMarkers({ spotPrice, exposureType, spotPriceLine, callWall, putWall });

    return <div style={{ height: height }}>
        <ResponsiveBar
            theme={{

            }}
            data={nivoItems}
            keys={keys}
            indexBy="strike"
            layout="horizontal"
            reverse={true}
            margin={{ top: 40, right: rightMargin, bottom: 50, left: leftMarginValue }}
            padding={0.3}
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
            enableLabel={false}
            // labelSkipWidth={12}
            // labelSkipHeight={12}
            // labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
            animate={!skipAnimation}
            motionConfig="stiff"
            markers={markers}
            legends={[
                {
                    dataFrom: 'keys',
                    data: expirations.map(k => ({ label: k, color: colorCodes[expirations.indexOf(k)], id: k })),
                    anchor: 'top-right',
                    direction: 'column',
                    justify: false,
                    translateX: 80,
                    itemWidth: 80,
                    itemHeight: 20,
                    itemsSpacing: 2,
                    symbolSize: 20,
                    effects: [
                        {
                            on: 'hover',
                            style: {
                                itemOpacity: 1,
                            },
                        },
                    ],
                },
            ]}
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