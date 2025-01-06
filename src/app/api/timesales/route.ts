import { getTimeAndSales } from "@/lib/tradierService";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const u = (searchParams?.get('u') || '').split(',').filter(j=> j.trim());
    const p = Number(searchParams.get('p') || '5');

    const allsett = await Promise.all(u.map(symbol => getTimeAndSales(symbol, p).then(r => ({ ...r, symbol }))));
    return NextResponse.json(allsett);

}