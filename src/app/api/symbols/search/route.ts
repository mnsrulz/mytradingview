import { NextRequest, NextResponse } from "next/server";
import yf from 'yahoo-finance2';

export async function GET(request: NextRequest, p: { params: { symbol: string } }) {
    const q = request.nextUrl.searchParams.get('q');
    if (!q) return NextResponse.json({ 'error': 'q parameter is not provided in the request.' }, {
        status: 400
    });
    const resp = await yf.search(q);
    return NextResponse.json({
        items: resp
    });
}