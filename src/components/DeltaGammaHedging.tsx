import { Dialog, DialogContent, DialogActions, Button, Typography, LinearProgress, FormControl, InputLabel, MenuItem, Select, Tab, Tabs, Paper, CircularProgress, Box } from "@mui/material";
import { BarChart } from '@mui/x-charts/BarChart';
import { axisClasses, ChartsReferenceLine } from '@mui/x-charts';
import { OptionsHedgingData, useDeltaGammaHedging } from "@/lib/socket";
import { useState } from "react";
import { getColorPallete } from "@/lib/color";
import { currencyFormatter, fixedCurrencyFormatter, humanAbsCurrencyFormatter } from "@/lib/formatters";

interface ITickerProps {
    symbol: string,
    onClose: () => void
}

// const data = [
//     { strike: 67.5, exposure: 200 },
//     { strike: 69.0, exposure: -300 },
//     { strike: 70.5, exposure: 400 },
//     { strike: 72.0, exposure: -150 },
//     { strike: 73.5, exposure: 350 },
//     { strike: 75.0, exposure: -250 },
//     { strike: 76.5, exposure: 100 },
//     { strike: 78.0, exposure: -50 },
//     { strike: 79.5, exposure: 450 },
//     { strike: 81.0, exposure: -100 },
//     { strike: 82.5, exposure: 200 },
// ];

// const seriesA = {
//     data: [2, 3, 1, 4, 5],
//     label: 'Series A',
// };
// const seriesB = {
//     data: [3, 1, 4, 2, 1],
//     label: 'Series B',
// };
// const seriesC = {
//     data: [3, 2, 4, 5, 1],
//     label: 'Series C',
// };

// const valueFormatter = (value: number | null) => `${value}`;
// const chartSetting = {
//     yAxis: [
//         {
//             label: 'Open interest',
//         },
//     ],
//     // width: 500,
//     colors: ['red', 'green'],
//     height: 500,
//     sx: {
//         [`.${axisClasses.left} .${axisClasses.label}`]: {
//             //transform: 'translate(-20px, 0)',
//         },
//     },
// };


/*












*/

// const colorCodes = [
//     '#a32020',
//     '#e0301e',
//     '#eb8c00',
//     '#dc6900',

//     '#005073',
//     '#107dac',
//     '#189ad3',
//     '#1ebbd7',
//     '#71c7ec',

//     '#234d20',
//     '#36802d',
//     '#77ab59',
//     '#c9df8a',
//     '#f0f7da',

//     '#bf8bff',
//     '#dabcff'
// ];

//deepOrange
// const colorCodes = [
//     "#A52A2A", "#FF3333", "#FF5733", "#FF8C33", "#FFA07A",
//     "#228B22", "#33FF33", "#8CFF33", "#ADFF33", "#98FB98",
//     "#4169E1", "#3333FF", "#3357FF", "#338CFF", "#87CEFA",
//     "#B8860B", "#FFD700", "#FFEB3B", "#FFFACD", "#FFFFE0"
// ]

const colorCodes = getColorPallete();

interface IExpo {
    data: OptionsHedgingData,
    exposure: 'dex' | 'gex',
    symbol: string,
    dte: number
}

const Expo = (props: IExpo) => {
    const { data, dte, symbol } = props;
    const height = data.strikes.length * 15;
    const yaxisline = Math.max(...data.strikes.filter(j => j <= data.currentPrice));
    const series = data.expirations.flatMap(j => {
        return [{
            dataKey: `${j}-call`, label: `${j}`, stack: `stack`, color: colorCodes[data.expirations.indexOf(j)]
        },
        {
            dataKey: `${j}-put`, label: `${j}`, stack: `stack`, color: colorCodes[data.expirations.indexOf(j)]
        }]
    });
    const gammaOrDelta = (props.exposure == 'dex' ? 'Delta' : 'Gamma')

    const { dataset, maxPosition } = props.exposure == 'dex' ? data.deltaDataset : data.gammaDataset;
    return <Paper><Typography variant="h5" align="center" gutterBottom>
        ${symbol.toUpperCase()} ABS {gammaOrDelta} Hedging Exposure ({dte} DTE)
    </Typography><BarChart
        height={height}
        dataset={dataset}
        series={series}
        tooltip={{
            trigger: 'none'
        }}
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
                    label: `${gammaOrDelta} Hedging Exposure`,
                    scaleType: 'linear',
                    min: -maxPosition * 1.05,  //5% extra to allow some spacing
                    max: maxPosition * 1.05,
                    valueFormatter: humanAbsCurrencyFormatter
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
                itemMarkWidth: 32,
                itemMarkHeight: 12,
                markGap: 5,
                itemGap: 5,
            }
        }}>

            <ChartsReferenceLine x={0} />
            <ChartsReferenceLine y={yaxisline} label={"SPOT PRICE: $" + data.currentPrice}
                labelAlign="start"
                lineStyle={{
                    color: 'red',
                    stroke: 'red'
                }}
                labelStyle={
                    {
                        color: 'red',
                        stroke: 'red'
                    }
                } />
        </BarChart></Paper>
}

export const DeltaGammaHedging = (props: ITickerProps) => {
    const { onClose } = props;
    const [dte, setDte] = useState(50);
    const [strikeCounts, setStrikesCount] = useState(30);
    const { data, isLoading } = useDeltaGammaHedging(props.symbol, dte, strikeCounts);
    const [value, setValue] = useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    // if (isLoading) return <LinearProgress />;
    // if (!data) return <div>No data to show!!!</div>;

    return (
        <Dialog fullWidth={true} fullScreen={true} open={true} onClose={onClose} aria-labelledby="delta-hedging-dialog">
            <DialogContent>
                <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                    <InputLabel>DTE</InputLabel>
                    <Select
                        id="dte"
                        value={dte}
                        label="DTE"
                        onChange={(e) => setDte(e.target.value as number)}
                    >
                        <MenuItem value={30}>30</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                        <MenuItem value={90}>90</MenuItem>
                        <MenuItem value={180}>180</MenuItem>
                        <MenuItem value={400}>400</MenuItem>
                        <MenuItem value={1000}>1000</MenuItem>
                    </Select>
                </FormControl>
                <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                    <InputLabel>Strikes</InputLabel>
                    <Select
                        id="strikes"
                        value={strikeCounts}
                        label="Strikes"
                        onChange={(e) => setStrikesCount(e.target.value as number)}
                    >
                        <MenuItem value={20}>20</MenuItem>
                        <MenuItem value={30}>30</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                        <MenuItem value={80}>80</MenuItem>
                        <MenuItem value={100}>100</MenuItem>
                    </Select>
                </FormControl>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={value}
                        onChange={handleChange}
                        indicatorColor="secondary"
                        textColor="inherit"
                        variant="fullWidth"
                        aria-label="full width tabs example"
                    >
                        <Tab label="Dex"></Tab>
                        <Tab label="Gex"></Tab>
                    </Tabs>
                </Box>
                {
                    isLoading ? <LinearProgress /> : data ? <Expo data={data} exposure={value == 0 ? 'dex' : 'gex'} symbol={props.symbol} dte={dte} /> : <div>no data...</div>
                }
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={onClose} color="secondary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};