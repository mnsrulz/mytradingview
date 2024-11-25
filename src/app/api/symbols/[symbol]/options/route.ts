import { getYfOptions } from "@/lib/yfOptions";
import { NextResponse } from "next/server";

export async function GET(request: Request, p: { params: { symbol: string } }) {
    const resp = await getYfOptions(p.params.symbol)
    return NextResponse.json({
        resp
    });
}
