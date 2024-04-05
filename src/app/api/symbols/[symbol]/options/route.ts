import { NextResponse } from "next/server";
import yf from 'yahoo-finance2';

export async function GET(request: Request, p: { params: { symbol: string } }) {
    const resp = await yf.options(p.params.symbol, {
        
    });
    return NextResponse.json({
        resp
    });
}
