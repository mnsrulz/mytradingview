'use client';

import * as React from 'react';
import { Stack, Box, IconButton, Drawer, useMediaQuery, useTheme, SelectChangeEvent, Autocomplete, TextField, Checkbox, ListItemText, ListItemIcon, Divider, Typography } from '@mui/material';
import { FormControl, InputLabel, Select, MenuItem, Paper } from '@mui/material';
import { SyntheticEvent, useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

export const dteOptions = [0,
    1,
    7,
    30,
    50,
    90,
    180,
    400,
    1000];

function OIAnomalyFilterSidebar({ dteFrom, setDteFrom, selectedSymbols, setSelectedSymbols, symbols }: {
    dteFrom: number;
    setDteFrom: (v: number) => void;

    selectedSymbols: string[];
    setSelectedSymbols: (v: string[]) => void;
    symbols: string[];
}) {
    function handleChange(event: SyntheticEvent<Element, Event>, value: string[]): void {
        setSelectedSymbols(value);
    }

    return (
        <Box sx={{ width: 260, p: 2 }}>
            <Typography variant="h6" gutterBottom>Filters</Typography>
            <Divider sx={{ mb: 2 }} />            
            <TextField
                label="DTE From"
                type="number"
                value={dteFrom}
                onChange={e => setDteFrom(Number(e.target.value))}
                fullWidth
                margin="normal"
                size="small"
            />
            <Autocomplete
                multiple
                limitTags={2}
                options={symbols}
                value={selectedSymbols}
                renderInput={(params) => (
                    <TextField {...params} label="Symbols" placeholder="Symbols" />
                )}
                onChange={handleChange}
                size='small'
            />
        </Box>
    );
}

export const GridTopFilter = (props: {
    cachedDates: string[],
    symbols: string[],
    selectedSymbols: string[],
    selectedDates: string[],
    dteFrom: number,
    setDteFrom: React.Dispatch<React.SetStateAction<number>>;
    dteTo: number,
    setDteTo: React.Dispatch<React.SetStateAction<number>>;
    setSelectedSymbols: React.Dispatch<React.SetStateAction<string[]>>;
    setSelectedDates: React.Dispatch<React.SetStateAction<string[]>>;
    // date: string;
    // setDate: React.Dispatch<React.SetStateAction<string>>;
}) => {
    const { cachedDates,
        symbols,
        selectedDates,
        selectedSymbols,
        setSelectedDates,
        setSelectedSymbols,
        dteFrom,
        setDteFrom,
        dteTo,
        setDteTo
    } = props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    function handleChange(event: SyntheticEvent<Element, Event>, value: string[]): void {
        setSelectedSymbols(value);
    }
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const handleDatesSelectionChange = (event: SelectChangeEvent<typeof selectedDates>) => {
        const value = event.target.value;
        if (value[value.length - 1] === "all") {
            setSelectedDates(selectedDates.length === cachedDates.length ? [] : cachedDates);
            return;
        }
        setSelectedDates(typeof value === 'string' ? value.split(',') : value);
    };


    return <Paper sx={{ mb: 1 }}>
        {
            isMobile && <Drawer anchor="left" open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
                <OIAnomalyFilterSidebar {...props} />
            </Drawer>
        }
        <Stack direction="row" spacing={2} padding={1}>
            <FormControl sx={{ m: 1, width: 150 }} size="small">
                <InputLabel>Data Mode</InputLabel>
                <Select
                    multiple
                    value={selectedDates}
                    onChange={handleDatesSelectionChange}
                    label="Data Mode"
                    renderValue={(selected) => selected.join(', ')}
                    MenuProps={MenuProps}
                >
                    <MenuItem value="all">
                        <ListItemIcon>
                            <Checkbox
                                checked={cachedDates.length > 0 && selectedDates.length === cachedDates.length}
                                indeterminate={selectedDates.length > 0 && selectedDates.length < cachedDates.length}
                            />
                        </ListItemIcon>
                        <ListItemText primary="Select All" />
                    </MenuItem>
                    {cachedDates.map((name) => (
                        <MenuItem key={name} value={name}>
                            <Checkbox size="small" checked={selectedDates.includes(name)} />
                            <ListItemText primary={name} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            {
                isMobile ? <><IconButton onClick={() => setSidebarOpen(true)} sx={{ alignSelf: 'flex-start' }}>
                    <MenuIcon />
                </IconButton>
                </> : <>
                    <FormControl sx={{ m: 1, width: 300 }}>
                        <Autocomplete
                            multiple
                            limitTags={2}
                            options={symbols}
                            defaultValue={[]}
                            value={selectedSymbols}
                            renderInput={(params) => (
                                <TextField {...params} label="Symbols" placeholder="Symbols" />
                            )}
                            onChange={handleChange}
                            size='small'
                        />
                    </FormControl>
                    <FormControl sx={{ m: 1, minWidth: 90 }} size="small">
                        <InputLabel>DTE From</InputLabel>
                        <Select id="dteFrom" value={dteFrom} label="DTE From" onChange={(e) => setDteFrom(e.target.value as number)}>
                            {dteOptions.map((dte) => <MenuItem key={dte} value={dte}>{dte}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <FormControl sx={{ m: 1, minWidth: 90 }} size="small">
                        <InputLabel>DTE To</InputLabel>
                        <Select id="dteTo" value={dteTo} label="DTE To" onChange={(e) => setDteTo(e.target.value as number)}>
                            {dteOptions.map((dte) => <MenuItem key={dte} value={dte}>{dte}</MenuItem>)}
                        </Select>
                    </FormControl>
                </>
            }
        </Stack>
    </Paper>
}