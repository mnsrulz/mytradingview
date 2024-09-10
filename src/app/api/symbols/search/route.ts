import { lookupSymbol } from "@/lib/tradierService";
import { NextRequest, NextResponse } from "next/server";
import yf from 'yahoo-finance2';
export async function GET(request: NextRequest) {
    const q = request.nextUrl.searchParams.get('q');
    if (!q) return NextResponse.json({ 'error': 'q parameter is not provided in the request.' }, {
        status: 400
    });

    const result = await search(q);

    return NextResponse.json({
        items: result
    });

    // const resp = await yf.search(q);
    // return NextResponse.json({
    //     items: resp
    // });
}
const allowedYfTypes = ["EQUITY" , "ETF" , "INDEX"];
async function search(q: string) {
    try {
        const resp = await yf.search(q);
        const yahooSymbols = resp.quotes.filter(j => j.isYahooFinance).filter(j => allowedYfTypes.includes(j.quoteType)).map(j => {
            return {
                symbol: j.symbol,
                name: j.longname
            }
        })
        if (yahooSymbols && yahooSymbols.length > 0) {
            return yahooSymbols
        }
    } catch (error) {

    }

    console.log(`no result found in yahoofinace. Falling back to tradier.`)
    //fallback to tradier search
    const res = await lookupSymbol(q)
    if (res.securities) {
        const { security } = res.securities
        const t1 = Array.isArray(security) ? security : [security];
        return t1.map(j => {
            return {
                symbol: j.symbol,
                name: j.description
            }
        });
    }

    return [];
}