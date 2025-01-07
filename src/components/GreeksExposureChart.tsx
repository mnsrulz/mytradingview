import { getColorPallete } from "@/lib/color";
import { humanAbsCurrencyFormatter } from "@/lib/formatters";
import { ExposureDataType } from "@/lib/hooks";
import { DexGexType } from "@/lib/types";
import { calculateChartHeight, calculateLeftMargin } from "@/lib/utils";
import { Box, Typography } from "@mui/material";
import { BarChart, ChartsText, ChartsReferenceLine } from "@mui/x-charts"
const ghUrl = process.env.GH_REPO_URL || 'github.com/mnsrulz/mytradingview';
const colorCodes = getColorPallete();

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

export const GreeksExposureChart = (props: { exposureData: ExposureDataType, skipAnimation?: boolean, symbol: string, dte: number, exposureType: DexGexType }) => {
    const { symbol, exposureType, dte, exposureData, skipAnimation } = props;
    const { strikes, expirations, items, maxPosition, spotPrice } = exposureData;
    const height = calculateChartHeight(expirations, strikes);
    const yaxisline = Math.max(...strikes.filter(j => j <= spotPrice));
    const maxStrike = Math.max(...strikes);
    const leftMarginValue = calculateLeftMargin(maxStrike);
    const gammaOrDelta = GreeksChartLabelMapping[exposureType]
    const title = `$${symbol.toUpperCase()} ${gammaOrDelta} (${dte} DTE)`;
    return <Box>
        <Typography variant="h6" align="center">{title}</Typography>
        <BarChart
            // loading={!isLoaded}
            skipAnimation={skipAnimation}
            height={height}
            margin={{ left: leftMarginValue, right: 0 }}
            tooltip={{
                trigger: 'none'
            }}
            series={items.map((j, ix) => {
                return { data: j.data, stack: 'A', color: colorCodes[expirations.indexOf(j.expiration)] }
            })}
            yAxis={[{
                data: strikes,
                scaleType: 'band',
                // label: 'Strikes',
                reverse: true,
                valueFormatter: (tick) => `$${Number(tick).toFixed(2)}`
            }]}
            xAxis={[{
                min: -maxPosition * 1.1,
                max: maxPosition * 1.1,
                reverse: true,
                label: `${gammaOrDelta}`,
                valueFormatter: (v: number) => xAxixFormatter(props.exposureType, v)
            }]}
            layout="horizontal"
            slotProps={{
                legend: {
                    seriesToDisplay: expirations.map(j => {
                        return {
                            id: j,
                            color: colorCodes[expirations.indexOf(j)],
                            label: j
                        }
                    }),
                    direction: 'column',
                    position: {
                        vertical: 'top',
                        horizontal: 'right',
                    },
                    labelStyle: {
                        fontSize: '0.75rem'
                    },
                    itemMarkWidth: 24,
                    itemMarkHeight: 8,
                    markGap: 2,
                    itemGap: 2,
                }
            }}
        >
            <ChartsText x="25%" y="5%" style={{ textAnchor: 'middle' }} fill="grey" text="CALLS" opacity="0.2" />
            <ChartsText x="75%" y="5%" style={{ textAnchor: 'middle' }} fill="grey" text="PUTS" opacity="0.2" />
            <ChartsText x="100%" y="85%" fill="grey" text={ghUrl} opacity="0.15" style={{ textAnchor: 'end' }} fontSize={10} />
            <ChartsReferenceLine x={0} />
            <ChartsReferenceLine y={yaxisline} label={"SPOT PRICE: $" + (spotPrice.toFixed(2))}
                labelAlign="start"
                lineStyle={{
                    strokeDasharray: '4',
                    color: 'red',
                    stroke: 'red'
                }}
                labelStyle={
                    {
                        stroke: 'red',
                        strokeWidth: 0.25,
                        fontSize: '8px'
                    }
                } />
        </BarChart>
    </Box>
}