-- CreateEnum
CREATE TYPE "BotMode" AS ENUM ('DRY_RUN', 'LIVE');

-- CreateEnum
CREATE TYPE "BotStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'STOPPED');

-- CreateEnum
CREATE TYPE "BotDecisionStatus" AS ENUM ('SIMULATED', 'SUBMITTED', 'FILLED', 'REJECTED', 'FAILED');

-- CreateEnum
CREATE TYPE "BotEventType" AS ENUM ('STARTED', 'PAUSED', 'RESUMED', 'STOPPED', 'CIRCUIT_BREAKER_TRIPPED', 'ERROR');

-- AlterEnum
ALTER TYPE "BrokerType" ADD VALUE 'POLYMARKET';

-- CreateTable
CREATE TABLE "trading_bots" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "brokerAccountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "marketFilters" JSONB NOT NULL DEFAULT '{}',
    "mode" "BotMode" NOT NULL DEFAULT 'DRY_RUN',
    "status" "BotStatus" NOT NULL DEFAULT 'DRAFT',
    "riskConfig" JSONB NOT NULL DEFAULT '{"maxSessionLossPct": 5, "maxPositionSizeUsd": 100, "maxConcurrentPositions": 3}',
    "sessionStartEquity" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "currentEquity" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "circuitBreakerTrippedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trading_bots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bot_decisions" (
    "id" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "sizeUsd" DECIMAL(18,4) NOT NULL,
    "price" DECIMAL(10,6) NOT NULL,
    "reasoning" JSONB NOT NULL,
    "status" "BotDecisionStatus" NOT NULL DEFAULT 'SIMULATED',
    "pnl" DECIMAL(18,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bot_decisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bot_events" (
    "id" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "type" "BotEventType" NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bot_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "trading_bots_userId_idx" ON "trading_bots"("userId");

-- CreateIndex
CREATE INDEX "trading_bots_status_idx" ON "trading_bots"("status");

-- CreateIndex
CREATE INDEX "bot_decisions_botId_createdAt_idx" ON "bot_decisions"("botId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "bot_events_botId_createdAt_idx" ON "bot_events"("botId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "trading_bots" ADD CONSTRAINT "trading_bots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trading_bots" ADD CONSTRAINT "trading_bots_brokerAccountId_fkey" FOREIGN KEY ("brokerAccountId") REFERENCES "broker_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bot_decisions" ADD CONSTRAINT "bot_decisions_botId_fkey" FOREIGN KEY ("botId") REFERENCES "trading_bots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bot_events" ADD CONSTRAINT "bot_events_botId_fkey" FOREIGN KEY ("botId") REFERENCES "trading_bots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
