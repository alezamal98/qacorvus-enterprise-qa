import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// DELETE - Delete an epic
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;

        // Check if epic exists
        const epic = await prisma.epic.findUnique({
            where: { id },
            include: { tickets: true }, // Check if it has tickets
        });

        if (!epic) {
            return new NextResponse("Epic not found", { status: 404 });
        }

        // Optional: Block deletion if tickets are assigned? 
        // Or just unlink them? 
        // For now, let's unlink tickets (set epicId = null) first, then delete epic.
        // Prisma might handle cascading delete depending on schema, but let's be safe.
        // If tickets "belong" to epic, cascade. If linked, set null.
        // Assuming tickets can exist without epic.

        // Unlink tickets
        await prisma.ticket.updateMany({
            where: { epicId: id },
            data: { epicId: null },
        });

        await prisma.epic.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[EPIC_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
