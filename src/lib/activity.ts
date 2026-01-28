import prisma from "@/lib/prisma";
import { ActivityType, ActivityAction } from "@prisma/client";

interface LogActivityParams {
    projectId: string;
    userId: string;
    entityType: ActivityType;
    entityId: string;
    action: ActivityAction;
    details: string;
}

export async function logActivity({
    projectId,
    userId,
    entityType,
    entityId,
    action,
    details,
}: LogActivityParams) {
    try {
        await prisma.activityLog.create({
            data: {
                projectId,
                userId,
                entityType,
                entityId,
                action,
                details,
            },
        });
    } catch (error) {
        console.error("Failed to log activity:", error);
        // Don't throw, we don't want to block the main action if logging fails
    }
}
