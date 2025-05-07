import { ExposureDataType } from "@/lib/hooks";
import { ExposureCalculationWorkerRequest, ExposureDataResponse } from "@/lib/types";
import { getCalculatedStrikes } from "@/lib/utils";

const mapChartValues = (mp: Map<number, number>, skts: string[], values: number[]) => {
    const nodes = new Array<number>(mp.size).fill(0);
    for (let ix = 0; ix < skts.length; ix++) {
        const nix = mp.get(Number(skts[ix]));
        if (nix !== undefined) {
            nodes[nix] = values[ix];
        }
    }
    return nodes;
}

const calcMaxValue = (len: number, data: number[][]) => {
    const callData = new Array<number>(len).fill(0);
    const putData = new Array<number>(len).fill(0);
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < len; j++) {
            if (data[i][j] > 0) {
                callData[j] += data[i][j]
            } else {
                putData[j] += data[i][j]
            }
        }
    }
    const maxValue = Math.max(Math.abs(Math.max(...callData)), Math.abs(Math.min(...putData)));
    return maxValue;
}

addEventListener("message", (event: MessageEvent<ExposureCalculationWorkerRequest>) => {
    const { dte, chartType, exposureDataResponse: rawExposureResponse, selectedExpirations, strikeCount } = event.data;

    const start = performance.now();
    const filteredData = dte > 0 ? rawExposureResponse.data.filter(j => j.dte <= dte) : rawExposureResponse.data.filter(j => selectedExpirations.includes(j.expiration));
    const expirations = filteredData.map(j => j.expiration);

    const allAvailableStikesForFilteredExpirations = filteredData.reduce((prev, c) => {
        c.strikes.forEach(k => prev.add(Number(k)));
        return prev;
    }, new Set<number>());

    const strikes = getCalculatedStrikes(rawExposureResponse.spotPrice, strikeCount, [...allAvailableStikesForFilteredExpirations]);
    const strikesIndexMap = new Map<number, number>();
    strikes.forEach((j, ix) => strikesIndexMap.set(j, ix));
    const exposureDataValue: ExposureDataType = { expirations, strikes, spotPrice: rawExposureResponse.spotPrice, maxPosition: 0, items: [], callWall: '0', putWall: '0' };
    switch (chartType) {
        case 'GEX':
            const callWallMap = {} as Record<string, number>;
            const putWallMap = {} as Record<string, number>;

            filteredData.forEach(k => {
                k.strikes.forEach((s, ix) => {
                    const strike = Number(s);
                    callWallMap[strike] = (callWallMap[strike] || 0) + k.call.absGamma[ix]
                    putWallMap[strike] = (putWallMap[strike] || 0) + k.put.absGamma[ix]
                })
            })
            exposureDataValue.callWall = Object.keys(callWallMap).reduce((a, b) => callWallMap[a] > callWallMap[b] ? a : b, "");
            exposureDataValue.putWall = Object.keys(putWallMap).reduce((a, b) => putWallMap[a] > putWallMap[b] ? a : b, "");

            exposureDataValue.items = filteredData.map(j => {
                return {
                    expiration: j.expiration,
                    data: mapChartValues(strikesIndexMap, j.strikes, j.netGamma)
                }
            })
            break;
        case 'DEX':
            exposureDataValue.items = filteredData.flatMap(j => {
                return [{
                    expiration: j.expiration,
                    data: mapChartValues(strikesIndexMap, j.strikes, j.call.absDelta)
                }, {
                    expiration: j.expiration,
                    data: mapChartValues(strikesIndexMap, j.strikes, j.put.absDelta.map(v => v))
                }]
            })
            break;
        case 'OI':
            exposureDataValue.items = filteredData.flatMap(j => {
                return [{
                    expiration: j.expiration,
                    data: mapChartValues(strikesIndexMap, j.strikes, j.call.openInterest)
                }, {
                    expiration: j.expiration,
                    data: mapChartValues(strikesIndexMap, j.strikes, j.put.openInterest.map(v => -v))
                }]
            })
            break;
        case 'VOLUME':
            exposureDataValue.items = filteredData.flatMap(j => {
                return [{
                    expiration: j.expiration,
                    data: mapChartValues(strikesIndexMap, j.strikes, j.call.volume)
                }, {
                    expiration: j.expiration,
                    data: mapChartValues(strikesIndexMap, j.strikes, j.put.volume.map(v => -v))
                }]
            })
            break;
        default:
            throw new Error('invalid chart type');
    }

    exposureDataValue.maxPosition = calcMaxValue(strikes.length, exposureDataValue.items.map(j => j.data));
    const end = performance.now();
    console.log(`exposure-calculation took ${end - start}ms`);

    postMessage(exposureDataValue);
    //   postMessage(pi(event.data));
});