import { loadEnv } from "./loadEnv";

async function globalSetup() {
  loadEnv();
  const bcrypt = await import("bcryptjs");
  const { prisma } = await import("@/lib/db");

  await prisma.registration.deleteMany({
    where: {
      OR: [
        { email: { contains: "e2e-" } },
        { phone: { in: ["+2348011111111", "+2348044444444", "+2348066666666"] } },
      ],
    },
  });

  await prisma.rateLimit.deleteMany({
    where: {
      endpoint: { in: ["rsvp", "login"] },
    },
  });

  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@campaigns.local" },
  });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: "Admin",
        email: "admin@campaigns.local",
        password: await bcrypt.hash("admin123", 12),
        role: "ADMIN",
      },
    });
  }
}

export default globalSetup;
