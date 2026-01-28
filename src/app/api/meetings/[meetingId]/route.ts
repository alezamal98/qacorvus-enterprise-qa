import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ meetingId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { meetingId } = await params;

        await prisma.meeting.delete({
            where: { id: meetingId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[MEETING_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
