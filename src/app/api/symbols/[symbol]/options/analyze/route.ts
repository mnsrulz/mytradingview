import ky from "ky";
import { NextResponse } from "next/server";
export const runtime = 'edge';

export async function GET(request: Request, p: { params: { symbol: string } }) {
    const resp = await ky(`https://www.optionsprofitcalculator.com/ajax/getOptions?stock=${p.params.symbol}&reqId=1`).json();
    return NextResponse.json(resp);
}
