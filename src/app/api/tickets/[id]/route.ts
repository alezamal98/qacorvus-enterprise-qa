import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const updateTicketSchema = z.object({
    status: z.enum(["READY", "TODO", "IN_PROGRESS", "DONE", "BLOCKED"]),
});

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const validatedData = updateTicketSchema.parse(body);

        const ticket = await prisma.ticket.update({
            where: { id },
            data: { status: validatedData.status as any },
        });

        return NextResponse.json(ticket);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const zodError = error as any;
            return NextResponse.json(
                { error: zodError.errors[0]?.message || "Invalid input" },
                { status: 400 }
            );
        }
        console.error("Error updating ticket:", error);
        return NextResponse.json(
            { error: "Error al actualizar ticket" },
            { status: 500 }
        );
    }
}
