import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET single position
export async function GET(
    request: Request,
    p: { params: Promise<{ positionId: string }> }
) {
    const positionId = (await p.params).positionId;

    const position = await prisma.portfolio.findUnique({
        where: { id: positionId },
        include: { brokerAccount: true }
    });

    if (!position) {
        return NextResponse.json(
            { error: 'Position not found' },
            { status: 404 }
        );
    }

    return NextResponse.json(position);
}

interface UpdatePositionRequest {
    quantity?: number;
    costBasis?: number;
    notes?: string;
}

// PATCH update position
export async function PATCH(
    request: Request,
    p: { params: Promise<{ positionId: string }> }
) {
    const positionId = (await p.params).positionId;
    const inputJson: UpdatePositionRequest = await request.json();
    const { quantity, costBasis, notes } = inputJson;

    // Check if position exists
    const existingPosition = await prisma.portfolio.findUnique({
        where: { id: positionId }
    });

    if (!existingPosition) {
        return NextResponse.json(
            { error: 'Position not found' },
            { status: 404 }
        );
    }

    // Validate quantity if provided
    if (quantity !== undefined && quantity <= 0) {
        return NextResponse.json(
            { error: 'quantity must be greater than 0' },
            { status: 400 }
        );
    }

    const updateData: any = {};
    if (quantity !== undefined) updateData.quantity = quantity;
    if (costBasis !== undefined) updateData.costBasis = costBasis ? parseFloat(costBasis.toString()) : null;
    if (notes !== undefined) updateData.notes = notes || null;

    const updatedPosition = await prisma.portfolio.update({
        where: { id: positionId },
        data: updateData,
        include: { brokerAccount: true }
    });

    return NextResponse.json(updatedPosition);
}

// DELETE remove position
export async function DELETE(
    request: Request,
    p: { params: Promise<{ positionId: string }> }
) {
    const positionId = (await p.params).positionId;

    const position = await prisma.portfolio.findUnique({
        where: { id: positionId }
    });

    if (!position) {
        return NextResponse.json(
            { error: 'Position not found' },
            { status: 404 }
        );
    }

    await prisma.portfolio.delete({
        where: { id: positionId }
    });

    return NextResponse.json({
        success: true,
        message: `Position ${position.symbol} removed from account`
    });
}
