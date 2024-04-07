import ky from "ky";
import { NextResponse } from "next/server";
import yf from 'yahoo-finance2';
// export const runtime = 'edge';

export async function GET(request: Request, p: { params: { symbol: string } }) {
    const resp = await ky(`https://www.optionsprofitcalculator.com/ajax/getOptions?stock=${p.params.symbol}&reqId=1`).json<{currentPrice: number | undefined}>();
    const priceResponse = await yf.quoteSummary(p.params.symbol);
    resp.currentPrice = priceResponse.price?.regularMarketPrice;
    return NextResponse.json(resp);
}
