

//                                 |
//[1, 2, 5, 7, 10, 15, 19, 20, 22, 30]
//[2, 5, 2, 2,  2,  1,  1,  1, 13, 3]
//[ ,  ,  , 2,  2,  5,  5,  2,  2, 21]

// const allStrategies = [strategy1, strategy2]

export const mergeMultipleTimeSalesData = (allStrategies: number[][][]) => {
    let timeseriesKeys = new Set<number>();
    for (const strategy of allStrategies) {
        strategy[0].forEach(v => timeseriesKeys.add(v));
    }

    const sortedTimeseriesKeys = [...timeseriesKeys].sort((a, b) => a - b);
    // console.log(sortedTimeseriesKeys);
    //console.log(allStrategies.length);
    const dataset = new Array<Array<number>>(allStrategies.length + 1);
    dataset[0] = sortedTimeseriesKeys;


    for (let ix = 0; ix < allStrategies.length; ix++) {
        // debugger;
        dataset[ix + 1] = new Array<number>(sortedTimeseriesKeys.length);
        const myarray = dataset[ix + 1];
        let lastKnownValue = null;
        let skIx = 0, svIx = 0;
        while (skIx < sortedTimeseriesKeys.length && svIx < allStrategies[ix][1].length) {
            const strategyTimeSeriesKey = allStrategies[ix][0][svIx];
            const timeSeriesKey = sortedTimeseriesKeys[skIx]
            ix == 1 && console.log(`skIx: ${skIx}, svIx: ${svIx}`)
            if (strategyTimeSeriesKey == timeSeriesKey) {
                // console.log(`values are equal.. setting to ${allStrategies[ix][1][svIx]}`);
                myarray[skIx] = allStrategies[ix][1][svIx]
                lastKnownValue = myarray[skIx];
                skIx++; svIx++;
            } else if (strategyTimeSeriesKey < timeSeriesKey) {
                console.log(`inside here...`)   //likely not  going to hit this condition...
                svIx++;
            } else {
                if (lastKnownValue != null) {
                    // console.log(`value is greater but lastknowvalue present: ${lastKnownValue}`);
                    myarray[skIx] = lastKnownValue;
                } else {
                    // console.log(`value is greater`);
                }
                skIx++;
            }

            if (skIx < sortedTimeseriesKeys.length && svIx == allStrategies[ix][1].length) {
                while (skIx < sortedTimeseriesKeys.length && lastKnownValue != null) {
                    myarray[skIx] = lastKnownValue;
                    skIx++;
                }
                console.log(`reached to the end of the keys but there are values to fill`)
            }
        }


    }
    // console.log(dataset)
    return dataset
}

//for testing...
// const strategy1 = [
//     //                                |
//     [1, 2, 5, 10, 15, 19, 20, 22, 30],
//     [2, 5, 2, 2, 1, 1, 1, 13, 3]
// ];
// const strategy2 = [
//     //              |
//     [7, 15, 20, 22],
//     [2, 5, 2, 2]
// ]
// mergeMultipleTimeSalesData([strategy2, strategy1]);