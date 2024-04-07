'use client';
import { Trade } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import dayjs from "dayjs";
import ky from "ky";
import { useCallback, useEffect, useState } from "react";

export interface ITradeView extends Trade {
    averageProfitPerDay: number
    maximumProfit: number
    maximumRisk: number
    maxReturn: number
    maxAnnualizedReturn: number
    actualProfit: number
    actualAnnualizedReturn: number
    actualProfitPerDay: number
    buyCost: number,
    sellCost: number,
    isClosed: boolean,
    contractCurrentPrice?: number
}

const mapTradeToView = (trade: Trade): ITradeView => {
    const sellCost = trade.contractType == 'PUT_SELL' ? (Number(trade.contractPrice) * 100 * trade.numberOfContracts) : 0;
    const buyCost = (trade.contractType == 'PUT_SELL' && trade.contractPriceAtClose) ? (Number(trade.contractPriceAtClose) * 100 * trade.numberOfContracts) : NaN;
    const maximumRisk = trade.contractType == 'PUT_SELL' ? (Number(trade.strikePrice) * 100 * trade.numberOfContracts) : 0;
    const maximumProfit = trade.contractType == 'PUT_SELL' ? (Number(trade.contractPrice) * 100 * trade.numberOfContracts) : 0;
    const tradeDays = dayjs(trade.contractExpiry).diff(trade.transactionStartDate, 'days') + 1;
    const actualTradeDays = trade.transactionEndDate ? (dayjs(trade.transactionEndDate).diff(trade.transactionStartDate, 'days') + 1) : NaN;
    const averageProfitPerDay = trade.contractType == 'PUT_SELL' ? maximumProfit / (tradeDays) : 0;
    const isClosed = trade.transactionEndDate ? true : false;
    const actualProfit = (trade.contractType == 'PUT_SELL' && isClosed) ? (sellCost - buyCost) : NaN;
    const maxReturn = trade.strikePrice ? maximumProfit / (Number(trade.strikePrice) * trade.numberOfContracts * 100) : 0;
    const maxAnnualizedReturn = (sellCost / maximumRisk) * (365 / tradeDays);
    const actualAnnualizedReturn = (actualProfit / maximumRisk) * (365 / actualTradeDays);
    const actualProfitPerDay = (actualProfit / actualTradeDays);
    return {
        ...trade,
        sellCost,
        buyCost,
        maximumRisk,
        maximumProfit,
        maxAnnualizedReturn,
        actualAnnualizedReturn,
        averageProfitPerDay,
        actualProfitPerDay,
        isClosed,
        maxReturn,
        actualProfit,
    }
}

export const useTrades = () => {
    const [trades, setTrades] = useState<ITradeView[]>([]);
    const loadTrades = () => ky('/api/trades').json<{ items: Trade[] }>().then(r => setTrades(r.items.map(mapTradeToView)));

    useEffect(() => {
        loadTrades();
    }, []);

    const deleteTrade = useCallback(async (deleteTradeId: string) => {
        await ky.delete(`/api/trades/${deleteTradeId}`);
        setTrades((v) => v.filter(t => t.id != deleteTradeId));
    }, [trades]);

    const reloadTrade = useCallback((id: string) => {
        const existingObject = trades.find(t => t.id == id);
        if (existingObject) {
            ky(`/api/trades/${id}`).json<Trade>().then(mapTradeToView).then(r => {
                Object.assign(existingObject, r);
            });
        }
    }, [trades]);
    return { trades, deleteTrade, reloadTrade };
};
