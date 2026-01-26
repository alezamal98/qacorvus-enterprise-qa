import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// PATCH close sprint
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

        const sprint = await prisma.sprint.update({
            where: { id },
            data: { status: "CLOSED" },
        });

        return NextResponse.json(sprint);
    } catch (error) {
        console.error("Error closing sprint:", error);
        return NextResponse.json(
            { error: "Error al cerrar sprint" },
            { status: 500 }
        );
    }
}
