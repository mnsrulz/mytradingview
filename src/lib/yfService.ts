import yf from 'yahoo-finance2';

export const getHistoricalPrices = async (s: string, startDay: string, endDay: string, interval: 'daily' | 'weekly' | 'monthly') => {
    return await yf.historical(s, {
        period1: startDay,
        period2: endDay,
        interval: interval === 'daily' ? '1d' : interval === 'weekly' ? '1wk' : '1mo'
    })
}
