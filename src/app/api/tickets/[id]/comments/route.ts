import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const createCommentSchema = z.object({
    content: z.string().min(1, "Comment cannot be empty"),
});

// GET: Fetch comments for a ticket
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const comments = await prisma.comment.findMany({
            where: { ticketId: id },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(comments);
    } catch (error) {
        console.error("Error fetching comments:", error);
        return NextResponse.json(
            { error: "Error fetching comments" },
            { status: 500 }
        );
    }
}

// POST: Create a new comment
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const validatedData = createCommentSchema.parse(body);

        const comment = await prisma.comment.create({
            data: {
                content: validatedData.content,
                ticketId: id,
                userId: session.user.id,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return NextResponse.json(comment);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const zodError = error as any;
            return NextResponse.json(
                { error: zodError.errors[0]?.message || "Invalid input" },
                { status: 400 }
            );
        }
        console.error("Error creating comment:", error);
        return NextResponse.json(
            { error: "Error creating comment" },
            { status: 500 }
        );
    }
}
