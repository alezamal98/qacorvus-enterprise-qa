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

        const logs = await prisma.activityLog.findMany({
            where: { projectId: id },
            orderBy: { createdAt: 'desc' },
            take: 20, // Limit to last 20 activities
            include: {
                user: {
                    select: { name: true }
                }
            }
        });

        return NextResponse.json(logs);
    } catch (error) {
        console.error("[ACTIVITY_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
