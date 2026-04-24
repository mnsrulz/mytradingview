'use client';
import { runDynamicQuery } from '@/lib/socket';
import Editor from '@monaco-editor/react';
import {
    Box, Button, CircularProgress, FormControl, Paper, Stack,
    Typography, useColorScheme, Tabs, Tab, IconButton,
    Divider,
    Checkbox,
    FormControlLabel
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useRef, useState } from 'react';
import { SymbolsSelector } from '../IVHistorical/SymbolsSelector';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { Panel, Group, Separator } from "react-resizable-panels";
import { nanoid } from 'nanoid';

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
        }
    ]);
    const [showAsJson, setShowAsJson] = useState(false);
    const [activeTabId, setActiveTabId] = useState("1");
    // had to use ref since monaco's onMount only gets the initial query value, and doesn't update with state changes. This caused the executeQuery function to always use the initial query value, even after edits. 
    const tabsRef = useRef(tabs);
    const activeTabIdRef = useRef(activeTabId);

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

    const executeQuery = async () => {
        const currentTab = tabsRef.current.find(t => t.id === activeTabIdRef.current)!;
        const { id, query, symbol } = currentTab;
        updateTab({ ...currentTab, isLoading: true, error: '' });
        let result: any[] = [], error = '';
        try {
            result = await runDynamicQuery(symbol, query);
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

    return (
        <Stack spacing={2}>

            {/* Tabs */}
            <Stack direction="row" alignItems="center">
                <Tabs                    
                    value={activeTabId}
                    onChange={(_, val) => setActiveTabId(val)}
                    variant="scrollable"
                >
                    {tabs.map(tab => (
                        <Tab
                            key={tab.id}
                            value={tab.id}
                            label={
                                <Stack direction="row" alignItems="center">
                                    {tab.title}
                                    <IconButton
                                        size="small"
                                        component="span"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            closeTab(tab.id);
                                        }}
                                    >
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </Stack>
                            }
                        />
                    ))}
                </Tabs>

                <IconButton onClick={addTab}>
                    <AddIcon />
                </IconButton>
            </Stack>

            {/* Controls */}
            <Paper>
                <Stack direction="row" justifyContent="space-between" p={1}>
                    <Stack direction="row" spacing={2}>

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
                        startIcon={<PlayArrowIcon />}
                        onClick={executeQuery}
                        disabled={activeTab.isLoading}
                    >
                        Execute Query
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
                    <Paper>
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
                                rowHeight={48}
                                disableColumnMenu
                                disableColumnSorting
                                disableColumnSelector
                                pagination
                                initialState={{
                                    pagination: { paginationModel: { pageSize: 10 } }
                                }}
                                pageSizeOptions={[5, 10, 25]}
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