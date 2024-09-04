import ky from "ky";
import dayjs from 'dayjs';
import { NextResponse } from "next/server";
import { OptionsHedgingDataset } from "@/lib/socket";
import { TradierOptionData } from "@/lib/types";
import { calculateHedging, getCalculatedStrikes } from "@/lib/dgHedgingHelper";
const tradierBaseUri = process.env.TRADIER_BASE_URI || 'https://sandbox.tradier.com/';
const optionsChain = `${tradierBaseUri}v1/markets/options/chains`;
const optionsExpiration = `${tradierBaseUri}v1/markets/options/expirations`;
const getQuotes = `${tradierBaseUri}v1/markets/quotes`;

const client = ky.create({
  headers: {
    'Authorization': `Bearer ${process.env.TRADIER_TOKEN}`,
    'Accept': 'application/json'
  },
  cache: 'no-cache'
});

export async function GET(request: Request, p: { params: { symbol: string } }) {
  const { searchParams } = new URL(request.url);
  const dteValue = parseInt(searchParams.get("dte") || '30');
  const strikeCountValue = parseInt(searchParams.get("sc") || '30');
  console.log(`calling with ${dteValue} dtes`);
  const { symbol } = p.params;
  const currentPrice = await getCurrentPrice(symbol);
  if (!currentPrice) throw new Error('Unable to evaluate current price')

  const expresp = await client(optionsExpiration, {
    searchParams: {
      symbol
    }
  }).json<{ expirations: { date: string[] } }>();

  const tillDate = dayjs().add(dteValue, 'days');
  console.log(`all expirations: ${expresp.expirations.date}`);
  const allDates = [...new Set(expresp.expirations.date.filter(j => dayjs(j).isBefore(tillDate)))];
  const allOptionChains = await Promise.all(allDates.map(d => getOptionData(symbol, d)));

  const allStrikes = getCalculatedStrikes(currentPrice, strikeCountValue, [...new Set(allOptionChains.flatMap(j => j.options.option.map(s => s.strike)))]);
  const finalResponse = calculateHedging(allOptionChains, allStrikes, allDates, currentPrice)
  return NextResponse.json(finalResponse);
}

function getOptionData(symbol: string, expiration: string) {
  return client(optionsChain, {
    searchParams: {
      symbol,
      expiration,
      'greeks': 'true'
    }
  }).json<TradierOptionData>();
}

async function getCurrentPrice(symbol: string) {
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

