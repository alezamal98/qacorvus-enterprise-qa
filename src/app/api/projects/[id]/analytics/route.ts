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

        // 1. Velocity: Tickets DONE per Sprint
        const sprints = await prisma.sprint.findMany({
            where: { projectId: id, status: "CLOSED" },
            include: {
                tickets: {
                    where: { status: "DONE" }
                }
            },
            orderBy: { endDate: 'asc' },
            take: 5 // Last 5 sprints
        });

        const velocity = sprints.map(s => ({
            name: `Sprint ${s.endDate.toLocaleDateString()}`, // Using date as simpler name for now
            completedTickets: s.tickets.length
        }));

        // 2. Bug Stats
        const bugs = await prisma.bug.findMany({
            where: {
                sprint: { projectId: id }
            }
        });

        const bugStats = {
            total: bugs.length,
            real: bugs.filter(b => b.status === "REAL").length,
            false: bugs.filter(b => b.status === "FALSE").length,
            pending: bugs.filter(b => b.status === "PENDING").length,
        };

        // 3. Team Allocation (Active Sprint)
        const activeSprint = await prisma.sprint.findFirst({
            where: { projectId: id, status: "OPEN" },
            include: {
                tickets: {
                    include: {
                        // Assuming tickets have assignments?
                        // The schema doesn't show direct ticket assignments to users, 
                        // only comments/bugs have user relations.
                        // I will skip this for now or infer from something else 
                        // if there was an 'assignedTo' field on Ticket.
                        // For now, let's just count bugs reported by users as a proxy for engagement
                        bugs: { include: { reportedBy: true } }
                    }
                },
                bugs: { include: { reportedBy: true } }
            }
        });

        // Quick fix: Use Bug Reports per user as "Allocation/Activity" proxy since Ticket Assignment isn't in schema
        const userActivityMap = new Map<string, number>();

        // Count bugs reported
        activeSprint?.bugs.forEach(b => {
            const name = b.reportedBy.name;
            userActivityMap.set(name, (userActivityMap.get(name) || 0) + 1);
        });

        const teamStats = Array.from(userActivityMap.entries()).map(([name, count]) => ({
            name,
            count
        }));


        return NextResponse.json({
            velocity,
            bugStats,
            teamStats
        });

    } catch (error) {
        console.error("[ANALYTICS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
