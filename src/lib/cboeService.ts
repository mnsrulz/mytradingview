import ky from "ky";

const client = ky.create({
    headers: {
        'Accept': 'application/json'
    },
    cache: 'no-cache'
});

//JUST FOR REF.. PLANNING TO USE THE MZTRADING-DATA SERVICE FOR THIS
export const getDexGexAnalysisViewCboe = async (symbol: string) => {
    const optionChain = await client(`https://cdn.cboe.com/api/global/delayed_quotes/options/${symbol}.json`).json<{
        data: {
            options: {
                option: string,
                open_interest: number,
                delta: number,
                volume: number,
                gamma: number,
            }[],
            close: number
        }
    }>();    
    const currentPrice = optionChain.data.close;    //TODO: is this the close price which remains same if the market is open??
    
    console.time(`getDexGexAnalysisViewCboe-mapping-${symbol}`)
    const mappedOptions = optionChain.data.options.map(({ option, open_interest,volume, delta, gamma }) => {
        //implement mem cache for regex match??
        const rxMatch = /(\w+)(\d{6})([CP])(\d+)/.exec(option);
        if(!rxMatch) throw new Error('error parsing option')
        
        return {
            strike: Number(`${rxMatch[4]}`)/1000,
            expiration_date: `20${rxMatch[2].substring(0,2)}-${rxMatch[2].substring(2,4)}-${rxMatch[2].substring(4,6)}`, 
            open_interest, 
            option_type: (rxMatch[3] == 'C' ? 'call': 'put') as 'call' | 'put',
            volume, 
            greeks: {
                delta: delta || 0,
                gamma: gamma || 0,
            }
        }
    });
    console.timeEnd(`getDexGexAnalysisViewCboe-mapping-${symbol}`)
    return { mappedOptions, currentPrice }
}