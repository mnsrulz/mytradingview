import { Dialog, DialogContent, DialogActions, Button, Typography, LinearProgress } from "@mui/material";
import { BarChart } from '@mui/x-charts/BarChart';
import { axisClasses } from '@mui/x-charts';
import { useDeltaHedging } from "@/lib/socket";

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

const uData = [-900, -100, 4000, 3000, 2000, 2780, 1890, 2390, 3490];
const pData = [1000, -900, 2400, 1398, -9800, 3908, 4800, -3800, 4300];

// const xLabels = [
//     '$50',
//     '$70',
//     '$85',
//     '$90',
//     '$100',
//     '$105',
//     '$120',
//     '$200',
//     '$210',
// ];

export const DeltaHeding = (props: ITickerProps) => {
    const { onClose } = props;
    // const rrs = await fetch('')
    const { data, isLoading } = useDeltaHedging(props.symbol);

    if (isLoading) return <LinearProgress />;
    if (!data) return <div>No data to show!!!</div>;

    const xLabels = Object.keys(data.data);

    return (
        <Dialog fullWidth={true} fullScreen={true} open={true} onClose={onClose} aria-labelledby="delta-hedging-dialog">
            <DialogContent>
                I am in delta hedging...
                <Typography variant="h5" align="center" gutterBottom>
                    $BABA ABS Delta Hedging Exposure (50 DTE)
                </Typography>
                {/* <BarChart
                    xAxis={[{ dataKey: 'strike', label: 'Strike', type: 'number' }]}
                    yAxis={[{ label: 'Delta Hedging Exposure', type: 'number' }]}
                    width={800}
                    height={500}
                >
                    <BarSeries dataKey="exposure" data={data} />
                </BarChart> 
                
                [

                {
                    v: 100
                }
                ]
                
                */}



                <BarChart
                    // width={500}
                    // height={300}
                    series={[
                        {
                            data: pData,
                            label: '2024-08-16',
                            stack: 'tol'
                        },
                        {
                            data: uData,
                            label: '2024-09-19',
                            stack: 'tol'
                        },
                        {
                            data: uData,
                            label: '2024-10-10',
                            stack: 'tol'
                        },
                    ]}
                    yAxis={[
                        {
                            data: xLabels,
                            scaleType: 'band',
                        },
                    ]}
                    // yAxis={[{ max: 10000 }]}
                    layout="horizontal"
                />

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