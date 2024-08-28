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
    item: SearchTickerItem,
    quoteSummary: {
        marketState: 'POST' | 'REGULAR' | 'POSTPOST' | 'PRE',
        hasPrePostMarketData: boolean,
        regularMarketPrice: number,
        regularMarketChange: number,
        regularMarketChangePercent: number,
        postMarketPrice: number,
        postMarketChange: number,
        postMarketChangePercent: number,
        preMarketPrice: number,
        preMarketChange: number,
        preMarketChangePercent: number
    }
}

export type IOptionsGrid = {
    id: string
}

export type NumberRange = { start: number, end: number }


export type OptionsInnerData = {
    c: Record<string, {
        a: number,
        b: number,
        l: number,
        oi: number,
        v: number
    }>,
    p: Record<string, {
        a: number,
        b: number,
        l: number,
        oi: number,
        v: number
    }>
}

export type SearchTickerResult = { items: SearchTickerItem[] };
export type SearchTickerItem = { symbol: string, name: string }
export type AddTickerToMyListResult = { success: boolean }