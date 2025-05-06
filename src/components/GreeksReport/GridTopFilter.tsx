'use client';

import * as React from 'react';
import { Stack, Box, IconButton, Drawer, useMediaQuery, useTheme } from '@mui/material';
import { FormControl, InputLabel, Select, MenuItem, Paper } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import { GreeksFilter } from './GreeksFilter';
import { useState } from 'react';

export const GridTopFilter = (props: {
    cachedDates: string[],
    dte: number;
    setDte: React.Dispatch<React.SetStateAction<number>>;
    minOpenInterest: number;
    setMinOpenInterest: React.Dispatch<React.SetStateAction<number>>;
    minVolume: number;
    setMinVolume: React.Dispatch<React.SetStateAction<number>>;
    date: string;
    setDate: React.Dispatch<React.SetStateAction<string>>;
}) => {
    const { cachedDates, dte,
        setDte,
        minOpenInterest,
        setMinOpenInterest,
        minVolume,
        setMinVolume,
        date,
        setDate, } = props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [open, setOpen] = useState(false);
    const toggleDrawer = (newOpen: boolean) => () => {
        setOpen(newOpen);
    };

    return <Paper sx={{ mb: 1 }}>
        <Stack direction="row" spacing={2} padding={1}>
            {
                isMobile && <><IconButton onClick={toggleDrawer(true)}>
                    <FilterListIcon />
                </IconButton>
                    <Drawer anchor="left" open={open} onClose={toggleDrawer(false)}>
                        <Box sx={{ width: 250, padding: 2 }}>
                            <GreeksFilter dte={dte} minOpenInterest={minOpenInterest} minVolume={minVolume} setDte={setDte} setMinOpenInterest={setMinOpenInterest} setMinVolume={setMinVolume} />
                        </Box>
                    </Drawer>
                </>
            }
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
            {!isMobile && <GreeksFilter dte={dte} minOpenInterest={minOpenInterest} minVolume={minVolume} setDte={setDte} setMinOpenInterest={setMinOpenInterest} setMinVolume={setMinVolume} />}
        </Stack>
    </Paper>
}