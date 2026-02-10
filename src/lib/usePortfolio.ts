'use client';
import ky from "ky";
import { useEffect, useState } from "react";
import { BrokerAccount, Position, PositionPayload } from "./types";


export const usePortfolio = () => {
    const [accounts, setAccounts] = useState<BrokerAccount[]>([])
    const [positions, setPositions] = useState<Position[]>([])

    const [isLoading, setIsLoading] = useState(true);

    const fetchAccounts = async () => {
        const res = await ky('/api/portfolio/accounts').json<{ items: BrokerAccount[] }>();
        setAccounts(res.items);
    }

    const fetchPositions = async () => {
        const res = await ky('/api/portfolio/positions').json<{ items: Position[] }>();
        setPositions(res.items);
    }

    const addAccount = async (broker: string, accountName: string, accountNumber?: string) => {
        return ky.post('/api/portfolio/accounts', {
            json: {
                broker,
                accountName,
                accountNumber: accountNumber || undefined,
            }
        });
    }

    const updatePosition = async (positionId: string, payload: PositionPayload) => {
        return ky.patch(`/api/portfolio/positions/${positionId}`, {
            json: payload
        });           
    }

    const deletePosition = async (positionId: string) => {
        return ky.delete(`/api/portfolio/positions/${positionId}`);
    }

    const addPosition = async (payload: PositionPayload) => {
        return ky.post('/api/portfolio/positions', {
            json: payload
        });
    }

    useEffect(() => {
        setIsLoading(true);
        const promises = [fetchAccounts(), fetchPositions()];
        Promise.all(promises).then(() => setIsLoading(false));
    }, []);

    return { accounts, positions, isLoading, reloadAccounts: fetchAccounts, reloadPositions: fetchPositions, addAccount, addPosition, updatePosition, deletePosition };
};