-- DropIndex
DROP INDEX "Watchlist_symbol_key";

-- AlterTable
ALTER TABLE "Watchlist" ADD CONSTRAINT "Watchlist_pkey" PRIMARY KEY ("symbol");
