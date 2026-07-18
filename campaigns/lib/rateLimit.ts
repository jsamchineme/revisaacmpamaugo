import { prisma } from "./db";

export interface RateLimitResult {
  blocked: boolean;
  retryAfter?: number;
}

export async function checkRateLimit(
  ip: string,
  endpoint: string,
  maxAttempts: number,
  windowMs: number
): Promise<RateLimitResult> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);

  const existing = await prisma.rateLimit.findUnique({
    where: {
      ip_endpoint: {
        ip,
        endpoint,
      },
    },
  });

  if (existing && existing.windowStart > windowStart) {
    // Within the current window — increment count
    const updated = await prisma.rateLimit.update({
      where: { id: existing.id },
      data: { count: { increment: 1 } },
    });

    if (updated.count > maxAttempts) {
      const retryAfter = Math.ceil(
        (existing.windowStart.getTime() + windowMs - now.getTime()) / 1000
      );
      return { blocked: true, retryAfter: Math.max(0, retryAfter) };
    }

    return { blocked: false };
  }

  // Outside window or no record — create new row
  await prisma.rateLimit.upsert({
    where: {
      ip_endpoint: {
        ip,
        endpoint,
      },
    },
    update: {
      count: 1,
      windowStart: now,
    },
    create: {
      ip,
      endpoint,
      count: 1,
      windowStart: now,
    },
  });

  return { blocked: false };
}
