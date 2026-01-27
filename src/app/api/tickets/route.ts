import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const createTicketSchema = z.object({
    title: z.string().min(1, "El título es requerido"),
    sprintId: z.string().min(1, "El sprint es requerido"),
});

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = createTicketSchema.parse(body);

        const ticket = await prisma.ticket.create({
            data: {
                title: validatedData.title,
                sprintId: validatedData.sprintId,
                status: "TODO",
            },
        });

        return NextResponse.json(ticket, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            const message = error.issues[0]?.message ?? "Invalid input";
            return NextResponse.json(
                { error: message },
                { status: 400 }
            );
        }
        console.error("Error creating ticket:", error);
        return NextResponse.json(
            { error: "Error al crear ticket" },
            { status: 500 }
        );
    }
}
