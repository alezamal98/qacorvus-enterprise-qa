import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const createSprintSchema = z.object({
    projectId: z.string().min(1),
    rhythm: z.enum(["WEEKLY", "BIWEEKLY"]),
    tickets: z.array(z.string().min(1)).min(1, "Se requiere al menos un ticket"),
});

// GET sprints by project
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get("projectId");

        if (!projectId) {
            return NextResponse.json(
                { error: "projectId es requerido" },
                { status: 400 }
            );
        }

        const sprints = await prisma.sprint.findMany({
            where: { projectId },
            include: {
                tickets: true,
                bugs: {
                    include: {
                        reportedBy: {
                            select: { name: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(sprints);
    } catch (error) {
        console.error("Error fetching sprints:", error);
        return NextResponse.json(
            { error: "Error al obtener sprints" },
            { status: 500 }
        );
    }
}

// POST create sprint with tickets
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = createSprintSchema.parse(body);

        // Calculate dates based on rhythm
        const startDate = new Date();
        const endDate = new Date();
        if (validatedData.rhythm === "WEEKLY") {
            endDate.setDate(endDate.getDate() + 7);
        } else {
            endDate.setDate(endDate.getDate() + 14);
        }

        // Create sprint with tickets in a transaction
        const sprint = await prisma.$transaction(async (tx) => {
            const newSprint = await tx.sprint.create({
                data: {
                    projectId: validatedData.projectId,
                    rhythm: validatedData.rhythm,
                    startDate,
                    endDate,
                    status: "OPEN",
                },
            });

            // Create tickets
            await tx.ticket.createMany({
                data: validatedData.tickets.map((title) => ({
                    sprintId: newSprint.id,
                    title: title.trim(),
                    status: "TODO",
                })),
            });

            // Return sprint with tickets
            return tx.sprint.findUnique({
                where: { id: newSprint.id },
                include: { tickets: true },
            });
        });

        return NextResponse.json(sprint, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.errors[0].message },
                { status: 400 }
            );
        }
        console.error("Error creating sprint:", error);
        return NextResponse.json(
            { error: "Error al crear sprint" },
            { status: 500 }
        );
    }
}
