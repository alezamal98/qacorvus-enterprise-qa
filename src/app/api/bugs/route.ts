import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const createBugSchema = z.object({
    ticketId: z.string().optional(),
    sprintId: z.string().min(1),
    description: z.string().min(1, "La descripción es requerida"),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
    evidenceUrl: z.string().url().optional().or(z.literal("")),
});

// GET bugs with filters
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const sprintId = searchParams.get("sprintId");
        const status = searchParams.get("status");

        const where: Record<string, unknown> = {};
        if (sprintId) where.sprintId = sprintId;
        if (status) where.status = status;

        const bugs = await prisma.bug.findMany({
            where,
            include: {
                reportedBy: {
                    select: { name: true, email: true },
                },
                ticket: {
                    select: { title: true },
                },
                sprint: {
                    select: {
                        id: true,
                        project: {
                            select: { name: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(bugs);
    } catch (error) {
        console.error("Error fetching bugs:", error);
        return NextResponse.json(
            { error: "Error al obtener bugs" },
            { status: 500 }
        );
    }
}

// POST report bug
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = createBugSchema.parse(body);

        const bug = await prisma.bug.create({
            data: {
                ticketId: validatedData.ticketId || null,
                sprintId: validatedData.sprintId,
                description: validatedData.description,
                priority: validatedData.priority,
                evidenceUrl: validatedData.evidenceUrl || null,
                userId: session.user.id,
                status: "PENDING",
            },
            include: {
                reportedBy: {
                    select: { name: true },
                },
                ticket: {
                    select: { title: true },
                },
            },
        });

        return NextResponse.json(bug, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.errors[0].message },
                { status: 400 }
            );
        }
        console.error("Error reporting bug:", error);
        return NextResponse.json(
            { error: "Error al reportar bug" },
            { status: 500 }
        );
    }
}
