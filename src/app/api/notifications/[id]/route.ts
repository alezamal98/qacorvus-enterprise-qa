import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;

        await prisma.notification.delete({
            where: {
                id,
                userId: session.user.id, // Ensure ownership
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[NOTIFICATION_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
