import ky from 'ky';
import yf from 'yahoo-finance2';

export const getCurrentPrice = async (symbol: string) => {
    try {
        const quote = await yf.quoteCombine(symbol);
        if (!quote.regularMarketPrice) throw new Error('null price received!');
        return {
            price: {
                last: quote.regularMarketPrice
            }
        }
    } catch (error) {
        console.log(`error occurred while fetching the price using yahoo finance api. falling back to optionprofitcalculator`);
        const priceresp = await ky(`https://www.optionsprofitcalculator.com/ajax/getStockPrice?stock=${symbol}&reqId=${new Date().getTime()}`, {
            retry: {
                limit: 3
            }
        }).json<{ price: { last: number } }>();
        return priceresp;
    }
}