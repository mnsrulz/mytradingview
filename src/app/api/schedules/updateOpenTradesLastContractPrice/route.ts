import { getOptionPrice } from "@/lib/optionPriceHelper";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const allOpenTrades = await prisma.trade.findMany({
        where: {
            transactionEndDate: null
        }
    });

    for (const m of allOpenTrades) {
        const optionPrice = await getOptionPrice({
            expirationDate: m.contractExpiry,
            symbol: m.symbol,
            strike: m.strikePrice.toNumber(),
            type: m.contractType.startsWith('CALL') ? 'CALLS' : 'PUTS'
        })
        const lastContractPrice = optionPrice?.l;
        if (lastContractPrice) {
            await prisma.trade.update({
                where: {
                    id: m.id
                },
                data: {
                    lastContractPrice,
                    updatedAt: new Date()
                }
            })
        }
    }

    return NextResponse.json({
        success: true
    });
}
