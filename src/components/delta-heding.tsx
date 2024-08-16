import { Dialog, DialogContent, DialogActions, Button, Typography, LinearProgress, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { BarChart } from '@mui/x-charts/BarChart';
import { ChartsReferenceLine } from '@mui/x-charts';
import { useDeltaHedging } from "@/lib/socket";
import { useState } from "react";

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

const colorCodes = ['#ae6867',
    '#dd8f77',
    '#fab079',
    '#f6b17f',
    '#ece990',
    '#94ab5e',
    '#d7f888',
    '#519693',
    '#7be3de',
    '#8eb8f0',
    '#7d7283',
    '#c5b4cf',
    '#f2ddff'
];
export const DeltaHeding = (props: ITickerProps) => {
    const { onClose } = props;
    const [dte, setDte] = useState(50);
    const [strikeCounts, setStrikesCount] = useState(30);
    const { data, isLoading } = useDeltaHedging(props.symbol, dte, strikeCounts);

    if (isLoading) return <LinearProgress />;
    if (!data) return <div>No data to show!!!</div>;
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
    return (
        <Dialog fullWidth={true} fullScreen={true} open={true} onClose={onClose} aria-labelledby="delta-hedging-dialog">
            <DialogContent>
                <Typography variant="h5" align="center" gutterBottom>
                    ${props.symbol.toUpperCase()} ABS Delta Hedging Exposure ({dte} DTE)
                </Typography>
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

                <BarChart
                    // width={960}
                    height={height}
                    dataset={data.dataset}
                    series={series}
                    tooltip={{
                        trigger: 'none'
                    }}
                    // grid={
                    //     {
                    //         vertical: true,
                    //         horizontal: true
                    //     }
                    // }
                    yAxis={[
                        {
                            // data: xLabels,
                            label: 'Strike',

                            dataKey: 'strike',
                            scaleType: 'band',
                            reverse: true
                        },
                    ]}
                    // yAxis={[{ max: 10000 }]}
                    layout="horizontal"
                    xAxis={
                        [
                            {
                                label: 'Delta Hedging Exposure',
                                scaleType: 'linear',
                                // tickNumber: 5,
                                // tickMinStep: 100000,

                                min: -data.maxPosition,
                                max: data.maxPosition,

                                valueFormatter: (tick) => {
                                    tick = Math.abs(tick);
                                    if (tick >= 1000000) {
                                        return `${(tick / 1000000).toFixed(1)}M`; // Millions
                                    } else if (tick >= 1000) {
                                        return `${(tick / 1000).toFixed(1)}K`; // Thousands
                                    }
                                    return `${tick}`;
                                }
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
                            // hidden: true,
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
                </BarChart>

                {/* <BarChart
                    width={600}
                    height={300}
                    layout="horizontal"

                    series={[
                        { ...seriesA, stack: 'total' },
                        { ...seriesB, stack: 'total' },
                        { ...seriesC, stack: 'total' },
                    ]}
                /> */}
                {/* <Grid container >
                    <Grid item xs={6}>
                        <Typography color="text.secondary" gutterBottom>
                            Current Stock Price
                        </Typography>
                        <Typography variant="h5">
                            {currentPrice}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography color="text.secondary" gutterBottom>
                            Put Call Ratio
                        </Typography>
                        <Typography variant="h5">
                            {pcr.toFixed(2)} {sentiment}
                        </Typography>
                    </Grid>
                </Grid>
                <BarChart
                    dataset={dataset}
                    xAxis={[{
                        scaleType: 'band',
                        dataKey: 'strike',
                        disableTicks: true,
                    }]}
                    series={[
                        { dataKey: 'p', label: 'Put', valueFormatter },
                        { dataKey: 'c', label: 'Calls', valueFormatter }
                    ]}
                    {...chartSetting}
                /> */}
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={onClose} color="secondary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};