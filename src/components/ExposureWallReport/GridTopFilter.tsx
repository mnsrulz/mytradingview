'use client';

import * as React from 'react';
import { Stack } from '@mui/material';
import { FormControl, InputLabel, Select, MenuItem, Paper } from '@mui/material';
import { dteOptions } from './constants';

export const GridTopFilter = (props: {
    cachedDates: string[],
    dte: number;
    setDte: React.Dispatch<React.SetStateAction<number>>;
    date: string;
    setDate: React.Dispatch<React.SetStateAction<string>>;
}) => {
    const { cachedDates, dte,
        setDte,
        date,
        setDate, } = props;
    
    return <Paper sx={{ mb: 1 }}>
        <Stack direction="row" spacing={2} padding={1}>
            <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                <InputLabel>Data Mode</InputLabel>
                <Select value={date} label="Data Mode" onChange={(e) => setDate(e.target.value)}>
                    {
                        cachedDates.map(c => {
                            return <MenuItem key={c} value={c}>{c}</MenuItem>
                        })
                    }
                </Select>
            </FormControl>
            <FormControl sx={{ m: 1, minWidth: 60 }} size="small">
                <InputLabel>DTE</InputLabel>
                <Select id="dte" value={dte} label="DTE" onChange={(e) => setDte(e.target.value as number)}>
                    {dteOptions.map((dte) => <MenuItem key={dte} value={dte}>{dte}</MenuItem>)}
                </Select>
            </FormControl>
        </Stack>
    </Paper>
}