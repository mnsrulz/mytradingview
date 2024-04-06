import prisma from "@/lib/prisma";
import dayjs from "dayjs";
import { NextResponse } from "next/server";

interface CloseTradeRequest {
    tradeId: string,
    transactionEndDate: Date,
    contractPriceAtClose: number,
    notes: string
}

export async function POST(request: Request) {
    const inputJson: CloseTradeRequest = await request.json();
    const { tradeId, transactionEndDate, contractPriceAtClose, notes } = inputJson;
    const existingTrade = await prisma.trade.findFirst({
        where: {
            id: tradeId
        }
    });

    if (!existingTrade) return NextResponse.json({ error: 'trade not found!' }, { status: 404 });

    await prisma.trade.update({
        where: {
            id: tradeId
        },
        data: {
            transactionEndDate: transactionEndDate || dayjs(),
            contractPriceAtClose: contractPriceAtClose,
            notes
        }
    });

    return NextResponse.json({
        success: true
    });
}
