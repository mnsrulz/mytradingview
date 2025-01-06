import { blue, brown, deepOrange, green } from '@mui/material/colors';
import UplotReact from 'uplot-react';
import 'uplot/dist/uPlot.min.css';

const strokes = [deepOrange[900], green[900], blue[900], brown[900]]

export const OptionSpreadPricingTimeSeriesChart = (props: { strategies: string[], data: any }) => {
    const { data, strategies } = props;

    let series = [{},
    ...strategies.map((j, ix) => ({ label: j, stroke: strokes[ix] }))
        // {
        //     label: 'Option strategy pricing',
        //     stroke: '#007bff'
        // }
    ]
    return <UplotReact options={{
        width: 1640,
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

}
