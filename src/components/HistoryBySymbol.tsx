import { getHistoricalSnapshotsBySymbol } from "@/lib/mzDataService";
import { Box, FormControl, TextField, Autocomplete, InputLabel, MenuItem, Select } from "@mui/material"
import { useEffect, useState } from "react";
import { HistoricalSnapshotView } from "./HistoricalSnapshotView";
import collect from 'collect.js';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import { parseAsStringLiteral, useQueryState } from 'nuqs';

const modes = ['DEX', 'GEX'];
export const HistoryBySymbol = (props: { symbols: string[] }) => {
    const { symbols } = props;
    const [symbol, setSymbol] = useState(symbols[0]);
    const [isLoading, setIsLoading] = useState(true);
    const [snapshots, setSnapshots] = useState<{ assetUrl: string, key: string }[]>([]);// 
    const [mode, setMode] = useQueryState('mode', parseAsStringLiteral(modes).withDefault(modes.at(0) || ''));
    useEffect(() => {
        if (!symbol) return;
        setIsLoading(true);
        getHistoricalSnapshotsBySymbol(symbol)
            .then(r => setSnapshots(r.items.map(k => ({ assetUrl: mode == 'GEX' ? k.gex.hdAssetUrl : k.dex.hdAssetUrl, key: k.date }))))
            .finally(() => setIsLoading(false));
    }, [symbol, mode]);
    return <Box>
        <Box display="flex">            
            <FormControl sx={{ mr: 1, minWidth: 125 }} size="small">
                <Autocomplete
                    // sx={{ width: 300 }}
                    options={symbols}
                    value={symbol}
                    getOptionLabel={(option) => option}
                    onChange={(ev, value) => {
                        setSymbol(value || '');
                    }}
                    disableClearable
                    renderInput={(params) => (
                        <TextField sx={{ m: 0, p: 0 }} {...params} label="Symbol" margin="normal" size="small" variant="outlined" />
                    )}
                    renderOption={(props, option, { inputValue }) => {
                        const { ...optionProps } = props;
                        const matches = match(option, inputValue, { insideWords: true });
                        const parts = parse(option, matches);

                        return (
                            <li {...optionProps} key={option}>
                                <div>
                                    {parts.map((part, index) => (
                                        <span
                                            key={index}
                                            style={{
                                                fontWeight: part.highlight ? 700 : 400,
                                            }}
                                        >
                                            {part.text}
                                        </span>
                                    ))}
                                </div>
                            </li>
                        );
                    }}
                />
            </FormControl>
            <FormControl sx={{ mr: 1, minWidth: 120 }} size="small">
                <InputLabel>Mode</InputLabel>
                <Select id="mode" value={mode} label="Mode" onChange={(e) => setMode(e.target.value)} size="small">
                    <MenuItem key="DEX" value="DEX">DEX</MenuItem>
                    <MenuItem key="GEX" value="GEX">GEX</MenuItem>
                </Select>
            </FormControl>
        </Box>
        {
            symbol ? <HistoricalSnapshotView isLoading={isLoading} key={symbol} items={collect(snapshots).sortByDesc('key').all()} />
                : <div></div>
        }

    </Box>
}