import { getCurrentPrice } from "@/lib/stockService";
import { StockPriceData } from "@/lib/types";
import ky from "ky";
import { NextResponse } from "next/server";
//export const runtime = 'edge'; //This specifies the runtime environment that the middleware function will be executed in.

export async function GET(request: Request, p: { params: { symbol: string } }) {
    const resp = await getCurrentPrice(p.params.symbol)
    return NextResponse.json({
        quoteSummary: {
            price: {
                regularMarketPrice: resp.price.last
            }
        }
    } as StockPriceData);
}
