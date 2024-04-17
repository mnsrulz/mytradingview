import { Trade } from "@prisma/client"

export interface ITradeView extends Trade {
    averageProfitPerDay: number
    maximumProfit: number
    maximumRisk: number
    maxReturn: number
    maxAnnualizedReturn: number
    actualProfit: number
    actualAnnualizedReturn: number
    actualProfitPerDay: number
    remainingProfitPerDay: number
    buyCost: number,
    sellCost: number,
    isClosed: boolean,
    contractCurrentPrice?: number
}

export type StockPriceData = {
    quoteSummary: {
        price: {
            regularMarketPrice: number
        }
    }
}
