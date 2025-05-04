import { ChartsReferenceLine } from "@mui/x-charts/ChartsReferenceLine";

export const EmaIndicatorLine = (props: { strikes: number[]; emaData?: { ema21d: number; ema9d: number; }; }) => {
    const { emaData, strikes } = props;
    if (!emaData) return;

    const yAxisEma9dLine = Math.max(...strikes.filter(j => j <= emaData.ema9d));
    const yAxisEma21dLine = Math.max(...strikes.filter(j => j <= emaData.ema21d));

    return <>
        <ChartsReferenceLine y={yAxisEma9dLine} label={"9D EMA"}
            labelAlign="end"
            lineStyle={{ strokeDasharray: '2', color: 'red', stroke: 'red' }}
            labelStyle={{ stroke: 'red', strokeWidth: 0.25, fontSize: '8px' }} />
        <ChartsReferenceLine y={yAxisEma21dLine} label={"21D EMA"}
            labelAlign="end"
            lineStyle={{ strokeDasharray: '2', color: 'blue', stroke: 'blue' }}
            labelStyle={{ stroke: 'blue', strokeWidth: 0.25, fontSize: '8px' }} />
    </>;
};
