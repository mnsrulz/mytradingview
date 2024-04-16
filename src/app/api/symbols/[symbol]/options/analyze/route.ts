import ky from "ky";
import { NextResponse } from "next/server";
//export const runtime = 'edge';

export async function GET(request: Request, p: { params: { symbol: string } }) {
    const resp = await ky(`https://www.optionsprofitcalculator.com/ajax/getOptions?stock=${p.params.symbol}&reqId=1`).json<{ currentPrice: number | undefined }>();
    const priceresp = await ky(`https://www.optionsprofitcalculator.com/ajax/getStockPrice?stock=${p.params.symbol}&reqId=${new Date().getTime()}`).json<{ price: { last: number | undefined } }>();
    resp.currentPrice = priceresp.price.last;
    return NextResponse.json(resp);
}
