import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET single project
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

        const project = await prisma.project.findUnique({
            where: { id, deleted: false },
            include: {
                createdBy: {
                    select: { name: true, email: true },
                },
                sprints: {
                    orderBy: { createdAt: "desc" },
                    include: {
                        tickets: {
                            orderBy: { createdAt: "asc" },
                        },
                        bugs: {
                            include: {
                                reportedBy: {
                                    select: { name: true },
                                },
                                ticket: {
                                    select: { title: true },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!project) {
            return NextResponse.json(
                { error: "Proyecto no encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json(project);
    } catch (error) {
        console.error("Error fetching project:", error);
        return NextResponse.json(
            { error: "Error al obtener proyecto" },
            { status: 500 }
        );
    }
}

// DELETE (soft delete) project
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        // Only ADMIN can delete projects
        if (session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Solo administradores pueden eliminar proyectos" },
                { status: 403 }
            );
        }

        const { id } = await params;

        await prisma.project.update({
            where: { id },
            data: { deleted: true },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting project:", error);
        return NextResponse.json(
            { error: "Error al eliminar proyecto" },
            { status: 500 }
        );
    }
}
