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

export type PositionPricing = Position & { price: number, change: number, changePercent: number, totalValue: number };
export const usePortfolio = () => {
    const [accounts, setAccounts] = useState<BrokerAccount[]>([])
    const [positions, setPositions] = useState<Position[]>([])

    const [isLoading, setIsLoading] = useState(true);

    const fetchAccounts = async () => {
        const res = await apiClient('/api/portfolio/accounts').json<{ items: BrokerAccount[] }>();
        setAccounts(res.items);
    }

    const fetchPositions = async () => {
        const res = await apiClient('/api/portfolio/positions').json<{ items: Position[] }>();
        setPositions(res.items);
    }

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

    useEffect(() => {
        setIsLoading(true);
        const promises = [fetchAccounts(), fetchPositions()];
        Promise.all(promises).then(() => setIsLoading(false));
    }, []);

    const uniqueSymbols = useMemo(() => [... new Set(positions.map(p => p.symbol))], [positions]);
    const priceMap = useStockPrice(uniqueSymbols);

    // Merge pricing into positions
    const positionsWithLivePrice = useMemo(() => {
        return positions.map((pos) => ({
            ...pos,
            // Embed the live data directly
            price: priceMap[pos.symbol]?.price || 0,
            change: priceMap[pos.symbol]?.change || 0,
            changePercent: priceMap[pos.symbol]?.changePercent || 0,
            totalValue: priceMap[pos.symbol]?.price * pos.quantity
        }));
    }, [positions, priceMap]);

    return { accounts, positions: positionsWithLivePrice, isLoading, reloadAccounts: fetchAccounts, reloadPositions: fetchPositions, addAccount, addPosition, updatePosition, deletePosition };
};