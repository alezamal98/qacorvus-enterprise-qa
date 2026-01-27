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

// GET all projects
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const projects = await prisma.project.findMany({
            where: { deleted: false },
            include: {
                createdBy: {
                    select: { name: true, email: true },
                },
                sprints: {
                    where: { status: "OPEN" },
                    select: { id: true },
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
            { error: "Error al obtener proyectos" },
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
            const zodError = error as any;
            return NextResponse.json(
                { error: zodError.errors[0]?.message || "Invalid input" },
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
