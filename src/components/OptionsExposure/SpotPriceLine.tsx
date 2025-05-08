import { ChartsReferenceLine } from "@mui/x-charts"

export const SpotPriceLine = (props: { spotPrice: number, spotPriceLineValue: number }) => {
    const { spotPrice, spotPriceLineValue } = props;

    if (!Number.isFinite(spotPrice) || !Number.isFinite(spotPriceLineValue)) {
        return <></>;
    }

    return <ChartsReferenceLine key='spot-price-line' y={spotPriceLineValue} label={"SPOT PRICE: $" + (spotPrice.toFixed(2))}
        labelAlign="start"
        lineStyle={{ strokeDasharray: '4', color: 'red', stroke: 'red' }}
        labelStyle={{ stroke: 'red', strokeWidth: 0.25, fontSize: '8px' }} />
}