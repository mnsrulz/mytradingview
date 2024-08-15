import ky from "ky";
import dayjs from 'dayjs';
import { NextResponse } from "next/server";
const tradierBaseUri = 'https://sandbox.tradier.com/';
const optionsChain = `${tradierBaseUri}v1/markets/options/chains`;
const optionsExpiration = `${tradierBaseUri}v1/markets/options/expirations`;

const client = ky.create({
  headers: {
    'Authorization': `Bearer ${process.env.TRADIER_TOKEN}`,
    'Accept': 'application/json'
  }
});

export async function GET(request: Request, p: { params: { symbol: string } }) {
  const { symbol } = p.params;
  const expresp = await client(optionsExpiration, {
    searchParams: {
      symbol
    }
  }).json<{ expirations: { date: string[] } }>();

  const tillDate = dayjs().add(6, 'weeks');
  const allDates = expresp.expirations.date.filter(j => dayjs(j).isBefore(tillDate));

  const allOptionChains = await Promise.all(allDates.map(d => getOptionData(symbol, d)));

  return NextResponse.json(allOptionChains);
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
        option_type: 'PUT' | 'CALL'
      }
    }
  }>();
}
