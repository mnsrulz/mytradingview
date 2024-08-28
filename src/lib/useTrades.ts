'use client';
import { Trade } from "@prisma/client";
import dayjs from "dayjs";
import ky from "ky";
import { useCallback, useEffect, useState } from "react";
import { ITradeView } from "./types";

const SellContracts = ['PUT_SELL', 'CALL_SELL'];

export const mapTradeToView = (trade: Trade): ITradeView => {
    const isSellContract = SellContracts.includes(trade.contractType);
    const sellCost = isSellContract ? (Number(trade.contractPrice) * 100 * trade.numberOfContracts) : 0;
    const buyCost = (isSellContract && trade.contractPriceAtClose) ? (Number(trade.contractPriceAtClose) * 100 * trade.numberOfContracts) : NaN;
    const maximumRisk = isSellContract ? (Number(trade.strikePrice) * 100 * trade.numberOfContracts) : 0;
    const maximumProfit = isSellContract ? (Number(trade.contractPrice) * 100 * trade.numberOfContracts) : 0;
    const isClosed = trade.transactionEndDate ? true : false;

    // const tradeDaysAsOfToday = dayjs(trade.contractExpiry).diff(dayjs(), 'days') + 1;
    const estimatedBuyCost = (isSellContract && trade.lastContractPrice) ? (Number(trade.lastContractPrice) * 100 * trade.numberOfContracts) : NaN;
    // const estimatedProfitAsOfToday = (trade.contractType == 'PUT_SELL' && !isClosed) ? (sellCost - buyCost) : NaN;

    const tradeDays = dayjs(trade.contractExpiry).diff(trade.transactionStartDate, 'days') + 1;
    const actualTradeDays = dayjs(trade.transactionEndDate || dayjs()).diff(trade.transactionStartDate, 'days') + 1;
    const averageProfitPerDay = isSellContract ? maximumProfit / (tradeDays) : 0;
    const actualProfit = isSellContract ? (sellCost - (isClosed ? buyCost : estimatedBuyCost)) : NaN;
    const maxReturn = trade.strikePrice ? maximumProfit / (Number(trade.strikePrice) * trade.numberOfContracts * 100) : 0;
    const maxAnnualizedReturn = (sellCost / maximumRisk) * (365 / tradeDays);
    const actualAnnualizedReturn = (actualProfit / maximumRisk) * (365 / actualTradeDays);
    const actualProfitPerDay = (actualProfit / actualTradeDays);
    const remainingProfitPerDay = actualProfit > 0 ? ((maximumProfit - actualProfit) / (tradeDays - actualTradeDays)) : NaN;

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
        remainingProfitPerDay
    }
}

export const useTrades = () => {
    const [trades, setTrades] = useState<ITradeView[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const loadTrades = () => ky('/api/trades').json<{ items: Trade[] }>().then(r => setTrades(r.items.map(mapTradeToView))).finally(() => setIsLoading(false));

    useEffect(() => {
        loadTrades();
        const interval = setInterval(() => loadTrades(), 60000);    //load every one minute??
        return () => {
            clearInterval(interval);
        }
    }, []);

    const deleteTrade = useCallback(async (deleteTradeId: string) => {
        await ky.delete(`/api/trades/${deleteTradeId}`);
        setTrades((v) => v.filter(t => t.id != deleteTradeId));
    }, []);

    const reloadTrade = useCallback((id: string) => {
        const existingObject = trades.find(t => t.id == id);
        if (existingObject) {
            ky(`/api/trades/${id}`).json<Trade>().then(mapTradeToView).then(r => {
                Object.assign(existingObject, r);
            });
        }
    }, [trades]);
    return { trades, deleteTrade, reloadTrade, isLoading };
};