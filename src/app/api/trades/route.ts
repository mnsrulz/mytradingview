import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
// export const runtime = 'edge'; //This specifies the runtime environment that the middleware function will be executed in.

export async function GET(request: NextRequest, p: { params: { symbol: string } }) {    
    const resp = await prisma.trade.findMany();
    return NextResponse.json({
        items: resp
    });
}

interface CreateTradeRequest {
    symbol: string,
    contractPrice: number
    numberOfContracts: number
    strikePrice: number,
    transactionStartDate: Date,
    approxStockPriceAtPurchase: number
    contractExpiry: Date
    notes: string
    contractType: 'CALL_BUY' | 'CALL_SELL' | 'PUT_BUY' | 'PUT_SELL'
}

export async function POST(request: Request) {
    const inputJson: CreateTradeRequest = await request.json();
    const { symbol, contractPrice, numberOfContracts, strikePrice, transactionStartDate, approxStockPriceAtPurchase, contractExpiry, notes, contractType } = inputJson;
    const resp = await prisma.trade.create({
        data: {
            symbol,
            contractPrice,
            numberOfContracts,
            strikePrice,
            transactionStartDate,
            approxStockPriceAtPurchase,
            contractExpiry,
            notes,
            contractType
        },
        select: {
            id: true
        }
    })
    return NextResponse.json({
        id: resp.id
    });
}
