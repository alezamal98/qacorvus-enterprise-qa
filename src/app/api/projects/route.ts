import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const createProjectSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    startDate: z.string().transform((str) => new Date(str)),
    endDate: z.string().transform((str) => new Date(str)),
});

// GET all projects (filtered by role)
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        // Role-based filtering: DEVs see only their projects, ADMINs see all
        const whereClause = session.user.role === "ADMIN"
            ? { deleted: false }
            : {
                deleted: false,
                OR: [
                    { userId: session.user.id },  // Created by user
                    { assignedUsers: { some: { userId: session.user.id } } }  // Assigned to user
                ]
            };

        const projects = await prisma.project.findMany({
            where: whereClause,
            include: {
                createdBy: {
                    select: { name: true, email: true },
                },
                sprints: {
                    where: { status: "OPEN" },
                    select: { id: true, name: true },
                },
                _count: {
                    select: { sprints: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(projects);
    } catch (error) {
        console.error("Error fetching projects:", error);
        return NextResponse.json(
            {
                error: "Error al obtener proyectos",
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}

// POST create new project
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = createProjectSchema.parse(body);

        const project = await prisma.project.create({
            data: {
                name: validatedData.name,
                startDate: validatedData.startDate,
                endDate: validatedData.endDate,
                userId: session.user.id,
            },
            include: {
                createdBy: {
                    select: { name: true, email: true },
                },
            },
        });

        return NextResponse.json(project, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            const message = error.issues[0]?.message ?? "Invalid input";
            return NextResponse.json(
                { error: message },
                { status: 400 }
            );
        }
        console.error("Error creating project:", error);
        return NextResponse.json(
            { error: "Error al crear proyecto" },
            { status: 500 }
        );
    }
}

