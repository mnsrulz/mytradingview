import dayjs from "dayjs";
import { EarningsSeason, HistoricalDataResponse } from "./types";
import { getEarningDates, getHistoricalPrices } from './tradierService'
import { getHistoricalPrices as getHistoricalPricesYf } from './yfService'

export const getSeasonalView = async (s: string, duration: '1y' | '2y' | '3y' | '4y' | '5y', interval: 'daily' | 'weekly' | 'monthly', client: 'tradier' | 'yahoo' = 'tradier') => {
    const years = parseInt(duration.substring(0, 1));
    let startDay: string = '';
    let endDay: string = '';

    switch (interval) {
        case 'daily':
            startDay = dayjs().subtract(years, 'year').format('YYYY-MM-DD');
            endDay = dayjs().format('YYYY-MM-DD');
            break;
        default:
            startDay = dayjs().startOf('year').subtract(years, 'year').month(0).format('YYYY-MM-DD');
            endDay = dayjs().startOf('month').format('YYYY-MM-DD')
            break;
    }

    console.log(`Fetching data for ${s} from ${startDay} to ${endDay} interval ${interval}`);

    if (client === 'tradier') {
        return await getHistoricalPrices(s, startDay, endDay, interval);
    } 

    const result12 = await getHistoricalPricesYf(s, startDay, endDay, interval);    
    const dss = {} as HistoricalDataResponse;
    dss.history = { day: result12.map(r => ({ date: dayjs(r.date).format('YYYY-MM-DD'), open: r.open!, close: r.close!, high: r.high, low: r.low, volume: r.volume })) };
    return dss;
}

export const getEarningsView = async (symbol: string, client: 'tradier' | 'yahoo' = 'yahoo') => {
    const earnings = await getEarningDates(symbol);
    const { history } = await getSeasonalView(symbol, '5y', 'daily', client);
    const data = history.day;

    const entries: EarningsSeason[] = [];
    const addData = (ix: number) => {
        const lp = ix > 0 ? data[ix - 1].close : data[ix].open;
        const closePercentage = ((data[ix].close - lp) / lp);
        const openPercentage = ((data[ix].open - lp) / lp);

        const nextOpenPercentage = data.length > ix + 1 ? ((data[ix + 1].open - data[ix].close) / data[ix].close) : undefined;
        const nextClosePercentage = data.length > ix + 1 ? ((data[ix + 1].close - data[ix].close) / data[ix].close) : undefined;
        const nextOpen = data.length > ix + 1 ? data[ix + 1].open : undefined;
        const nextClose = data.length > ix + 1 ? data[ix + 1].close : undefined;

        entries.push({
            open: data[ix].open,
            close: data[ix].close,
            closePercentage,
            openPercentage,
            nextOpenPercentage,
            nextClosePercentage,
            nextOpen,
            nextClose,
            date: data[ix].date
        })
    }
    for (const e of earnings) {
        const ix = data.findIndex(j => j.date == e.begin_date_time);
        if (ix < 0) continue;
        addData(ix);
    }
    return entries.reverse();
}