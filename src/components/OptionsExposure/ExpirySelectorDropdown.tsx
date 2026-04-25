import React, { useState } from 'react';
import {
    Button,
    Menu,
    MenuItem,
    Typography,
    Box,
    FormControl,
    InputLabel,
    Tab,
    Tabs,
    OutlinedInput,
    Checkbox,
    Divider,
} from '@mui/material';

export type ExpiryValue =
    | { mode: "dte"; value: number }
    | { mode: "exp"; values: string[] };

interface ExpirySelectorDropdownProps {
    value: ExpiryValue;
    onChange: (value: ExpiryValue) => void;
    dteOptions: number[];
    expirations: string[];
    size?: "small" | "normal";
}

// Label helper
function getLabel(value: ExpiryValue) {
    if (value.mode === "dte") return `${value.value} DTE`;

    const count = value.values.length;

    if (count === 0) return "None";
    if (count === 1) return value.values[0];

    return `${count} expiries`;
}

export default function ExpirySelectorDropdown({
    value,
    onChange,
    dteOptions,
    expirations,
    size = "normal",
}: ExpirySelectorDropdownProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const [tab, setTab] = useState(value.mode === "exp" ? 1 : 0);
    const [selectedLabel, setSelectedLabel] = useState(getLabel(value));

    const [selectedExps, setSelectedExps] = useState<string[]>(
        value.mode === "exp" ? value.values : []
    );

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = (forceTab?: number) => {
        if (forceTab !== undefined) setTab(forceTab)
        else {
            setTab(value.mode === "exp" ? 1 : 0);
        }
        setAnchorEl(null);
    };

    // --- DTE ---
    const handleDteSelect = (v: number) => {
        setSelectedLabel(`${v} DTE`);
        onChange({ mode: "dte", value: v });
        handleClose(0);
    };

    // --- EXP MULTI SELECT ---
    const toggleExp = (exp: string) => {
        setSelectedExps((prev) =>
            prev.includes(exp)
                ? prev.filter((e) => e !== exp)
                : [...prev, exp]
        );
    };

    const handleApplyExp = () => {
        const v: ExpiryValue = { mode: "exp", values: selectedExps };
        setSelectedLabel(getLabel(v));
        onChange(v);
        handleClose(1);
    };

    const handleClear = () => {
        setSelectedExps([]);
    };

    return (
        <>
            <FormControl size="small" sx={{ width: value.mode === "exp" ? 120 : 96, maxWidth: 120 }}>
                <InputLabel shrink title="Expiry">Expiry</InputLabel>
                <OutlinedInput
                    readOnly
                    value={selectedLabel}
                    onClick={handleMenuClick}
                    label="Expiry"
                    sx={{
                        cursor: 'pointer',
                        '& input': { cursor: 'pointer' },
                    }}
                />
            </FormControl>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => handleClose()}>
                <Tabs
                    variant="fullWidth"
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    sx={{
                        minHeight: 40,
                        '& .MuiTab-root': {
                            minHeight: 32,
                            py: 1,
                        },
                    }}
                >
                    <Tab label="DTE" value={0} />
                    <Tab label="Expirations" value={1} />
                </Tabs>

                {/* DTE TAB */}
                {tab === 0 && <Box sx={{ p: 0, width: 240 }}>
                    <FormControl fullWidth size="small">
                        {dteOptions.map((v) => (
                            <MenuItem
                                key={v}
                                dense={size === "small"}
                                selected={selectedLabel === `${v} DTE`}
                                onClick={() => handleDteSelect(v)}
                            >
                                {v}
                            </MenuItem>
                        ))}
                    </FormControl>
                </Box>
                }

                {/* EXPIRATIONS TAB */}
                {tab === 1 && (
                    <Box sx={{ width: 260 }}>
                        {/* Scrollable list */}
                        <Box sx={{ maxHeight: 248, overflowY: 'auto' }}>
                            {expirations.map((exp) => (
                                <MenuItem key={exp} sx={{ px: 0.5, py: 0, m: 0 }} onClick={() => toggleExp(exp)}>
                                    <Checkbox checked={selectedExps.includes(exp)} />
                                    <Typography>{exp}</Typography>
                                </MenuItem>
                            ))}
                        </Box>

                        <Divider />

                        {/* Sticky footer */}
                        <Box
                            sx={{
                                p: 1,
                                position: 'sticky',
                                bottom: 0,
                                zIndex: 1,
                            }}
                            display="flex"
                            justifyContent="space-between"
                        >
                            <Button onClick={handleClear}>Clear</Button>
                            <Button
                                variant="contained"
                                onClick={handleApplyExp}
                                disabled={selectedExps.length === 0}
                            >
                                Apply
                            </Button>
                        </Box>
                    </Box>
                )}
            </Menu>
        </>
    );
}