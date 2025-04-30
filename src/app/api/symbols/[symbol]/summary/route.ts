import { getCurrentPrice } from "@/lib/stockService";
import { StockPriceData } from "@/lib/types";
import ky from "ky";
import { NextRequest, NextResponse } from "next/server";
//export const runtime = 'edge'; //This specifies the runtime environment that the middleware function will be executed in.

export async function GET(request: NextRequest, p: { params: Promise<{ symbol: string }> }) {
    const { symbol } = await p.params;
    const resp = await getCurrentPrice(symbol)
    return NextResponse.json({
        quoteSummary: {
            price: {
                regularMarketPrice: resp.price.last
            }
        }
    }); // } as StockPriceData);
}
