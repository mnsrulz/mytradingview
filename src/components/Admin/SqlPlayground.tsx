'use client';
import { runDynamicQuery } from '@/lib/socket';
import Editor from '@monaco-editor/react';
import {
    Box, Button, CircularProgress, FormControl, Paper, Stack,
    Typography, useColorScheme, Tabs, Tab, IconButton,
    Checkbox,
    FormControlLabel,
    Tooltip,
    List,
    ListItemButton,
    ListItemText,
    Dialog,
    DialogContent,
    DialogTitle,
    InputAdornment,
    TextField
} from '@mui/material';

import SaveIcon from '@mui/icons-material/Save';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';

import { DialogProps, useDialogs } from '@toolpad/core/useDialogs';

import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useRef, useState } from 'react';
import { SymbolsSelector } from '../IVHistorical/SymbolsSelector';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { Panel, Group, Separator } from "react-resizable-panels";
import { nanoid } from 'nanoid';
import { useNotifications } from '@toolpad/core';
import { useSavedQueries } from '@/lib/useSavedQueries';
import { SavedQuery } from '@prisma/client';

const knownColumns = ["quote_date", "expiration_date", "expiration_dow", "quote_dow", "dte", "option_ticker", "option_type", "strike_price", "open_interest", "option_volume", "delta", "gamma", "vega", "theta", "rho", "theoretical_price", "implied_volatility", "option_open_price", "option_high_price", "bid_price", "ask_price", "mid_price", "liquidity_tier", "volume_oi_ratio", "underlying_symbol", "underlying_close_price", "moneyness", "moneyness_percent", "expiry_bucket"];

//add a button to execute the query and show the results in a table below the editor
//with loading state and error handling

