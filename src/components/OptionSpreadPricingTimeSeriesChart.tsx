import { Box, Skeleton } from '@mui/material';
import { blue, brown, deepOrange, green } from '@mui/material/colors';
import UplotReact from 'uplot-react';
import 'uplot/dist/uPlot.min.css';
import { useResizeDetector } from 'react-resize-detector';
const strokes = [deepOrange[900], green[900], blue[900], brown[900]]

const hasData = (data: any) => {
    return (Array.isArray(data) && data.length > 0 && data[0].length > 0);
}

export const OptionSpreadPricingTimeSeriesChart = (props: { legends: string[], data: any, loading: boolean }) => {
    const { data, legends: strategies, loading } = props;
    const { width, height, ref } = useResizeDetector();
    let series = [{}, ...strategies.map((j, ix) => ({ label: j, stroke: strokes[ix] }))]

    if (loading || !hasData(data)) return <Skeleton variant="rectangular" width={width || 800} height={400} />

    return <Box ref={ref}>
        <UplotReact
            options={{
                width: width || 800,
                height: 400,
                cursor: {
                    sync: {
                        key: 'moo',
                    },
                },
                scales: {
                    x: {
                        distr: 2,
                        time: true,
                    },
                },
                series: series
            }} data={data} />
    </Box>
}
