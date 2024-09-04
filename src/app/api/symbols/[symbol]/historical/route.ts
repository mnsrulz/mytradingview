import { NextResponse } from "next/server";
import yf from 'yahoo-finance2';

export async function GET(request: Request, p: { params: { symbol: string } }) {
    const resp = await yf.historical(p.params.symbol, {
        interval: '1d',
        period1: new Date(2023, 0, 1),
        period2: new Date()
    });
    return NextResponse.json({
        data: resp,
        symbol: p.params.symbol
    });
}
