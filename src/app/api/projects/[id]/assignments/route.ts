import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET assigned users for a project
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { id } = await params;

        const assignments = await prisma.projectAssignment.findMany({
            where: { projectId: id },
            include: {
                user: {
                    select: { id: true, name: true, email: true, role: true }
                }
            }
        });

        return NextResponse.json(assignments.map(a => a.user));
    } catch (error) {
        console.error("Error fetching assignments:", error);
        return NextResponse.json(
            { error: "Error al obtener asignaciones" },
            { status: 500 }
        );
    }
}

// POST assign a user to a project
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { id } = await params;
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json(
                { error: "userId es requerido" },
                { status: 400 }
            );
        }

        const assignment = await prisma.projectAssignment.create({
            data: {
                projectId: id,
                userId: userId,
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        return NextResponse.json(assignment, { status: 201 });
    } catch (error) {
        console.error("Error creating assignment:", error);
        return NextResponse.json(
            { error: "Error al asignar usuario" },
            { status: 500 }
        );
    }
}

// DELETE remove a user from a project
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { id } = await params;
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json(
                { error: "userId es requerido" },
                { status: 400 }
            );
        }

        await prisma.projectAssignment.deleteMany({
            where: {
                projectId: id,
                userId: userId,
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error removing assignment:", error);
        return NextResponse.json(
            { error: "Error al remover usuario" },
            { status: 500 }
        );
    }
}
