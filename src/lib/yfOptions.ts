import yf from 'yahoo-finance2';

export const getYfOptions = async (symbol: string) => {
    const resp = await yf.options(symbol, {

    });

    await Promise.all(resp.expirationDates.map(async expiration => {
        console.log(`fetching option data for expiration : ${expiration}`);

        if (resp.options.some(k => k.expirationDate == expiration)) {

        } else {

            const { options } = await yf.options(symbol, {
                date: expiration
            })
            resp.options = [...resp.options, ...options];
        }
    }));
    console.log(`done fetching options data for ${symbol}`);
    
    return resp;
}


