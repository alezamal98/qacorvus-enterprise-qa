import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { TicketStatus } from "@prisma/client";
import { z } from "zod";
import { logActivity } from "@/lib/activity";

const updateTicketSchema = z.object({
    status: z.nativeEnum(TicketStatus).optional(),
    epicId: z.string().nullable().optional(),
});

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { id } = await params;

        const ticket = await prisma.ticket.findUnique({
            where: { id },
            include: {
                epic: true,
                sprint: true,
            }
        });

        if (!ticket) {
            return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
        }

        return NextResponse.json(ticket);
    } catch (error) {
        console.error("Error fetching ticket:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

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

        // Update ticket and include sprint to access project ID
        const ticket = await prisma.ticket.update({
            where: { id },
            data: {
                ...(validatedData.status && { status: validatedData.status }),
                ...(validatedData.epicId !== undefined && { epicId: validatedData.epicId }),
            },
            include: { sprint: true, epic: true }
        });

        // Log Activity
        let action = "UPDATE";
        let details = `Updated ticket: ${ticket.title}`;

        if (validatedData.status) {
            details = `Updated status to ${validatedData.status}`;
        } else if (validatedData.epicId !== undefined) {
            details = validatedData.epicId
                ? `Assigned to objective: ${ticket.epic?.title}`
                : `Removed from objective`;
        }

        await logActivity({
            projectId: ticket.sprint.projectId,
            userId: session.user.id,
            entityType: "TICKET",
            entityId: ticket.id,
            action: "UPDATE",
            details
        });

        return NextResponse.json(ticket);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const message = error.issues[0]?.message ?? "Invalid input";
            return NextResponse.json(
                { error: message },
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

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { id } = await params;

        // Get ticket info before deleting
        const ticket = await prisma.ticket.findUnique({
            where: { id },
            include: { sprint: true }
        });

        if (ticket) {
            await prisma.ticket.delete({
                where: { id },
            });

            // Log Activity
            await logActivity({
                projectId: ticket.sprint.projectId,
                userId: session.user.id,
                entityType: "TICKET",
                entityId: ticket.id,
                action: "DELETE",
                details: `Deleted ticket: ${ticket.title}`
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting ticket:", error);
        return NextResponse.json(
            { error: "Error al eliminar ticket" },
            { status: 500 }
        );
    }
}
