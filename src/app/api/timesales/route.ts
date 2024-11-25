import { getTimeAndSales } from "@/lib/tradierService";
import { NextResponse } from "next/server";

export async function GET(request: Request, p: { query: { u: string } }) {
    const { searchParams } = new URL(request.url);
    const u = (searchParams?.get('u') || '').split(',').filter(j=> j.trim());

    const allsett = await Promise.all(u.map(symbol => getTimeAndSales(symbol).then(r => ({ ...r, symbol }))));
    return NextResponse.json(allsett);

}