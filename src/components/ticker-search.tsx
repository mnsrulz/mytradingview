import { Autocomplete, CircularProgress, TextField, debounce } from '@mui/material';
import * as React from 'react';
import { searchTicker } from '../lib/socket';
import { useEffect, useMemo, useState } from 'react';
import { SearchTickerItem } from '@/lib/types';

interface ITickerProps {
    onChange: (value: SearchTickerItem) => void,
    label?: string
}

export const TickerSearch = (props: ITickerProps) => {
    const [options, setOptions] = useState<SearchTickerItem[]>([]);
    const [loading, setLoading] = useState(false);
    const onInputChange = (ev: any, value: any, reason: any) => {
        if (value) {
            getData(value);
        } else {
            setOptions([]);
        }
    };

    const debouncedEventHandler = useMemo(
        () => debounce(onInputChange, 300)
      , []);
      
    const getData = async (searchTerm: string) => {
        setLoading(true);
        const result = await searchTicker(searchTerm);
        setOptions(result);
        setLoading(false);
    };

    return <Autocomplete filterOptions={(x) => x}
        onInputChange={debouncedEventHandler}
        size='small'
        onChange={(ev, value) => value && props.onChange(value)}
        renderInput={(params) => (
            <TextField
                {...params}
                variant='standard'
                size='small'
                fullWidth
                label={props.label || 'Search Item'}
                InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                        <React.Fragment>
                            {loading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                        </React.Fragment>
                    ),
                }} />
        )}
        options={options}
        getOptionLabel={(option: SearchTickerItem) => `${option.symbol} - ${option.name}`}
        fullWidth        
    />
}