type PlaygroundTab = {
    id: string;
    title: string;
    symbol: string;
    query: string;
    result: any[];
    isLoading?: boolean;
    error?: string;
    queryId?: string;
    ac: AbortController;
};
const defaultQuery = `SELECT * FROM dataset`;
export const SqlPlayground = ({ symbols }: { symbols: string[] }) => {
    const [tabs, setTabs] = useState<PlaygroundTab[]>([
        {
            id: "1",
            title: `Query 1`,
            query: defaultQuery,
            symbol: symbols[0],
            result: [],
            ac: new AbortController(),
            queryId: ''
        }
    ]);
    const [showAsJson, setShowAsJson] = useState(false);
    const [activeTabId, setActiveTabId] = useState("1");
    // had to use ref since monaco's onMount only gets the initial query value, and doesn't update with state changes. This caused the executeQuery function to always use the initial query value, even after edits. 
    const tabsRef = useRef(tabs);
    const activeTabIdRef = useRef(activeTabId);

    const { queries, saveQuery, deleteQuery } = useSavedQueries();

    const notification = useNotifications();

    useEffect(() => {
        tabsRef.current = tabs;
        activeTabIdRef.current = activeTabId;
    }, [tabs, activeTabId]);

    const activeTab = tabs.find(t => t.id === activeTabId)!;

    const { mode } = useColorScheme();
    const isDarkMode = mode === 'dark';

    const updateTab = (tab: PlaygroundTab) => {
        setTabs(prev => prev.map(t => t.id === tab.id ? tab : t));
    }

    const cancelQuery = async () => {
        const currentTab = tabsRef.current.find(t => t.id === activeTabIdRef.current)!;
        currentTab.ac.abort();
    }

    const executeQuery = async () => {
        const currentTab = tabsRef.current.find(t => t.id === activeTabIdRef.current)!;
        const { id, query, symbol } = currentTab;
        const ac = new AbortController();
        updateTab({ ...currentTab, isLoading: true, error: '', ac });
        let result: any[] = [], error = '';
        try {
            result = await runDynamicQuery(symbol, query, ac.signal);
        } catch (err) {
            error = err instanceof Error ? err.message : String(err);
        }
        setTabs(prev => prev.map(t => t.id === id ? { ...t, result, isLoading: false, error } : t));
    };

    // ➕ add tab
    const addTab = () => {
        const id = nanoid();
        setTabs(prev => [
            ...prev,
            {
                id: id,
                title: `Query ${id.slice(-4)}`,
                query: defaultQuery,
                symbol: symbols[0],
                result: [],
                ac: new AbortController()
            }
        ]);
        setActiveTabId(id);
    };

    // ❌ close tab
    const closeTab = (id: string) => {
        const newTabs = tabs.filter(t => t.id !== id);
        setTabs(newTabs);

        if (activeTabId === id && newTabs.length > 0) {
            setActiveTabId(newTabs[newTabs.length - 1].id);
        }
    };

    const activeResult = activeTab.result;

    const columns =
        activeResult?.length > 0
            ? Object.keys(activeResult[0]).map((key) => ({
                field: key,
                headerName: key,
            }))
            : [];

    const rows =
        activeResult?.map((row: any, i: number) => ({
            id: i,
            ...row,
        })) || [];

    const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
    const cmdKey = isMac ? '⌘' : 'Ctrl';
    const enterKey = isMac ? '↵' : 'Enter';
    const dialogs = useDialogs();

    const handleLoad = async () => {
        const dialogResult = await dialogs.open(QueryPickerDialog, queries);
        if (dialogResult) {
            activeTab.queryId = dialogResult.id;
            activeTab.query = dialogResult.query;
            activeTab.title = dialogResult.name;
            updateTab(activeTab)
        }
    }

    const handleSave = async () => {
        try {
            let queryName: string | undefined | null = '';
            if (activeTab.queryId) {
                queryName = queries.find(k => k.id == activeTab.queryId)?.name;
            } else {
                queryName = await dialogs.prompt('Name?', {
                    cancelText: 'Cancel',
                });
            }
            if (!queryName) return;

            await saveQuery({
                name: queryName,
                query: activeTab.query,
                id: activeTab.queryId
            });

            notification.show(`Query saved!`, {
                autoHideDuration: 3000
            });
        } catch (error) {
            notification.show(`an error occurred while saving...`, {
                severity: 'error',
                autoHideDuration: 3000
            });
        }
    }


    return (
        <Stack spacing={1}>
            {/* Tabs */}
            <Stack direction="row" alignItems="center">
                <Tabs
                    value={activeTabId}
                    onChange={(_, val) => setActiveTabId(val)}
                    variant="standard"
                    scrollButtons="auto"
                    sx={{
                        minHeight: '32px',
                        height: '32px',
                        padding: 0,
                        '& .MuiTabs-indicator': {
                            height: '2px', // Slim indicator
                            bottom: 0,
                        }
                    }}

                >
                    {tabs.map(tab => (
                        <Tab
                            key={tab.id}
                            value={tab.id}
                            sx={{
                                minHeight: '32px',
                                minWidth: 'auto',
                                textTransform: 'none',
                                // fontSize: '0.75rem',
                                fontFamily: 'Roboto Mono, monospace', // Monospace for that "code" feel
                                padding: '0 2px',
                                // borderRight: '1px solid #ddd',
                                // '&.Mui-selected': {
                                //     backgroundColor: '#fff',
                                //     fontWeight: 600,
                                // }
                                // minHeight: '32px', minWidth: 'auto', p: 0
                            }}
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', px: 1 }}>
                                    <Typography sx={{
                                        fontSize: '0.75rem',
                                        mr: 1
                                    }}>{tab.title}</Typography>
                                    <IconButton
                                        size="small"
                                        sx={{ p: 0.2, '&:hover': { color: 'error.main' } }}
                                        component="span"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            closeTab(tab.id);
                                        }}
                                    >
                                        <CloseIcon sx={{ fontSize: '0.8rem' }} />
                                    </IconButton>
                                </Box>
                            }
                        />
                    ))}
                </Tabs>

                <IconButton onClick={addTab}>
                    <AddIcon sx={{ fontSize: '0.8rem' }} />
                </IconButton>
            </Stack>

            {/* Controls */}
            <Paper>
                <Stack direction="row" justifyContent="space-between" p={1}>
                    <Stack direction="row" spacing={2}>

                        <Tooltip title="Load Query">
                            <IconButton onClick={handleLoad} color="primary" size="small">
                                <FileOpenIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Save Query">
                            <IconButton onClick={handleSave} color="primary" size="small">
                                <SaveIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>

                        <FormControl size="small" sx={{ minWidth: 140 }}>
                            <SymbolsSelector
                                disabled={activeTab.isLoading}
                                symbols={symbols}
                                symbol={activeTab.symbol}
                                handleSymbolChange={(newSymbol) => {
                                    updateTab({ ...activeTab, symbol: newSymbol });
                                }}
                            />
                        </FormControl>

                        <FormControl size="small">
                            <FormControlLabel control={<Checkbox checked={showAsJson}
                                onChange={(ev) => setShowAsJson(ev.target.checked)} />}
                                label="Show as JSON" />
                        </FormControl>
                    </Stack>



                    <Button
                        variant="contained"
                        startIcon={activeTab.isLoading ? <StopIcon /> : <PlayArrowIcon />}
                        onClick={activeTab.isLoading ? cancelQuery : executeQuery}
                        color={activeTab.isLoading ? "error" : "primary"}
                        sx={{
                            textTransform: 'none',
                            minWidth: '160px', // Ensures the button doesn't jump size when text changes
                            fontWeight: 600
                        }}
                    >
                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {activeTab.isLoading ? "Cancel" : "Execute"}
                            <Typography
                                component="kbd"
                                sx={{
                                    opacity: 0.5,       // Standard: Muted color
                                    fontSize: '0.7rem', // Standard: Slightly smaller than label
                                    fontWeight: 400,
                                    letterSpacing: 0.5
                                }}
                            >
                                ({cmdKey}{activeTab.isLoading ? '.' : enterKey})
                            </Typography>
                        </Box>
                    </Button>
                </Stack>
            </Paper>

            {/* Editor + Results */}
            <Group orientation="vertical" style={{ height: '75vh' }}>
                <Panel style={{ padding: 1 }}>
                    <Paper sx={{ height: '100%', display: 'flex' }}>
                        <Editor
                            language="sql"
                            value={activeTab.query}
                            onChange={(v) => updateTab({ ...activeTab, query: v || '' })}
                            theme={isDarkMode ? 'vs-dark' : 'light'}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 13
                            }}
                            onMount={(editor, monaco) => {
                                editor.addCommand(
                                    monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
                                    () => executeQuery()
                                );

                                editor.addCommand(
                                    monaco.KeyMod.CtrlCmd | monaco.KeyCode.Period,
                                    () => cancelQuery()
                                );

                                monaco.languages.registerCompletionItemProvider('sql', {
                                    provideCompletionItems: () => ({
                                        suggestions: [...knownColumns.map(col => ({
                                            label: col,
                                            kind: monaco.languages.CompletionItemKind.Field,
                                            insertText: col,
                                        })), {
                                            label: 'dataset',
                                            kind: monaco.languages.CompletionItemKind.Module,
                                            insertText: 'dataset',
                                            detail: 'contains a predefined fields of options data'
                                        }]
                                    })
                                });
                            }}
                        />
                    </Paper>
                </Panel>

                <Separator />

                <Panel>
                    <Paper sx={{ pt: 1 }}>
                        {activeTab.error ? (
                            <Typography color="error" p={2}>
                                {activeTab.error}
                            </Typography>
                        ) : activeTab.isLoading ? (
                            <Box display="flex" justifyContent="center" p={3}>
                                <CircularProgress size={24} />
                            </Box>
                        ) : rows.length ? (showAsJson ? <pre>
                            {JSON.stringify(activeTab.result, null, 2)}
                        </pre> :
                            <DataGrid
                                columns={columns}
                                rows={rows}
                                autoHeight
                                density="compact"
                                rowHeight={40}
                                disableColumnMenu
                                disableColumnSorting
                                disableColumnSelector
                                pagination
                                initialState={{
                                    pagination: { paginationModel: { pageSize: 10 } }
                                }}
                                pageSizeOptions={[5, 10, 25]}
                                sx={{
                                    // height: '15vh',
                                    fontFamily: "Roboto Mono, monospace",
                                    fontSize: 12,
                                    //display: 'grid',
                                    //'& .MuiDataGrid-columnSeparator': { display: 'none' },
                                    '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
                                        outline: 'none'
                                    }
                                }}

                            />
                        ) : (
                            <Typography p={2} color="text.secondary">
                                No results to display
                            </Typography>
                        )}
                    </Paper>
                </Panel>
            </Group>
        </Stack>
    );
};

