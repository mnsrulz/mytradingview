import ky from "ky";
import dayjs from 'dayjs';
import { NextResponse } from "next/server";
import { OptionsHedgingDataset } from "@/lib/socket";
const tradierBaseUri = 'https://sandbox.tradier.com/';
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

  const allOp = allOptionChains.flatMap(j => j.options.option.map(s => s));

  //console.log(`Rendering with dates: ${allDates} and strikes: ${allStrikes}`);
  // const model: Record<number, { puts: number[], calls: number[], data: number[] }> = {};
  const dmodel: OptionsHedgingDataset[] = [];
  const gmodel: OptionsHedgingDataset[] = [];
  let maxPosition = 0, gmaxPosition = 0;
  for (const sp of allStrikes) {
    const deltaExposure: OptionsHedgingDataset = { strike: sp };
    const gammaExposure: OptionsHedgingDataset = { strike: sp };
    let sumOfPv = 0, sumOfCv = 0;
    let sumOfGPv = 0, sumOfGCv = 0;
    dmodel.push(deltaExposure);
    gmodel.push(gammaExposure);
    // model[sp] = {
    //   calls: [],
    //   puts: [],
    //   data: []
    // }
    for (const dt of allDates) {
      const cv_o = allOp.find(j => j.strike == sp && j.expiration_date == dt && j.option_type == 'call');
      const pv_o = allOp.find(j => j.strike == sp && j.expiration_date == dt && j.option_type == 'put');

      const cv = (cv_o?.open_interest || 0) * (cv_o?.greeks?.delta || 0) * 100 * currentPrice;
      const pv = (pv_o?.open_interest || 0) * (pv_o?.greeks?.delta || 0) * 100 * currentPrice;

      const gcv = (cv_o?.open_interest || 0) * (cv_o?.greeks?.gamma || 0) * 100 * currentPrice;
      const gpv = (pv_o?.open_interest || 0) * (pv_o?.greeks?.gamma || 0) * 100 * currentPrice;
      // model[sp].calls.push(cv);
      // model[sp].puts.push(pv);
      // model[sp].data.push(-cv, pv);

      deltaExposure[`${dt}-call`] = -cv;
      deltaExposure[`${dt}-put`] = -pv;

      const gv = gcv - gpv;

      if (gv > 0) {
        gammaExposure[`${dt}-call`] = -gv;
        gammaExposure[`${dt}-put`] = 0;
      } else {
        gammaExposure[`${dt}-call`] = 0;
        gammaExposure[`${dt}-put`] = -gv;
      }

      sumOfPv = sumOfPv + Math.abs(pv);
      sumOfCv = sumOfCv + Math.abs(cv);

      sumOfGPv = sumOfGPv + Math.abs(gpv);
      sumOfGCv = sumOfGCv + Math.abs(gcv);
    }
    maxPosition = Math.max(maxPosition, sumOfPv, sumOfCv);
    gmaxPosition = Math.max(gmaxPosition, sumOfGPv, sumOfGCv);
  }

  const finalResponse = {
    exposureData: {
      strikes: allStrikes,
      expirations: allDates,
      currentPrice,
      maxPosition,
      deltaDataset: {
        dataset: dmodel,
        maxPosition
      },
      gammaDataset: {
        dataset: gmodel,
        maxPosition: gmaxPosition
      }
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

///responsible for returning the strikes which we have to return in response.
function getCalculatedStrikes(currentPrice: number, maxStrikes: number, strikes: number[]) {
  const currentOrAboveStrikes = strikes.filter(j => j >= currentPrice).sort((a, b) => a - b).reverse();
  const belowCurrentStrikes = strikes.filter(j => j < currentPrice).sort((a, b) => a - b);
  let result = [];
  while (result.length < maxStrikes && (currentOrAboveStrikes.length > 0 || belowCurrentStrikes.length > 0)) {
    result.push(...[currentOrAboveStrikes.pop(), belowCurrentStrikes.pop()].filter(j => j));
  }
  return result.map(Number).sort((a, b) => a - b);
}