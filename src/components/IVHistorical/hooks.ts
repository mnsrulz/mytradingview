import { getHistoricalExpirationsBySymbol } from "@/lib/mzDataService";
import { OIExpirationsDataResponse } from "@/lib/types";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

export const availableSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX']; //for now, hardcode some symbols

export const useExpirations = (symbol: string) => {
    const [expirations, setExpirations] = useState<OIExpirationsDataResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expiration, setExpiration] = useState<string>('');
    const [strike, setStrike] = useState<number>(0);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const data = await getHistoricalExpirationsBySymbol(symbol);
            const next30day = dayjs().add(30, 'day');
            const nextMonthlyExpiration = data.find(k => k.isMonthly && dayjs(k.expiration) > next30day);
            setExpirations(data);
            setExpiration(nextMonthlyExpiration?.expiration || data[0]?.expiration || '');
            setIsLoading(false);

        };
        fetchData();
    }, [symbol]);

    useEffect(() => {
        const allStrikes = expirations.find(k => k.expiration == expiration)?.strikes || [];
        if (allStrikes.includes(strike)) return;
        const midIndexStrike = allStrikes.at(Math.abs(allStrikes.length / 2)) || 0;  //for now let's default it to mid index
        setStrike(midIndexStrike);
    }, [expiration]);

    return { isLoading, expirations, expiration, setExpiration, strike, setStrike };
}