function QueryPickerDialog({ payload, onClose, open }: DialogProps<SavedQuery[], SavedQuery | null>) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredQueries = payload.filter((q) =>
        q.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Dialog
            open={open}
            fullWidth
            maxWidth="sm"
            onClose={() => onClose(null)}
            // Professional touch: Smooth transition and accessibility
            aria-labelledby="query-picker-title"
        >
            <DialogTitle id="query-picker-title">
                <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                    Saved Queries
                </Typography>
                <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    placeholder="Search queries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ mt: 2 }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" />
                                </InputAdornment>
                            )
                        }
                    }}
                />
            </DialogTitle>

            <DialogContent dividers sx={{ p: 0, minHeight: '300px' }}>
                {filteredQueries.length > 0 ? (
                    <List disablePadding>
                        {filteredQueries.map((query) => (
                            <ListItemButton
                                key={query.id}
                                onClick={() => onClose(query)}
                                divider
                                sx={{ py: 1.5 }}
                            >
                                <ListItemText
                                    primary={query.name}
                                    secondary={
                                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                            <HistoryIcon sx={{ fontSize: 14 }} />
                                            Last modified: {new Date(query.updatedAt).toLocaleDateString()}
                                        </Box>
                                    }
                                    slotProps={{
                                        primary: {
                                            fontWeight: 500, color: 'primary.main'
                                        }
                                    }}
                                />
                            </ListItemButton>
                        ))}
                    </List>
                ) : (
                    <Box sx={{ p: 4, textAlign: 'center', opacity: 0.6 }}>
                        <Typography variant="body2">No queries found matching {searchTerm}</Typography>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
}