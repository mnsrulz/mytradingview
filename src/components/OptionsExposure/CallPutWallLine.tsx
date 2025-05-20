import { ChartsReferenceLine } from "@mui/x-charts/ChartsReferenceLine";

export const CallPutWallLine = (props: { callWall: number; putWall: number; spotPriceLineValue: number; }) => {
    const { callWall, putWall, spotPriceLineValue } = props;
    // debugger;
    if (callWall == 0 && putWall == 0) return <></>;
    if (callWall == putWall) {
        return <ChartsReferenceLine y={Number(callWall)} label={"WALL: $" + (callWall)}
            labelAlign={spotPriceLineValue == callWall ? "end" : "start"}
            lineStyle={{ strokeDasharray: '4', color: 'violet', stroke: 'violet' }}
            labelStyle={{ stroke: 'violet', strokeWidth: 0.25, fontSize: '8px' }} />;
    }
    return <>
        <ChartsReferenceLine y={Number(callWall)} label={"CALL WALL: $" + (callWall)}
            labelAlign={spotPriceLineValue == callWall ? "end" : "start"}
            lineStyle={{ strokeDasharray: '4', color: 'green', stroke: 'green' }}
            labelStyle={{ stroke: 'green', strokeWidth: 0.25, fontSize: '8px' }} />

        <ChartsReferenceLine y={Number(putWall)} label={"PUT WALL: $" + (putWall)}
            labelAlign={spotPriceLineValue == putWall ? "end" : "start"}
            lineStyle={{ strokeDasharray: '4', color: 'orange', stroke: 'orange' }}
            labelStyle={{ stroke: 'orange', strokeWidth: 0.25, fontSize: '8px' }} />
    </>;
};
