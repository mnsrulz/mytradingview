import ky from "ky";
import { TradierOptionData } from "./types";
const tradierBaseUri = process.env.TRADIER_BASE_URI || 'https://sandbox.tradier.com/';
const optionsChain = `${tradierBaseUri}v1/markets/options/chains`;
const lookup = `${tradierBaseUri}v1/markets/lookup`;
const optionsExpiration = `${tradierBaseUri}v1/markets/options/expirations`;
const getQuotes = `${tradierBaseUri}v1/markets/quotes`;

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

type Symbol = {
    symbol: string,
    description: string
}

type LookupSymbolResponse = { securities: {
    security: Symbol | Symbol[]
} }

export const lookupSymbol = (q: string) => {
    return client(lookup, {
        searchParams: {
            q,
            //'types': 'stock, etf, index'
        }
    }).json<LookupSymbolResponse>();

}