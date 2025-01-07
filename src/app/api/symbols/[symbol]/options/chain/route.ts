
import { NextResponse } from "next/server";
import { getCurrentPrice, getFullOptionChain } from '@/lib/tradierService';

export async function GET(request: Request, p: { params: { symbol: string } }) {
    const { symbol } = p.params;
    const fullOptionChain = await getFullOptionChain(symbol);
    const currentPrice = await getCurrentPrice(symbol);
    return NextResponse.json({
        data: fullOptionChain,
        spotPrice: currentPrice
    })
}