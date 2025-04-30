import { getOptionPrice } from "@/lib/optionPriceHelper";
import dayjs from "dayjs";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, p: { params: Promise<{ symbol: string }> }) {
    const { symbol } = await p.params
    const [strikePrice, type, expiryDate] = [Number(request.nextUrl.searchParams.get('strike')), request.nextUrl.searchParams.get('type')?.toUpperCase(), dayjs(request.nextUrl.searchParams.get('expiry'), {
        format: 'yyyy-MM-dd'
    })]
    if (type && (type == 'PUTS' || type == 'CALLS')) {
        const pp = await getOptionPrice({
            symbol,
            expirationDate: expiryDate.toDate(),
            strike: strikePrice,
            type
        })
        if (pp) return NextResponse.json(pp);
    }

    return NextResponse.json({
        error: 'no data found for this',
        requ: {
            strikePrice, type, expiryDate, date: expiryDate.toDate()
        }
    }, { status: 400 });
}
