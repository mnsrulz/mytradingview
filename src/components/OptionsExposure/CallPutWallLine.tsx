import { ChartsReferenceLine } from "@mui/x-charts/ChartsReferenceLine";

// Use bit flags for wall types
export enum WallType {
    NONE = 0,
    CALL = 1 << 0, // 1
    PUT = 1 << 1,  // 2
    GAMMA = 1 << 2 // 4
}

const GAMMA_CHAR = '\u03B3'; // Greek letter gamma

function getLineLabelAndColor(wallFlag: number) {
    switch (wallFlag) {
        case WallType.CALL | WallType.PUT | WallType.GAMMA:
            return { label: 'GAMMA/CALL/PUT', color: 'purple' };
        case WallType.CALL | WallType.PUT:
            return { label: 'CALL/PUT', color: 'violet' };
        case WallType.CALL | WallType.GAMMA:
            return { label: 'GAMMA/CALL', color: 'teal' };
        case WallType.PUT | WallType.GAMMA:
            return { label: 'GAMMA/PUT', color: 'darkorange' };
        case WallType.CALL:
            return { label: 'CALL', color: 'green' };
        case WallType.PUT:
            return { label: 'PUT', color: 'orange' };
        case WallType.GAMMA:
            return { label: 'GAMMA', color: 'gray' };
        default:
            return { label: 'UNKNOWN', color: 'black' };
    }
}

export const CallPutWallLine = (props: { strikes: number[], callWall: number; putWall: number; spotPriceLineValue: number; gammaWall: number }) => {
    const { callWall, putWall, spotPriceLineValue, strikes, gammaWall } = props;
    const lines: Record<number, number> = {};

    if (callWall) lines[callWall] = (lines[callWall] ?? WallType.NONE) | WallType.CALL;
    if (putWall) lines[putWall] = (lines[putWall] ?? WallType.NONE) | WallType.PUT;
    if (gammaWall) lines[gammaWall] = (lines[gammaWall] ?? WallType.NONE) | WallType.GAMMA;

    return Object.keys(lines).map((value) => {
        const lineValue = Number(value);
        if (lineValue == 0 || !strikes.includes(lineValue)) return <></>;
        const { label, color } = getLineLabelAndColor(lines[lineValue]);
        return <ChartsReferenceLine key={label} y={lineValue} label={`${GAMMA_CHAR} ${label} WALL: $${lineValue}`}
            labelAlign={spotPriceLineValue == callWall ? "end" : "start"}
            lineStyle={{ strokeDasharray: '4', color, stroke: color }}
            labelStyle={{ stroke: color, strokeWidth: 0.25, fontSize: '8px' }} />
    });
};
