import ky from "ky";
import { HistoricalDataResponse, TradierOptionContractData, TradierOptionData } from "./types";
import dayjs from "dayjs";
import chunks from 'lodash.chunk';
import { LRUCache } from 'lru-cache'
const tradierBaseUri = process.env.TRADIER_BASE_URI || 'https://sandbox.tradier.com/';
const optionsChain = `${tradierBaseUri}v1/markets/options/chains`;
const lookup = `${tradierBaseUri}v1/markets/lookup`;
const historical = `${tradierBaseUri}v1/markets/history`;
const optionsExpiration = `${tradierBaseUri}v1/markets/options/expirations`;
const getQuotes = `${tradierBaseUri}v1/markets/quotes`;
const calendars = `${tradierBaseUri}beta/markets/fundamentals/calendars`;
const timesales = `${tradierBaseUri}v1/markets/timesales`;
const optionLookup = `${tradierBaseUri}v1/markets/options/lookup`;

type Symbol = {
    symbol: string,
    description: string
}

type LookupSymbolResponse = {
    securities: {
        security: Symbol | Symbol[]
    }
}

interface CorporateCalendar {
    company_id: string;
    begin_date_time: string;
    end_date_time: string;
    event_type: number;
    estimated_date_for_next_event: string;
    event: string;
    event_fiscal_year: number;
    event_status: string;
    time_zone: string;
}

interface Result {
    type: string;
    id: string;
    tables: {
        corporate_calendars: CorporateCalendar[] | undefined;
    };
}

interface Request {
    request: string;
    type: string;
    results: Result[];
}

interface CorporateCalendarResponse {
    request: string;
    type: string;
    results: Result[];
    error: string
}


export interface TimeSalesResposne { series: { data: { time: Date, price: number, timestamp: number }[] }, symbol: string }


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

export const getSeasonalView = async (s: string, duration: '1y' | '2y' | '3y' | '4y' | '5y', interval: 'daily' | 'weekly' | 'monthly' | 'earnings') => {
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

export const getEarningDates = async (symbol: string) => {
    const calendar = await client(calendars, {
        searchParams: {
            'symbols': symbol
        }
    }).json<CorporateCalendarResponse[]>();
    if (calendar[0].error) {
        return [];
    }
    const earnings = calendar[0].results.flatMap(j => j.tables.corporate_calendars || [])
        // .filter(j => j != null)
        // .filter(j => j != undefined)
        //.filter(j => j.event_type == 14)
        .filter(j => j && j.event_status == 'Confirmed' && j.event.includes('Quarter Earnings Result'))  //should there a  better way to filter?        
        .sort((j, k) => j.begin_date_time.localeCompare(k.begin_date_time))
        .map(({ begin_date_time, event_type, event }) => ({ begin_date_time, event_type, event })); //9

    return earnings;
}

export const getTimeAndSales = async (symbol: string) => {
    return await client(timesales, {
        searchParams: {
            symbol,
            interval: '5min',
            start: dayjs().subtract(5, 'day').format('YYYY-MM-DD'),
            end: dayjs().format('YYYY-MM-DD')
        }
    }).json<TimeSalesResposne>();
}

export const getFullOptionChain = async (underlying: string) => {
    console.time(`getFullOptionChain-${underlying}`)
    const { symbols } = await client(optionLookup, {
        searchParams: {
            underlying
        }
    }).json<{
        symbols: {
            rootSymbol: string,
            options: string[]
        }[]
    }>();

    const symbolChunks = chunks(symbols.flatMap(j => j.options), 5000);

    const allSymbolResults = await Promise.all(symbolChunks.map(async s => {
        console.time(`getFullOptionChain-${underlying}-${symbolChunks.indexOf(s)}`)
        const formData = new FormData();
        formData.append("symbols", s.join(','));
        formData.append("greeks", 'true');

        const quotes = await client.post(getQuotes, {
            body: formData
        }).json<{
            quotes: {
                quote: TradierOptionContractData[]
            }
        }>();
        console.timeEnd(`getFullOptionChain-${underlying}-${symbolChunks.indexOf(s)}`)
        return quotes.quotes.quote
    }));
    console.timeEnd(`getFullOptionChain-${underlying}`);
    return allSymbolResults.flatMap(j => j);
}


export const getFullOptionChainV2 = async (underlying: string) => {
    console.time(`getFullOptionChainV2-${underlying}`)
    const allExpirations = await getOptionExpirations(underlying);
    const allOptionChains = await Promise.all(allExpirations.expirations.date.map(expiration => getOptionData(underlying, expiration)));
    console.timeEnd(`getFullOptionChainV2-${underlying}`)
    return allOptionChains.flatMap(j => j.options.option);
}

export const getDexGexAnalysisView = async (symbol: string) => {
    const optionChainPromise = getFullOptionChain(symbol);
    const currentPricePromise = getCurrentPrice(symbol);
    
    //TODO: implement in mem cache
    
    await Promise.all([optionChainPromise, currentPricePromise]);
    const optionChain = await optionChainPromise;
    const currentPrice = await currentPricePromise;
    
    console.time(`getDexGexAnalysisView-mapping-${symbol}`)
    const mappedOptions = optionChain.map(({ strike, expiration_date, greeks, open_interest, option_type, volume }) => ({
        strike, expiration_date, open_interest, option_type, volume, greeks: {
            delta: greeks?.delta || 0,
            gamma: greeks?.gamma || 0,
        }
    }));
    console.timeEnd(`getDexGexAnalysisView-mapping-${symbol}`)
    return { mappedOptions, currentPrice }
}