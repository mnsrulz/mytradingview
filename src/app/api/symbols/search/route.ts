import { lookupSymbol } from "@/lib/tradierService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const q = request.nextUrl.searchParams.get('q');
    if (!q) return NextResponse.json({ 'error': 'q parameter is not provided in the request.' }, {
        status: 400
    });

    const res = await lookupSymbol(q)
    if (!res.securities) return NextResponse.json({ items: [] });
    const { security } = res.securities
    const t1 = Array.isArray(security) ? security : [security];
    return NextResponse.json({
        items: t1.map(j => {
            return {
                symbol: j.symbol,
                name: j.description
            };
        })
    });

    // const resp = await yf.search(q);
    // return NextResponse.json({
    //     items: resp
    // });
}