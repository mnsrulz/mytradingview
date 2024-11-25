import UplotReact from 'uplot-react';
import 'uplot/dist/uPlot.min.css';

export const OptionSpreadPricingTimeSeriesChart = (props: { data: any }) => {
    const { data } = props;

    let series = [{},
    {
        label: 'Option strategy pricing',
        stroke: '#007bff'
    }]
    const opts = {
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
        series: series,
    };
    return <UplotReact options={opts} data={data} />

}
