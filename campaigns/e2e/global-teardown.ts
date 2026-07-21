import { loadEnv } from "./loadEnv";

async function globalTeardown() {
  loadEnv();
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
}

export default globalTeardown;
