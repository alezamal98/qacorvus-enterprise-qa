import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    // Create Admin User
    const adminPassword = await bcrypt.hash("admin12345.", 10);
    const admin = await prisma.user.upsert({
        where: { email: "admin@corvus.com" },
        update: { password: adminPassword },
        create: {
            email: "admin@corvus.com",
            name: "Admin CORVUS",
            password: adminPassword,
            role: "ADMIN",
        },
    });
    console.log("✅ Admin user created:", admin.email);

    // Create Dev User
    const devPassword = await bcrypt.hash("dev12345.", 10);
    const dev = await prisma.user.upsert({
        where: { email: "dev@corvus.com" },
        update: { password: devPassword },
        create: {
            email: "dev@corvus.com",
            name: "Developer QA",
            password: devPassword,
            role: "DEV",
        },
    });
    console.log("✅ Dev user created:", dev.email);

    // Create Sample Project
    const project = await prisma.project.upsert({
        where: { id: "demo-project-1" },
        update: {},
        create: {
            id: "demo-project-1",
            name: "Portal Web CORVUS v2.0",
            startDate: new Date("2026-01-20"),
            endDate: new Date("2026-03-20"),
            status: "ACTIVE",
            userId: admin.id,
        },
    });
    console.log("✅ Demo project created:", project.name);

    console.log("\n🎉 Seeding completed!");
    console.log("\n📝 Login credentials:");
    console.log("   Admin: admin@corvus.com / admin12345.");
    console.log("   Dev:   dev@corvus.com / dev12345.");
}

main()
    .catch((e) => {
        console.error("❌ Seed error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
