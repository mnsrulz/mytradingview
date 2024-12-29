import { Typography, Box } from "@mui/material";
import { BarChart } from '@mui/x-charts/BarChart';
import { ChartsReferenceLine, ChartsText } from '@mui/x-charts';
import { OptionsHedgingData } from "@/lib/hooks";
import { getColorPallete } from "@/lib/color";
import { humanAbsCurrencyFormatter } from "@/lib/formatters";
const ghUrl = process.env.GH_REPO_URL || 'github.com/mnsrulz/mytradingview';
type OptionsDatasetType = "dex" | "gex" | "oi" | "volume"
interface IExpo {
    data: OptionsHedgingData,
    exposure: OptionsDatasetType,
    symbol: string,
    dte: number,
    skipAnimation?: boolean
}

const colorCodes = getColorPallete();

export const typeMap = {
    'DEX': 'dex' as OptionsDatasetType,
    'GEX': 'gex' as OptionsDatasetType,
    'OI': 'oi' as OptionsDatasetType,
    'VOLUME': 'volume' as OptionsDatasetType
}


const calculateLeftMargin = (maxStrikeValue: number) => {
    if (maxStrikeValue < 100) {
        return 48
    } else if (maxStrikeValue < 1000) {
        return 56
    }
    return 64
}

const xAxixFormatter = (datasetType: OptionsDatasetType, v: number) => {
    if (datasetType == 'gex' && v > 0) {
        return `-${humanAbsCurrencyFormatter(v)}`;
    }
    return humanAbsCurrencyFormatter(v);
}

export const Expo = (props: IExpo) => {
    const { data, dte, symbol, skipAnimation } = props;
    // const height = (data.strikes.length < 10 ? 100 : 0) + data.strikes.length * 15;
    /*
    some wierd calculation since there's no straight forward way to set the height of the bars. 
    So 5px for both of the top and bottom margins, and 15px for each bar. Along with 20px for each expirations legends with max of 3 expirations.
    */
    const bufferHeight = 10 + 40 + ((data.expirations.length > 3 ? 3 : data.expirations.length) * 20);
    const height = bufferHeight + (data.strikes.length * 15);
    const yaxisline = Math.max(...data.strikes.filter(j => j <= data.currentPrice));
    const maxStrike = Math.max(...data.strikes);
    const leftMarginValue = calculateLeftMargin(maxStrike);
    const series = data.expirations.flatMap(j => {
        return [{
            dataKey: `${j}-call`, label: `${j}`, barSize: 20, stack: `stack`, color: colorCodes[data.expirations.indexOf(j)]
        },
        {
            dataKey: `${j}-put`, label: `${j}`, barSize: 20, stack: `stack`, color: colorCodes[data.expirations.indexOf(j)]
        }]
    });
    const isGex = props.exposure == 'gex' ? true : false;

    const fn = () => {
        switch (props.exposure) {
            case 'dex':
                return {
                    gammaOrDelta: 'ABS Delta Exposure',
                    ds: data.deltaDataset
                }
            case 'gex':
                return {
                    gammaOrDelta: 'NET Gamma Exposure',
                    ds: data.gammaDataset
                }

            case 'oi':
                return {
                    gammaOrDelta: 'Open interest',
                    ds: data.oiDataset
                }
            case 'volume':
                return {
                    gammaOrDelta: 'Volume',
                    ds: data.volumeDataset
                }
        }
    }

    // const gammaOrDelta = (props.exposure == 'dex' ? 'ABS Delta' : 'NET Gamma');
    // const { dataset, maxPosition } = props.exposure == 'dex' ? data.deltaDataset : data.gammaDataset;
    const { gammaOrDelta, ds } = fn();
    const { dataset, maxPosition } = ds;

    const title = `$${symbol.toUpperCase()} ${gammaOrDelta} (${dte} DTE)`;
    return <Box><Typography variant="h6" align="center">
        {title}
    </Typography><BarChart
        height={height}
        dataset={dataset}
        series={series}
        skipAnimation={skipAnimation}
        tooltip={{
            trigger: 'none'
        }}
        margin={{ left: leftMarginValue, right: 0 }}
        yAxis={[
            {
                dataKey: 'strike',
                scaleType: 'band',
                reverse: true,
                valueFormatter: (tick) => `$${Number(tick).toFixed(2)}`
            },
        ]}
        layout="horizontal"
        xAxis={
            [
                {
                    label: `${gammaOrDelta}`,
                    scaleType: 'linear',
                    min: -maxPosition * 1.05,  //5% extra to allow some spacing
                    max: maxPosition * 1.05,
                    valueFormatter: (v: number) => xAxixFormatter(props.exposure, v)// (v) => (isGex && v > 0) ? `-${humanAbsCurrencyFormatter(v)}` : humanAbsCurrencyFormatter(v) //in case of net gex, the values on right should have negative ticks
                }
            ]
        }

        slotProps={{
            legend: {
                seriesToDisplay: data.expirations.map(j => {
                    return {
                        id: j,
                        color: colorCodes[data.expirations.indexOf(j)],
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
        }}>
            <ChartsText x="25%" y="5%" style={{ textAnchor: 'middle' }} fill="grey" text="CALLS" opacity="0.2" />
            <ChartsText x="75%" y="5%" style={{ textAnchor: 'middle' }} fill="grey" text="PUTS" opacity="0.2" />
            <ChartsText x="100%" y="85%" fill="grey" text={ghUrl} opacity="0.15" style={{ textAnchor: 'end' }} fontSize={10} />

            <ChartsReferenceLine x={0} />
            <ChartsReferenceLine y={yaxisline} label={"SPOT PRICE: $" + data.currentPrice}
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
        </BarChart></Box>
}