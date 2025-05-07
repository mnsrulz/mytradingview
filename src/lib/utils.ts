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