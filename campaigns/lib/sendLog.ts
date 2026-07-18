import { prisma } from "./db";

export async function createSendLog(
  campaignContactId: string,
  channel: string,
  status: string,
  errorMessage?: string
) {
  return prisma.sendLog.create({
    data: {
      campaignContactId,
      channel,
      status,
      errorMessage: errorMessage || null,
      sentAt: status === "sent" ? new Date() : null,
    },
  });
}

export async function updateSendLog(
  id: string,
  status: string,
  errorMessage?: string
) {
  return prisma.sendLog.update({
    where: { id },
    data: {
      status,
      errorMessage: errorMessage || null,
      sentAt: status === "sent" ? new Date() : null,
    },
  });
}
