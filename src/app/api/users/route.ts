import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET all DEV users (for assignment dropdown)
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const users = await prisma.user.findMany({
            where: { role: "DEV" },
            select: {
                id: true,
                name: true,
                email: true,
            },
            orderBy: { name: "asc" }
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { error: "Error al obtener usuarios" },
            { status: 500 }
        );
    }
}
