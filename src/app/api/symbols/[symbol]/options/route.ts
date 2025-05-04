import { getYfOptions } from "@/lib/yfOptions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, p: { params: Promise<{ symbol: string }> }) {
    const { symbol } = await p.params;
    const resp = await getYfOptions(symbol)
    return NextResponse.json({
        resp
    });
}
