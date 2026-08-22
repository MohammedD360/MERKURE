-- CreateTable
CREATE TABLE "strategy_analyses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "instrument" TEXT NOT NULL,
    "timeframe" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "style" TEXT NOT NULL,
    "entryPrice" DECIMAL(18,6),
    "stopLoss" DECIMAL(18,6),
    "takeProfit" DECIMAL(18,6),
    "thesis" TEXT,
    "score" INTEGER NOT NULL,
    "headline" TEXT NOT NULL,
    "aiReading" TEXT NOT NULL,
    "controls" JSONB NOT NULL,
    "criteria" JSONB NOT NULL,
    "advice" JSONB NOT NULL,
    "decision" JSONB NOT NULL,
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "strategy_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "strategy_analyses_userId_idx" ON "strategy_analyses"("userId");

-- AddForeignKey
ALTER TABLE "strategy_analyses" ADD CONSTRAINT "strategy_analyses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
