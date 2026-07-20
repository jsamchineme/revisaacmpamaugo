import { prisma } from "../lib/db";
import bcrypt from "bcryptjs";

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: "admin@campaigns.local" },
  });

  if (!existing) {
    const hashedPassword = await bcrypt.hash("admin123", 12);

    await prisma.user.create({
      data: {
        name: "Admin",
        email: "admin@campaigns.local",
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    console.log("Admin user created: admin@campaigns.local / admin123");
  } else {
    console.log("Admin user already exists, skipping.");
  }

  await prisma.setting.createMany({
    data: [
      { key: "featuredEventId", value: "" },
      { key: "fallbackUrl", value: "" },
    ],
    skipDuplicates: true,
  });

  console.log("Default settings ensured.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
