import ky from "ky";
import { HistoricalDataResponse, TradierOptionData } from "./types";
import dayjs from "dayjs";
const tradierBaseUri = process.env.TRADIER_BASE_URI || 'https://sandbox.tradier.com/';
const optionsChain = `${tradierBaseUri}v1/markets/options/chains`;
const lookup = `${tradierBaseUri}v1/markets/lookup`;
const historical = `${tradierBaseUri}v1/markets/history`;
const optionsExpiration = `${tradierBaseUri}v1/markets/options/expirations`;
const getQuotes = `${tradierBaseUri}v1/markets/quotes`;

type Symbol = {
    symbol: string,
    description: string
}

type LookupSymbolResponse = {
    securities: {
        security: Symbol | Symbol[]
    }
}



const client = ky.create({
    headers: {
        'Authorization': `Bearer ${process.env.TRADIER_TOKEN}`,
        'Accept': 'application/json'
    },
    cache: 'no-cache'
});

export const getOptionExpirations = (symbol: string) => {
    return client(optionsExpiration, {
        searchParams: {
            symbol
        }
    }).json<{ expirations: { date: string[] } }>();

}

export const getOptionData = (symbol: string, expiration: string) => {
    return client(optionsChain, {
        searchParams: {
            symbol,
            expiration,
            'greeks': 'true'
        }
    }).json<TradierOptionData>();
}

export const getCurrentPrice = async (symbol: string) => {
    const cp = await client(getQuotes, {
        searchParams: {
            symbols: symbol
        }
    }).json<{
        quotes: {
            quote: {
                symbol: string,
                last: number
            }
        }
    }>();
    return cp.quotes.quote
        //.find(x => x.symbol === symbol)?
        .last;
}


export const lookupSymbol = (q: string) => {
    return client(lookup, {
        searchParams: {
            q,
            //'types': 'stock, etf, index'
        }
    }).json<LookupSymbolResponse>();

}

export const getPriceAtDate = async (s: string, dt: string) => {
    console.log(`${s} -- ${dt}`);
    const start = dayjs(dt.substring(0, 10)).format('YYYY-MM-DD');

    const result = await client(historical, {
        searchParams: {
            'symbol': s,
            'interval': 'daily',
            'start': start,
            'end': start, //dayjs(dt.substring(0, 10)).add(1, 'days').format('YYYY-MM-DD'),
            'session_filter': 'all'
        }
    }).json<{
        "history": {
            "day": {
                "date": string,
                "open": number
            }
        }
    }>();
    const dtresult = result.history.day;
    if (dtresult) return dtresult.open;
    throw new Error('unable to determine price');
}

export const getSeasonalView = async (s: string, duration: '1y' | '2y' | '3y' | '4y' | '5y', interval: 'daily' | 'weekly' | 'monthly') => {
    const years = parseInt(duration.substring(0, 1));
    let startDay: string = '';
    let endDay: string = '';

    switch (interval) {
        case 'daily':
            startDay = dayjs().subtract(years, 'year').format('YYYY-MM-DD');
            endDay = dayjs().format('YYYY-MM-DD');
            break;
        default:
            startDay = dayjs().startOf('year').subtract(years, 'year').format('YYYY-MM-DD');
            endDay = dayjs().startOf('month').format('YYYY-MM-DD')
            break;
    }

    console.log(`fetching data for ${startDay} - ${endDay}`)
    const result = await client(historical, {
        searchParams: {
            'symbol': s,
            'interval': interval,
            'start': startDay,
            'end': endDay, //dayjs(dt.substring(0, 10)).add(1, 'days').format('YYYY-MM-DD'),
            'session_filter': 'all'
        }
    }).json<HistoricalDataResponse>();
    return result;
}