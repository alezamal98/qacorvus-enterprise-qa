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

        const meetings = await prisma.meeting.findMany({
            where: {
                projectId: id,
            },
            orderBy: {
                date: 'desc',
            },
            include: {
                createdBy: {
                    select: {
                        name: true,
                        email: true,
                    }
                }
            }
        });

        return NextResponse.json(meetings);
    } catch (error) {
        console.error("[PROJECT_MEETINGS_GET]", error);
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

        const { id } = await params;
        const body = await request.json();
        const { title, date, notes, nextSteps, attendees } = body;

        if (!title || !date) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const project = await prisma.project.findUnique({
            where: { id, deleted: false }
        });

        if (!project) {
            return new NextResponse("Project not found", { status: 404 });
        }

        const meeting = await prisma.meeting.create({
            data: {
                title,
                date: new Date(date),
                notes,
                nextSteps,
                attendees,
                projectId: id,
                userId: session.user.id,
            },
        });

        return NextResponse.json(meeting);
    } catch (error) {
        console.error("[PROJECT_MEETINGS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
