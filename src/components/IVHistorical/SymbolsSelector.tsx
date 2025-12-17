'use client';
import { Autocomplete, TextField } from "@mui/material";
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';

export const SymbolsSelector = ({ symbols, symbol, handleSymbolChange }: { symbols: string[], symbol: string, handleSymbolChange: (value: string) => void }) => {
    return <Autocomplete
        // sx={{ width: 300 }}
        options={symbols}
        value={symbol}
        getOptionLabel={(option) => option}
        onChange={(ev, value) => handleSymbolChange(value || '')}
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
}