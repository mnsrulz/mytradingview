import { Autocomplete, CircularProgress, TextField } from '@mui/material';
import { useDebounce } from "@uidotdev/usehooks";
import { useTickerSearch } from "@/lib/hooks";
import { SearchTickerItem } from '@/lib/types';
import { useState } from 'react';

interface ITickerProps {
    onChange: (value: SearchTickerItem) => void,
    label?: string
}

export const TickerSearch = (props: ITickerProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    //const [options, setOptions] = useState<SearchTickerItem[]>([]);
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const { options, loading } = useTickerSearch(debouncedSearchTerm);

    return <Autocomplete filterOptions={(x) => x}
        onInputChange={(ev, v) => setSearchTerm(v)}
        size='small'
        onChange={(ev, value) => value && props.onChange(value)}
        renderInput={(params) => (
            <TextField
                {...params}
                variant='standard'
                size='small'
                fullWidth
                label={props.label || 'Search Item'}
                autoFocus
                InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                        <>
                            {loading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                        </>
                    ),
                }} />
        )}
        options={options}
        getOptionLabel={(option: SearchTickerItem) => `${option.symbol} - ${option.name}`}
        fullWidth
    />
}