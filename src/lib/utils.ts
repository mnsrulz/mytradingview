'use client'
import { ExposureDataType, ExposureDataResponse, DexGexType, ExposureCalculationWorkerRequest, OptionBarData } from "./types"

export const calculateYAxisTickWidth = (maxStrikeValue: number) => {
    if (maxStrikeValue < 100) {
        return 48
    } else if (maxStrikeValue < 1000) {
        return 56
    }
    return 64
}


export const calculateChartHeight = (expirations: string[], strikes: (number | string)[]) => {
    /*
    some wierd calculation since there's no straight forward way to set the height of the bars. 
    So 5px for both of the top and bottom margins, and 15px for each bar. Along with 20px for each expirations legends with max of 3 expirations.
    */
    const bufferHeight = 10 + 40 + (4 * 20);
    return bufferHeight + (strikes.length * 15);
}

///responsible for returning the strikes which we have to return in response.
export const getCalculatedStrikes = (currentPrice: number, maxStrikes: number, strikes: number[]) => {
    const currentOrAboveStrikes = strikes.filter(j => j >= currentPrice).sort((a, b) => a - b).reverse();
    const belowCurrentStrikes = strikes.filter(j => j < currentPrice).sort((a, b) => a - b);
    let result = [];
    while (result.length < maxStrikes && (currentOrAboveStrikes.length > 0 || belowCurrentStrikes.length > 0)) {
        result.push(...[currentOrAboveStrikes.pop(), belowCurrentStrikes.pop()].filter(j => j));
    }
    return result.map(Number).sort((a, b) => a - b);
}

export const mapChartValues = (mp: Map<number, number>, skts: string[], values: number[]) => {
    const nodes = new Array<number>(mp.size).fill(0);
    for (let ix = 0; ix < skts.length; ix++) {
        const nix = mp.get(Number(skts[ix]));
        if (nix !== undefined) {
            nodes[nix] = values[ix];
        }
    }
    return nodes;
}

export const calcMaxValue = (len: number, data: number[][]) => {
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

export const filterExposureData = (args: ExposureCalculationWorkerRequest) => {
    const { exposureDataResponse, dte, strikeCount, selectedExpirations, exposureType } = args
    const filtering_start = performance.now();
    const { spotPrice } = exposureDataResponse;
    const filteredData = dte > 0 ? exposureDataResponse.data.filter(j => j.dte <= dte) : exposureDataResponse.data.filter(j => selectedExpirations.includes(j.expiration));
    const expirations = filteredData.map(j => j.expiration);

    const allAvailableStikesForFilteredExpirations = filteredData.reduce((prev, c) => {
        c.strikes.forEach(k => prev.add(Number(k)));
        return prev;
    }, new Set<number>());

    const strikes = getCalculatedStrikes(exposureDataResponse.spotPrice, strikeCount, [...allAvailableStikesForFilteredExpirations]);
    const strikesIndexMap = new Map<number, number>();
    strikes.forEach((j, ix) => strikesIndexMap.set(j, ix));
    const filtering_end = performance.now();
    console.log(`filtering took ${filtering_end - filtering_start}ms`);

    const start = performance.now();

    const exposureDataValue: ExposureDataType = { nivoItems: [], expirations, strikes, spotPrice, maxPosition: 0, items: [], callWall: '0', putWall: '0', dte, exposureType };
    switch (exposureType) {
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
            const sm: Record<string, OptionBarData> = {};
            for (const o of filteredData) {
                o.strikes.forEach((s, six) => {
                    if (strikesIndexMap.has(Number(s))) {
                        sm[s] = sm[s] || { strike: Number(s) };
                        sm[s][`call_${o.expiration}`] = o.netGamma[six] > 0 ? o.netGamma[six] : 0
                        sm[s][`put_${o.expiration}`] = o.netGamma[six] < 0 ? o.netGamma[six] : 0
                    }
                })
            }
            exposureDataValue.nivoItems = Object.values(sm);
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

            const sm1: Record<string, OptionBarData> = {};
            for (const o of filteredData) {
                o.strikes.forEach((s, six) => {
                    if (strikesIndexMap.has(Number(s))) {
                        sm1[s] = sm1[s] || { strike: Number(s) };
                        sm1[s][`call_${o.expiration}`] = o.call.absDelta[six] || 0;
                        sm1[s][`put_${o.expiration}`] = o.put.absDelta[six] || 0;
                    }
                });
            }
            exposureDataValue.nivoItems = Object.values(sm1);

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

            const sm2: Record<string, OptionBarData> = {};
            for (const o of filteredData) {
                o.strikes.forEach((s, six) => {
                    if (strikesIndexMap.has(Number(s))) {
                        sm2[s] = sm2[s] || { strike: Number(s) };
                        sm2[s][`call_${o.expiration}`] = o.call.openInterest[six] || 0;
                        sm2[s][`put_${o.expiration}`] = -o.put.openInterest[six] || 0;
                    }
                });
            }
            exposureDataValue.nivoItems = Object.values(sm2);
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

            const sm3: Record<string, OptionBarData> = {};
            for (const o of filteredData) {
                o.strikes.forEach((s, six) => {
                    if (strikesIndexMap.has(Number(s))) {
                        sm3[s] = sm3[s] || { strike: Number(s) };
                        sm3[s][`call_${o.expiration}`] = o.call.volume[six] || 0;
                        sm3[s][`put_${o.expiration}`] = -o.put.volume[six] || 0;
                    }
                });
            }
            exposureDataValue.nivoItems = Object.values(sm3);
            break;
        default:
            throw new Error('invalid chart type');
    }

    exposureDataValue.nivoItems.sort((a,b)=> a.strike - b.strike);
    exposureDataValue.maxPosition = calcMaxValue(strikes.length, exposureDataValue.items.map(j => j.data));
    const end = performance.now();
    console.log(`exposure-calculation took ${end - start}ms`);

    return exposureDataValue;
}