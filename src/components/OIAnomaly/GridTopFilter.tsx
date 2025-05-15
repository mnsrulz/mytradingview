'use client';

import * as React from 'react';
import { Stack, Box, IconButton, Drawer, useMediaQuery, useTheme, SelectChangeEvent, OutlinedInput, Chip } from '@mui/material';
import { FormControl, InputLabel, Select, MenuItem, Paper } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useState } from 'react';


export const dteOptions = [7,
    30,
    50,
    90,
    180,
    400,
    1000];

export const GridTopFilter = (props: {
    cachedDates: string[],
    symbols: string[],
    selectedSymbols: string[],
    dteFrom: number,
    setDteFrom: React.Dispatch<React.SetStateAction<number>>;
    setSelectedSymbols: React.Dispatch<React.SetStateAction<string[]>>;
    date: string;
    setDate: React.Dispatch<React.SetStateAction<string>>;
}) => {
    const { cachedDates,
        symbols,
        date,
        selectedSymbols,
        setSelectedSymbols,
        dteFrom,
        setDteFrom,
        setDate, } = props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleChange = (event: SelectChangeEvent<typeof selectedSymbols>) => {
        const {
            target: { value },
        } = event;
        setSelectedSymbols(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    const [open, setOpen] = useState(false);
    const toggleDrawer = (newOpen: boolean) => () => {
        setOpen(newOpen);
    };

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

            <FormControl sx={{ m: 1, width: 300 }}>
                <InputLabel>Symbols</InputLabel>
                <Select
                    id="demo-multiple-chip"
                    multiple
                    value={selectedSymbols}
                    onChange={handleChange}
                    label="Symbols"
                    // input={<OutlinedInput id="symbols-multiple-chip" label="Symbols" />}
                    renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                                <Chip key={value} label={value} />
                            ))}
                        </Box>
                    )}
                    size='small'
                    MenuProps={{
                        PaperProps: {
                            style: {
                                maxHeight: 48 * 4.5 + 8,
                                width: 250
                            }
                        }
                    }}
                >
                    {symbols.map((name) => (
                        <MenuItem
                            key={name}
                            value={name}
                        // style={getStyles(name, personName, theme)}
                        >
                            {name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl sx={{ m: 1, minWidth: 90 }} size="small">
                <InputLabel>DTE From</InputLabel>
                <Select id="dte" value={dteFrom} label="DTE From" onChange={(e) => setDteFrom(e.target.value as number)}>
                    {dteOptions.map((dte) => <MenuItem key={dte} value={dte}>{dte}+</MenuItem>)}
                </Select>
            </FormControl>
        </Stack>
    </Paper>
}