import { getOptionPrice } from "@/lib/optionPriceHelper";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    let totalProcessed = 0;
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
        if (optionPrice) {
            const lastContractPrice = (optionPrice?.l + optionPrice?.a) / 2;
            if (lastContractPrice) {
                await prisma.trade.update({
                    where: {
                        id: m.id
                    },
                    data: {
                        lastContractPrice,
                        updatedAt: new Date()
                    }
                });
                totalProcessed++;
            }
        }
    }

    return NextResponse.json({
        success: true,
        totalProcessed,
        total: allOpenTrades.length
    });
}
