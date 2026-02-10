import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET all broker accounts
export async function GET() {
    const accounts = await prisma.brokerAccount.findMany({
        orderBy: {
            createdAt: 'desc'
        }
    });

    return NextResponse.json({
        items: accounts
    });
}

interface CreateBrokerAccountRequest {
    broker: string;
    accountName: string;
    accountNumber?: string;
}

// POST create new broker account
export async function POST(request: Request) {
    const inputJson: CreateBrokerAccountRequest = await request.json();
    const { broker, accountName, accountNumber } = inputJson;

    // Validate required fields
    if (!broker || !accountName) {
        return NextResponse.json(
            { error: 'broker and accountName are required' },
            { status: 400 }
        );
    }

    try {
        const account = await prisma.brokerAccount.create({
            data: {
                broker,
                accountName,
                accountNumber: accountNumber || null
            }
        });

        return NextResponse.json({
            id: account.id,
            broker: account.broker,
            accountName: account.accountName,
            accountNumber: account.accountNumber
        }, { status: 201 });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'This broker account combination already exists' },
                { status: 409 }
            );
        }
        throw error;
    }
}
