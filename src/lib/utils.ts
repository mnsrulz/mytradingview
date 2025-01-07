export const calculateLeftMargin = (maxStrikeValue: number) => {
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
    const bufferHeight = 10 + 40 + ((expirations.length > 3 ? 3 : expirations.length) * 20);
    return bufferHeight + (strikes.length * 15);
}