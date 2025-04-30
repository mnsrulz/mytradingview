
import dayjs from 'dayjs';
import { NextRequest, NextResponse } from "next/server";
import { calculateHedging, getCalculatedStrikes } from "@/lib/dgHedgingHelper";
import { getCurrentPrice, getOptionData, getOptionExpirations } from '@/lib/tradierService';

export async function GET(request: NextRequest, p: { params: Promise<{ symbol: string }> }) {
  const { searchParams } = new URL(request.url);
  const dteValue = parseInt(searchParams.get("dte") || '30');
  const strikeCountValue = parseInt(searchParams.get("sc") || '30');
  console.log(`calling with ${dteValue} dtes`);
  const { symbol } = await p.params;
  const cleanSymbol = symbol.replace(/\W/g, '');  //to support ^spx and other similar symbols
  const currentPrice = await getCurrentPrice(cleanSymbol);
  if (!currentPrice) throw new Error('Unable to evaluate current price')

  const expresp = await getOptionExpirations(cleanSymbol);

  const tillDate = dayjs().add(dteValue, 'days');
  console.log(`all expirations: ${expresp.expirations.date}`);
  const allDates = [...new Set(expresp.expirations.date.filter(j => dayjs(j).isBefore(tillDate)))];
  const allOptionChains = await Promise.all(allDates.map(d => getOptionData(cleanSymbol, d)));

  const allStrikes = getCalculatedStrikes(currentPrice, strikeCountValue, [...new Set(allOptionChains.flatMap(j => j.options.option.map(s => s.strike)))]);
  const finalResponse = calculateHedging(allOptionChains, allStrikes, allDates, currentPrice)
  return NextResponse.json(finalResponse);
}