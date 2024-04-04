import { Autocomplete, TextField, debounce } from '@mui/material';
import * as React from 'react';
import { SearchTickerItem, searchTicker } from '../lib/socket';
import { useEffect, useMemo, useState } from 'react';

interface ITickerProps {
    onChange: (value: SearchTickerItem) => void
}

export const TickerSearch = (props: ITickerProps) => {
    const [options, setOptions] = useState<any>([]);
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
        const result = await searchTicker(searchTerm);
        setOptions(result.items);
    };

    return <Autocomplete filterOptions={(x) => x}
        onInputChange={debouncedEventHandler}
        onChange={(ev, value) => value && props.onChange(value)}
        renderInput={(params) => (
            <TextField
                {...params}
                variant='outlined'
                fullWidth
                label="Search ticker"
                InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                        <React.Fragment>
                            {/* {loading ? <CircularProgress color="inherit" size={20} /> : null} */}
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