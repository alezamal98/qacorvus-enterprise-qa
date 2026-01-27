import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkUsers() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
        },
    });
    console.log("Users in database:", JSON.stringify(users, null, 2));

    const projects = await prisma.project.findMany({
        select: {
            id: true,
            name: true,
            status: true,
        },
    });
    console.log("Projects in database:", JSON.stringify(projects, null, 2));
}

checkUsers()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
