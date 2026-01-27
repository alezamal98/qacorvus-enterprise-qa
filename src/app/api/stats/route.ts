import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        // Get all KPI stats
        const [
            totalActiveProjects,
            totalCriticalBugs,
            totalSolvedBugs,
            recentBugs,
            bugsByPriority,
            ticketsByStatus
        ] = await Promise.all([
            // Total active projects
            prisma.project.count({
                where: { status: "ACTIVE", deleted: false },
            }),
            // Total critical bugs (historical)
            prisma.bug.count({
                where: { priority: "CRITICAL" },
            }),
            // Total solved bugs (marked as REAL)
            prisma.bug.count({
                where: { status: "REAL" },
            }),
            // Recent bugs for trend
            prisma.bug.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
                include: {
                    reportedBy: {
                        select: { name: true },
                    },
                    sprint: {
                        select: {
                            project: {
                                select: { name: true },
                            },
                        },
                    },
                },
            }),
            // Bugs by Priority
            prisma.bug.groupBy({
                by: ['priority'],
                _count: { priority: true },
            }),
            // Tickets by Status
            prisma.ticket.groupBy({
                by: ['status'],
                _count: { status: true },
            }),
        ]);

        return NextResponse.json({
            totalActiveProjects,
            totalCriticalBugs,
            totalSolvedBugs,
            recentBugs,
            bugsByPriority,
            ticketsByStatus
        });
    } catch (error) {
        console.error("Error fetching stats:", error);
        return NextResponse.json(
            { error: "Error al obtener estadísticas" },
            { status: 500 }
        );
    }
}
