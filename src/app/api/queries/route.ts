import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
// export const runtime = 'edge'; //This specifies the runtime environment that the middleware function will be executed in.

export async function GET() {
    const resp = await prisma.savedQuery.findMany();
    return NextResponse.json({
        items: resp
    });
}

interface CreateQueryRequest {
    name: string,
    query: string
}

export async function POST(request: Request) {
    const inputJson: CreateQueryRequest = await request.json();
    const { name, query } = inputJson;
    const resp = await prisma.savedQuery.create({
        data: {
            name,
            query,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        select: {
            id: true,
            createdAt: true,
            name: true,
            query: true,
            updatedAt: true
        }
    })
    return NextResponse.json(resp, {
        status: 201
    });
}
