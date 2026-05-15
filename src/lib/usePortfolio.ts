'use client';
import ky from "ky";
import { useEffect, useMemo, useState } from "react";
import { BrokerAccount, Position, PositionPayload } from "./types";
import { useStockPrice } from "./socket";

const apiClient = ky.create({
    hooks: {
        beforeError: [
            async (error) => {
                const { response } = error;
                if (response && response.body) {
                    const data = await response.json<{ error: string }>();
                    error.message = data.error || error.message;
                }
                return error;
            }
        ]
    }
});

const addAccount = async (broker: string, accountName: string, accountNumber?: string) => {
    return apiClient.post('/api/portfolio/accounts', {
        json: {
            broker,
            accountName,
            accountNumber: accountNumber || undefined,
        }
    });
}

const updatePosition = async (positionId: string, payload: PositionPayload) => {
    return apiClient.patch(`/api/portfolio/positions/${positionId}`, {
        json: payload
    });
}

const deletePosition = async (positionId: string) => {
    return apiClient.delete(`/api/portfolio/positions/${positionId}`);
}

const addPosition = async (payload: PositionPayload) => {
    return apiClient.post('/api/portfolio/positions', {
        json: payload
    });
}

export type PositionPricing = Position & { price: number, change: number, changePercent: number, totalValue: number };

export type AggregatedPosition = {
    symbol: string;
    totalQuantity: number;
    totalCostBasis: number;
    accounts: Array<{ id: string; brokerAccountId: string; quantity: number; costBasis: number | null; notes: string | null, rawPosition: Position, accountName: string }>;
    price: number;
    change: number;
    changePercent: number;
    totalValue: number;
    weightedAverageCostBasis: number;
    todaysValueChange: number;
    totalValueChange: number;
};

const aggregatePositionsBySymbol = (positions: Position[], filterAccountId: string, accounts: BrokerAccount[]): Omit<AggregatedPosition, 'price' | 'change' | 'changePercent' | 'totalValue'>[] => {
    const filteredPositions = filterAccountId ? positions.filter(k => k.brokerAccountId === filterAccountId) : positions;
    const grouped = filteredPositions.reduce((acc, pos) => {
        if (!acc[pos.symbol]) {
            acc[pos.symbol] = [];
        }
        acc[pos.symbol].push(pos);
        return acc;
    }, {} as Record<string, Position[]>);

    const accountsMap = Object.fromEntries(accounts.map(k => [k.id, k.accountName]));

    return Object.entries(grouped).map(([symbol, positionsForSymbol]) => {
        const totalQuantity = positionsForSymbol.reduce((sum, p) => sum + p.quantity, 0);
        const totalCostBasis = positionsForSymbol.reduce((sum, p) => sum + ((p.costBasis || 0) * p.quantity), 0);
        const weightedAverageCostBasis = totalQuantity > 0 ? totalCostBasis / totalQuantity : 0;

        return {
            symbol,
            totalQuantity,
            totalCostBasis,
            accounts: positionsForSymbol.map(p => ({
                id: p.id,
                brokerAccountId: p.brokerAccountId,
                quantity: p.quantity,
                costBasis: p.costBasis,
                notes: p.notes,
                rawPosition: p,
                accountName: accountsMap[p.brokerAccountId] ?? 'UNKNOWN'
            })),
            weightedAverageCostBasis,
            todaysValueChange: 0,
            totalValueChange: 0
        } as AggregatedPosition;
    });
};

export const usePortfolio = () => {
    const [accounts, setAccounts] = useState<BrokerAccount[]>([])
    const [positions, setPositions] = useState<Position[]>([])
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');

    const [isLoading, setIsLoading] = useState(true);

    const fetchAccounts = async () => {
        const res = await apiClient('/api/portfolio/accounts').json<{ items: BrokerAccount[] }>();
        setAccounts(res.items);
    }

    const fetchPositions = async () => {
        const res = await apiClient('/api/portfolio/positions').json<{ items: Position[] }>();
        setPositions(res.items);
    }

    const changeAccountFilter = (accountId: string) => setSelectedAccountId(accountId);

    useEffect(() => {
        setIsLoading(true);
        const promises = [fetchAccounts(), fetchPositions()];
        Promise.all(promises).then(() => setIsLoading(false));
    }, []);

    const uniqueSymbols = useMemo(() => [... new Set(positions.map(p => p.symbol))], [positions]);
    const priceMap = useStockPrice(uniqueSymbols);

    const aggregatedBase = useMemo(() => {
        return aggregatePositionsBySymbol(positions, selectedAccountId, accounts);
    }, [positions, selectedAccountId, accounts]);

    const aggregatedPositions = useMemo(() => {
        const p = aggregatedBase.map((agg) => ({
            ...agg,
            price: priceMap[agg.symbol]?.price || 0,
            change: priceMap[agg.symbol]?.change || 0,
            changePercent: priceMap[agg.symbol]?.changePercent || 0,
            totalValue: (priceMap[agg.symbol]?.price || 0) * agg.totalQuantity,
            todaysValueChange: (priceMap[agg.symbol]?.change || 0) * agg.totalQuantity,
            totalValueChange: ((priceMap[agg.symbol]?.price || 0) * agg.totalQuantity) - agg.totalCostBasis,
            portfolioWeight: 0
        }));

        const totalPortfolioValue = p.reduce((acc, c) => acc + c.totalValue, 0);

        p.forEach(element => {
            element.portfolioWeight = (element.totalValue / totalPortfolioValue);
        });

        return p;
    }, [aggregatedBase, priceMap]);

    return { accounts, aggregatedPositions, isLoading, reloadAccounts: fetchAccounts, reloadPositions: fetchPositions, addAccount, addPosition, updatePosition, deletePosition, selectedAccountId, changeAccountFilter };
};