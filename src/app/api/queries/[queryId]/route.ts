import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request, p: { params: Promise<{ queryId: string }> }) {
    const query = await prisma.savedQuery.findFirst({
        where: {
            id: (await p.params).queryId
        }
    });

    return NextResponse.json(query);
}

interface UpdateQueryRequest {
    name: string,
    query: string
}

export async function PUT(request: Request, p: { params: Promise<{ queryId: string }> }) {
    const inputJson: UpdateQueryRequest = await request.json();
    const { name, query } = inputJson;
    const existing = await prisma.savedQuery.findFirst({
        where: {
            id: (await p.params).queryId
        }
    });

    if (!existing) return NextResponse.json({
        message: 'No query found'
    }, {
        status: 404
    })

    await prisma.savedQuery.update({
        where: {
            id: existing.id
        },
        data: {
            name: name,
            query: query,
            updatedAt: new Date()
        }
    });

    return new NextResponse(null, {
        status: 204
    });
}

export async function DELETE(request: Request, p: { params: Promise<{ queryId: string }> }) {
    await prisma.savedQuery.delete({
        where: {
            id: (await p.params).queryId
        }
    });

    return NextResponse.json(null, {
        status: 204
    });
}