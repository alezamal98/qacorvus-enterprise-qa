import prisma from "@/lib/prisma";
import { NotificationType } from "@prisma/client";

interface CreateNotificationParams {
    userId: string;
    type: NotificationType;
    message: string;
    entityId?: string;
    link?: string;
}

/**
 * Creates an in-app notification for a user.
 * Call this from any API route when an event occurs.
 */
export async function createNotification({
    userId,
    type,
    message,
    entityId,
    link,
}: CreateNotificationParams) {
    try {
        await prisma.notification.create({
            data: {
                userId,
                type,
                message,
                entityId,
                link,
            },
        });
    } catch (error) {
        console.error("Failed to create notification:", error);
        // Don't throw - notifications are non-critical
    }
}

/**
 * Creates notifications for multiple users at once.
 */
export async function createBulkNotifications(
    userIds: string[],
    params: Omit<CreateNotificationParams, "userId">
) {
    try {
        await prisma.notification.createMany({
            data: userIds.map((userId) => ({
                userId,
                type: params.type,
                message: params.message,
                entityId: params.entityId,
                link: params.link,
            })),
        });
    } catch (error) {
        console.error("Failed to create bulk notifications:", error);
    }
}
