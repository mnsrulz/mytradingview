import { getPriceAtDate } from "@/lib/tradierService";
import { NextResponse } from "next/server";

export async function GET(request: Request, p: { params: { symbol: string, dt: string } }) {
    const { symbol } = p.params;
    const { searchParams } = new URL(request.url);
    const dt = searchParams.get("dt");
    if (!dt) return NextResponse.json({ error: 'dt is null' }, { status: 400 });
    const resp = await getPriceAtDate(symbol,  dt);
    return NextResponse.json({
        price: resp,
        symbol: p.params.symbol
    });
}
