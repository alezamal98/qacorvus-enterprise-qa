import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET all epics for a project
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;

        const epics = await prisma.epic.findMany({
            where: { projectId: id },
            include: {
                tickets: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Calculate progress for each epic
        const epicsWithProgress = epics.map(epic => {
            const total = epic.tickets.length;
            const done = epic.tickets.filter(t => t.status === 'DONE').length;
            const progress = total > 0 ? Math.round((done / total) * 100) : 0;

            return {
                ...epic,
                ticketCount: total,
                completedCount: done,
                progress,
            };
        });

        return NextResponse.json(epicsWithProgress);
    } catch (error) {
        console.error("[EPICS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// POST - Create a new epic
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { title, description, dueDate, status } = body;

        if (!title) {
            return new NextResponse("Title is required", { status: 400 });
        }

        const epic = await prisma.epic.create({
            data: {
                title,
                description,
                dueDate: dueDate ? new Date(dueDate) : null,
                status: status || 'PLANNING',
                projectId: id,
            },
        });

        return NextResponse.json(epic);
    } catch (error) {
        console.error("[EPICS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
