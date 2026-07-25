-- CreateTable
CREATE TABLE "InvitationCode" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "noi" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvitationCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InvitationCode_eventId_code_key" ON "InvitationCode"("eventId", "code");
