-- CreateTable
CREATE TABLE "trades" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "numberOfContracts" INTEGER NOT NULL,
    "transactionStartDate" DATE NOT NULL,
    "transactionEndDate" DATE,
    "strikePrice" DECIMAL(65,30) NOT NULL,
    "contractPrice" DECIMAL(65,30) NOT NULL,
    "contractType" TEXT NOT NULL,
    "contractExpiry" DATE NOT NULL,
    "approxStockPriceAtPurchase" DECIMAL(65,30),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trades_pkey" PRIMARY KEY ("id")
);
