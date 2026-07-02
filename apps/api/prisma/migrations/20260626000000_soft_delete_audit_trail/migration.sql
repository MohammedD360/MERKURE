-- Soft-delete + audit trail (RGPD)
-- Ajoute deletedAt sur Trade et BrokerAccount, crée la table audit_logs.

-- Trade : colonne soft-delete + index composite
ALTER TABLE "trades" ADD COLUMN "deletedAt" TIMESTAMP(3);
CREATE INDEX "trades_userId_deletedAt_idx" ON "trades"("userId", "deletedAt");

-- BrokerAccount : colonne soft-delete (isActive conservé pour compatibilité)
ALTER TABLE "broker_accounts" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- Table audit_logs
CREATE TABLE "audit_logs" (
    "id"          TEXT NOT NULL,
    "entityType"  TEXT NOT NULL,
    "entityId"    TEXT NOT NULL,
    "action"      TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata"    JSONB,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "audit_logs_performedBy_fkey"
        FOREIGN KEY ("performedBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");
CREATE INDEX "audit_logs_performedBy_idx"          ON "audit_logs"("performedBy");
