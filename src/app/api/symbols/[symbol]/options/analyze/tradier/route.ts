import ky from "ky";
import dayjs from 'dayjs';
import { NextResponse } from "next/server";
import { dnmodel } from "@/lib/socket";
const tradierBaseUri = 'https://sandbox.tradier.com/';
const optionsChain = `${tradierBaseUri}v1/markets/options/chains`;
const optionsExpiration = `${tradierBaseUri}v1/markets/options/expirations`;
const getQuotes = `${tradierBaseUri}v1/markets/quotes`;

const client = ky.create({
  headers: {
    'Authorization': `Bearer ${process.env.TRADIER_TOKEN}`,
    'Accept': 'application/json'
  }
});

export async function GET(request: Request, p: { params: { symbol: string } }) {
  const { symbol } = p.params;
  const currentPrice = await getCurrentPrice(symbol);
  if (!currentPrice) throw new Error('Unable to evaluate current price')

  const expresp = await client(optionsExpiration, {
    searchParams: {
      symbol
    }
  }).json<{ expirations: { date: string[] } }>();

  const tillDate = dayjs().add(8, 'weeks');
  const allDates = [...new Set(expresp.expirations.date.filter(j => dayjs(j).isBefore(tillDate)))];
  const allOptionChains = await Promise.all(allDates.map(d => getOptionData(symbol, d)));

  const allStrikes = [...new Set(allOptionChains.flatMap(j => j.options.option.map(s => s.strike)))].filter(s => currentPrice > s * .9 && currentPrice < s * 1.1);
  const allOp = allOptionChains.flatMap(j => j.options.option.map(s => s));

  console.log(`Rendering with dates: ${allDates} and strikes: ${allStrikes}`);
  const model: Record<number, { puts: number[], calls: number[], data: number[] }> = {};
  const dmodel: dnmodel[] = [];
  for (const sp of allStrikes) {
    const md: dnmodel = { strike: sp };
    dmodel.push(md);
    model[sp] = {
      calls: [],
      puts: [],
      data: []
    }
    for (const dt of allDates) {
      const cv_o = allOp.find(j => j.strike == sp && j.expiration_date == dt && j.option_type == 'call');
      const pv_o = allOp.find(j => j.strike == sp && j.expiration_date == dt && j.option_type == 'put');

      const cv = (cv_o?.open_interest || 0) * (cv_o?.greeks?.delta || 0) * 100;
      const pv = (pv_o?.open_interest || 0) * (pv_o?.greeks?.delta || 0) * 100;
      model[sp].calls.push(cv);
      model[sp].puts.push(pv);
      model[sp].data.push(-cv, pv);

      md[`${dt}-call`] = -cv;
      md[`${dt}-put`] = -pv;
    }
  }

  const finalResponse = {
    dh: {
      data: model,
      dataset: dmodel,
      strikes: allStrikes,
      expirations: allDates
    },
    raw: allOptionChains
  }
  return NextResponse.json(finalResponse);
}

function getOptionData(symbol: string, expiration: string) {
  return client(optionsChain, {
    searchParams: {
      symbol,
      expiration,
      'greeks': 'true'
    }
  }).json<{
    options: {
      option: {
        strike: number,
        open_interest: number,
        expiration_date: string,
        option_type: 'put' | 'call',
        greeks: {
          delta: number,
          gamma: number
        }
      }[]
    }
  }>();
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