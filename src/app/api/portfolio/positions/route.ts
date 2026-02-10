import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET all portfolio positions
export async function GET() {
    const positions = await prisma.portfolio.findMany({
        include: {
            brokerAccount: true
        },
        orderBy: [
            { brokerAccount: { broker: 'asc' } },
            { symbol: 'asc' }
        ]
    });

    return NextResponse.json({
        items: positions
    });
}

interface AddPositionRequest {
    symbol: string;
    quantity: number;
    brokerAccountId: string;
    costBasis?: number;
    notes?: string;
}

// POST add new position
export async function POST(request: Request) {
    const inputJson: AddPositionRequest = await request.json();
    const { symbol, quantity, brokerAccountId, costBasis, notes } = inputJson;

    // Validate required fields
    if (!symbol || !quantity || !brokerAccountId) {
        return NextResponse.json(
            { error: 'symbol, quantity, and brokerAccountId are required' },
            { status: 400 }
        );
    }

    // Validate quantity is positive
    if (quantity <= 0) {
        return NextResponse.json(
            { error: 'quantity must be greater than 0' },
            { status: 400 }
        );
    }

    // Check if broker account exists
    const account = await prisma.brokerAccount.findUnique({
        where: { id: brokerAccountId }
    });

    if (!account) {
        return NextResponse.json(
            { error: 'Broker account not found' },
            { status: 404 }
        );
    }

    try {
        const position = await prisma.portfolio.create({
            data: {
                symbol: symbol.toUpperCase(),
                quantity,
                brokerAccountId,
                costBasis: costBasis ? parseFloat(costBasis.toString()) : null,
                notes: notes || null
            },
            include: {
                brokerAccount: true
            }
        });

        return NextResponse.json(position, { status: 201 });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'This position already exists in this account' },
                { status: 409 }
            );
        }
        throw error;
    }
}
