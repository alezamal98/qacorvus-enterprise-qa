import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

        // Fetch CLOSED sprints with their retro items
        const sprints = await prisma.sprint.findMany({
            where: {
                projectId: id,
                status: "CLOSED",
            },
            include: {
                retroItems: {
                    include: {
                        user: {
                            select: { name: true }
                        }
                    }
                }
            },
            orderBy: {
                endDate: 'desc'
            }
        });

        return NextResponse.json(sprints);
    } catch (error) {
        console.error("[RETROSPECTIVES_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await request.json();
        const { sprintId, type, content } = body;

        if (!sprintId || !type || !content) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const item = await prisma.retroItem.create({
            data: {
                sprintId,
                type,
                content,
                userId: session.user.id
            },
            include: {
                user: {
                    select: { name: true }
                }
            }
        });

        return NextResponse.json(item);

    } catch (error) {
        console.error("[RETROSPECTIVES_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
