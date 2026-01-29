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

        const isAdmin = session.user.role === "ADMIN";
        const userId = session.user.id;

        // Project filter for role-based access
        const projectFilter = isAdmin
            ? { deleted: false }
            : {
                deleted: false,
                OR: [
                    { userId },
                    { assignedUsers: { some: { userId } } }
                ]
            };

        // Sprint filter (via project) for role-based access
        const sprintFilter = isAdmin
            ? {}
            : {
                project: {
                    OR: [
                        { userId },
                        { assignedUsers: { some: { userId } } }
                    ]
                }
            };

        // Get all KPI stats with role-based filtering
        const [
            totalActiveProjects,
            totalCriticalBugs,
            totalSolvedBugs,
            recentBugs,
            bugsByPriority,
            ticketsByStatus
        ] = await Promise.all([
            // Total active projects (filtered)
            prisma.project.count({
                where: { ...projectFilter, status: "ACTIVE" },
            }),
            // Total critical bugs (filtered)
            prisma.bug.count({
                where: { priority: "CRITICAL", sprint: sprintFilter },
            }),
            // Total solved bugs (marked as REAL, filtered)
            prisma.bug.count({
                where: { status: "REAL", sprint: sprintFilter },
            }),
            // Recent bugs for trend (filtered)
            prisma.bug.findMany({
                where: { sprint: sprintFilter },
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
            // Bugs by Priority (filtered)
            prisma.bug.groupBy({
                by: ['priority'],
                where: { sprint: sprintFilter },
                _count: { priority: true },
            }),
            // Tickets by Status (filtered)
            prisma.ticket.groupBy({
                by: ['status'],
                where: { sprint: sprintFilter },
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
            {
                error: "Error al obtener estadísticas",
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
