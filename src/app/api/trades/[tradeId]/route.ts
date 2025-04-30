import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request, p: { params: Promise<{ tradeId: string }> }) {
    const existingTrade = await prisma.trade.findFirst({
        where: {
            id: (await p.params).tradeId
        }
    });

    return NextResponse.json(existingTrade);
}

export async function DELETE(request: Request, p: { params: Promise<{ tradeId: string }> }) {
    await prisma.trade.delete({
        where: {
            id: (await p.params).tradeId
        }
    });

    return NextResponse.json({
        success: true
    });
}
