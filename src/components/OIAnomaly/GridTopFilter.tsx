'use client';

import * as React from 'react';
import { Stack, Box, IconButton, Drawer, useMediaQuery, useTheme, SelectChangeEvent, OutlinedInput, Chip, Autocomplete, TextField, Checkbox, ListItemText, ListItemIcon } from '@mui/material';
import { FormControl, InputLabel, Select, MenuItem, Paper } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import { SyntheticEvent, useState } from 'react';
import { options } from 'numeral';

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
    selectedDates: string[],
    dteFrom: number,
    setDteFrom: React.Dispatch<React.SetStateAction<number>>;
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
        // setDate, 
    } = props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    function handleChange(event: SyntheticEvent<Element, Event>, value: string[]): void {
        setSelectedSymbols(value);
    }

    const [open, setOpen] = useState(false);
    const toggleDrawer = (newOpen: boolean) => () => {
        setOpen(newOpen);
    };

    const handleDatesSelectionChange = (event: SelectChangeEvent<typeof selectedDates>) => {
        // const {
        //     target: { value },
        // } = event;
        // setSelectedDates(
        //     // On autofill we get a stringified value.
        //     typeof value === 'string' ? value.split(',') : value,
        // );
        // setSelectedDates(typeof value === 'string' ? value.split(',') : value)


        const value = event.target.value;
        if (value[value.length - 1] === "all") {
            setSelectedDates(selectedDates.length === cachedDates.length ? [] : cachedDates);
            return;
        }
        setSelectedDates(typeof value === 'string' ? value.split(',') : value);
    };


    return <Paper sx={{ mb: 1 }}>
        <Stack direction="row" spacing={2} padding={1}>
            <FormControl sx={{ m: 1, width: 150 }} size="small">
                <InputLabel>Data Mode</InputLabel>
                {/* <Select value={date} label="Data Mode" onChange={(e) => setDate(e.target.value)}>
                    {
                        cachedDates.map(c => {
                            return <MenuItem key={c} value={c}>{c}</MenuItem>
                        })
                    }
                </Select> */}

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

            <FormControl sx={{ m: 1, width: 300 }}>
                {/* <InputLabel>Symbols</InputLabel> */}
                <Autocomplete
                    multiple
                    limitTags={2}
                    id="multiple-limit-tags"
                    options={symbols}
                    // getOptionLabel={(option) => option}
                    defaultValue={[]}
                    renderInput={(params) => (
                        <TextField {...params} label="Symbols" placeholder="Symbols" />
                    )}
                    onChange={handleChange}
                    size='small'
                // sx={{ width: '500px' }}
                />
                {/* <Select
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
                </Select> */}
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