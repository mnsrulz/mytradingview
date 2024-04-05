import { NextResponse } from "next/server";
import yf from 'yahoo-finance2';

// export const runtime = 'edge'; //This specifies the runtime environment that the middleware function will be executed in.

export async function GET(request: Request, p: { params: { symbol: string } }) {
    const resp = await yf.quoteSummary(p.params.symbol);
    return NextResponse.json({
        quoteSummary: resp
    });
}
