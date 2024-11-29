import { getHistoricalSnapshotsBySymbol } from "@/lib/mzDataService";
import { Box, FormControl, Grid, InputLabel, LinearProgress, MenuItem, Select } from "@mui/material"
import { useEffect, useState } from "react";
import { HistoricalSnapshotView } from "./HistoricalSnapshotView";
import collect from 'collect.js';

export const HistoryBySymbol = (props: { symbols: string[] }) => {
    const { symbols } = props;
    const [symbol, setSymbol] = useState(symbols[0]);
    const [isLoading, setIsLoading] = useState(true);
    const [snapshots, setSnapshots] = useState<{ assetUrl: string, key: string }[]>([]);// 
    useEffect(() => {
        setIsLoading(true);
        getHistoricalSnapshotsBySymbol(symbol)
            .then(r => setSnapshots(r.items.map(k => ({ assetUrl: k.dex.hdAssetUrl, key: k.date }))))
            .finally(() => setIsLoading(false));
    }, [symbol]);
    return <Box>
        <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
            <InputLabel>Symbols</InputLabel>
            <Select
                id="symbol"
                value={symbol}
                label="Symbol"
                onChange={(e) => setSymbol(e.target.value)}
            >
                {
                    symbols.map(c => {
                        return <MenuItem key={c} value={c}>{c}</MenuItem>
                    })
                }
            </Select>
        </FormControl>
        <HistoricalSnapshotView isLoading={isLoading} key={symbol} items={collect(snapshots).sortByDesc('key').all()} />        
    </Box>
}