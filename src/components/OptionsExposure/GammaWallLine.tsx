import { ChartsReferenceLine } from "@mui/x-charts/ChartsReferenceLine";

export const GammaWallLine = (props: { strikes: number[], gammaWall: number; spotPriceLineValue: number; }) => {
    const { gammaWall, spotPriceLineValue, strikes } = props;
    // debugger;
    if (gammaWall == 0) return <></>;
    if (strikes.includes(gammaWall)) {
        return <ChartsReferenceLine y={Number(gammaWall)} label={"GAMMA WALL: $" + (gammaWall)}
            labelAlign={spotPriceLineValue == gammaWall ? "end" : "start"}
            lineStyle={{ strokeDasharray: '8', color: 'gray', stroke: 'gray' }}
            labelStyle={{ stroke: 'gray', strokeWidth: 0.25, fontSize: '8px' }} />;
    }
    return <></>; //if gamma wall is not on a strike, don't show anything
};
