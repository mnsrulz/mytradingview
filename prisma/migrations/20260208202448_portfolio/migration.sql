-- CreateEnum
CREATE TYPE "Broker" AS ENUM ('ROBINHOOD', 'WEBULL', 'FIDELITY', 'THINKORSWIM', 'INTERACTIVE_BROKERS', 'TRADIER', 'OTHER');

-- CreateTable
CREATE TABLE "broker_accounts" (
    "id" TEXT NOT NULL,
    "broker" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "accountNumber" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "broker_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolio" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "brokerAccountId" TEXT NOT NULL,
    "costBasis" DECIMAL(65,30),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "broker_accounts_broker_accountName_key" ON "broker_accounts"("broker", "accountName");

-- CreateIndex
CREATE UNIQUE INDEX "portfolio_symbol_brokerAccountId_key" ON "portfolio"("symbol", "brokerAccountId");

-- AddForeignKey
ALTER TABLE "portfolio" ADD CONSTRAINT "portfolio_brokerAccountId_fkey" FOREIGN KEY ("brokerAccountId") REFERENCES "broker_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
