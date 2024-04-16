import { StockPriceData } from "@/lib/types";
import ky from "ky";
import { NextResponse } from "next/server";
//export const runtime = 'edge'; //This specifies the runtime environment that the middleware function will be executed in.

export async function GET(request: Request, p: { params: { symbol: string } }) {
    const priceresp = await ky(`https://www.optionsprofitcalculator.com/ajax/getStockPrice?stock=${p.params.symbol}&reqId=${new Date().getTime()}`, {
        retry: {
            limit: 3
        }
    }).json<{ price: { last: number | undefined } }>();
    return NextResponse.json({
        quoteSummary: {
            price: { regularMarketPrice: priceresp.price.last as number }
        }
    } as StockPriceData);
}
