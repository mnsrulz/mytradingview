import ky from "ky";
import { NextRequest, NextResponse } from "next/server";
//export const runtime = 'edge';

export async function GET(request: NextRequest, p: { params: Promise<{ symbol: string }> }) {
    const { symbol } = await p.params;
    const resp = await ky(`https://www.optionsprofitcalculator.com/ajax/getOptions?stock=${symbol}&reqId=${new Date().getTime()}`).json<{ currentPrice: number | undefined }>();
    const priceresp = await ky(`https://www.optionsprofitcalculator.com/ajax/getStockPrice?stock=${symbol}&reqId=${new Date().getTime()}`).json<{ price: { last: number | undefined } }>();
    resp.currentPrice = priceresp.price.last;
    return NextResponse.json(resp);
}
