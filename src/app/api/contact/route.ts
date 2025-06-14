import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

interface ContactUsRequest {
    name: string,
    email: string,
    message: string,
    subject: string,
}

export async function POST(request: Request) {
    const inputJson: ContactUsRequest = await request.json();
    const { name, email, subject, message } = inputJson;
    if (!name || !email || !message) {
        return NextResponse.json({ error: 'Name, email, and message are required' }, {
            status: 400
        })
    }
    await prisma.contactMessage.create({
        data: {
            name,
            email,
            subject,
            message,
        },
    });    
    return NextResponse.json({ message: 'Message received' });
}
