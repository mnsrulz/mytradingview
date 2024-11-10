import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request, p: { params: { symbol: string } }) {
    const resp = await prisma.watchlist.findMany();
    return NextResponse.json({
        items: resp
    });
}

interface AddToWatchlistRequest {
    symbol: string,
    name: string
}

export async function POST(request: Request) {
    const inputJson: AddToWatchlistRequest = await request.json();
    const { symbol, name } = inputJson;
    const existing = await prisma.watchlist.findUnique({
        where: {
            symbol
        }
    });

    if (!existing) {    //let's not throw exception if the entry already exists
        await prisma.watchlist.create({
            data: {
                symbol,
                name
            }
        })
    }
    return NextResponse.json(inputJson);
}

//may be better to expose as a separte endoint??
//for now removing this endoint due to security reasons
// export async function DELETE(request: Request) {
//     const inputJson: AddToWatchlistRequest = await request.json();
//     const { symbol } = inputJson;
//     await prisma.watchlist.delete({
//         where: {
//             symbol
//         }
//     });
//     return NextResponse.json(inputJson);
// }