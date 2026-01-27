import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const validateBugSchema = z.object({
    status: z.enum(["REAL", "FALSE"]),
});

// PATCH validate bug as REAL or FALSE
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        // Only ADMIN can validate bugs
        if (session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Solo administradores pueden validar bugs" },
                { status: 403 }
            );
        }

        const { id } = await params;
        const body = await request.json();
        const validatedData = validateBugSchema.parse(body);

        const bug = await prisma.bug.update({
            where: { id },
            data: { status: validatedData.status },
            include: {
                reportedBy: {
                    select: { name: true },
                },
                ticket: {
                    select: { title: true },
                },
            },
        });

        return NextResponse.json(bug);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const message = error.issues[0]?.message ?? "Invalid input";
            return NextResponse.json(
                { error: message },
                { status: 400 }
            );
        }
        console.error("Error validating bug:", error);
        return NextResponse.json(
            { error: "Error al validar bug" },
            { status: 500 }
        );
    }
}

