'use client';
import { useDynamicQuery } from '@/lib/socket';
import Editor from '@monaco-editor/react';
import { Box, Button, CircularProgress, Divider, FormControl, Paper, Stack, Typography, useColorScheme, useTheme } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useState } from 'react';
import { SymbolsSelector } from '../IVHistorical/SymbolsSelector';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Panel, Group, Separator } from "react-resizable-panels";


const knownColumns = ["quote_date", "expiration_date", "dte", "option_ticker", "option_type", "strike_price", "open_interest", "option_volume", "delta", "gamma", "vega", "theta", "rho", "theoretical_price", "implied_volatility", "option_open_price", "option_high_price", "bid_price", "ask_price", "mid_price", "liquidity_tier", "volume_oi_ratio", "underlying_symbol", "underlying_close_price", "moneyness", "moneyness_percent", "expiry_bucket"];

//add a button to execute the query and show the results in a table below the editor
//with loading state and error handling
export const SqlPlayground = (props: { symbols: string[] }) => {
    const { symbols } = props;
    const [symbol, setSymbol] = useState(symbols[0]);
    const [query, setQuery] = useState('SELECT * FROM dataset');
    const [executedQuery, setExecutedQuery] = useState(query);
    const { result, isLoading, hasError, error } = useDynamicQuery(symbol, executedQuery);

    const theme = useTheme();

    const { mode: colorMode } = useColorScheme();
    const isDarkMode = colorMode === 'dark';


    const columns =
        result?.length > 0
            ? Object.keys(result[0]).map((key) => ({
                field: key,
                headerName: key,
                //flex: 1,
            }))
            : [];

    const rows =
        result?.map((row, index) => ({
            id: index,
            ...row,
        })) || [];

    return (
        <Stack spacing={2}>
            {/* Top Controls */}
            <Paper sx={{ overflowX: 'auto' }}>
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    p={1}
                    spacing={2}
                >
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                        <SymbolsSelector
                            symbols={symbols}
                            symbol={symbol}
                            handleSymbolChange={setSymbol}
                        />
                    </FormControl>

                    <Button
                        variant="contained"
                        startIcon={<PlayArrowIcon />}
                        onClick={() => setExecutedQuery(query)}
                    >
                        Execute Query
                    </Button>
                </Stack>
            </Paper>

            <Group orientation="vertical" style={{ height: '90vh' }}>
                <Panel style={{padding: 1}}>
                    {/* SQL Editor */}
                    <Paper sx={{ height: '100%', display: 'flex' }}>
                        <Editor
                            language="sql"
                            //height="100%"
                            value={query}
                            onChange={(value) => setQuery(value || '')}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 13,
                                scrollBeyondLastLine: false,
                            }}
                            theme={isDarkMode ? 'vs-dark' : 'light'}
                            onMount={(editor, monaco) => {
                                editor.addCommand(
                                    monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
                                    () => setExecutedQuery(editor.getValue())
                                );

                                monaco.languages.registerCompletionItemProvider('sql', {
                                    provideCompletionItems: () => {
                                        return {
                                            suggestions: knownColumns.map((col) => ({
                                                label: col,
                                                kind: monaco.languages.CompletionItemKind.Field,
                                                insertText: col,
                                                insertTextRules:
                                                    monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                detail: 'column'
                                            }))
                                        };
                                    }
                                });
                            }}
                        />
                    </Paper>
                </Panel>
                <Separator />
                <Panel>
                    <Paper>
                        {hasError ? (
                            <Typography color="error" p={2}>
                                {error || 'An error occurred while running query'}
                            </Typography>
                        ) : isLoading ? (
                            <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                p={3}
                            >
                                <CircularProgress size={24} />
                            </Box>
                        ) : result?.length ? (
                            <DataGrid
                                columns={columns}
                                rows={rows}
                                autoHeight
                                density="compact"
                                rowHeight={48}
                                disableColumnMenu
                                disableColumnSorting
                                disableColumnSelector
                                loading={isLoading}
                                pagination={true}
                                initialState={{
                                    pagination: {
                                        paginationModel: {
                                            pageSize: 10
                                        }
                                    }
                                }}
                                pageSizeOptions={[5, 10, 25]}
                                sx={{
                                    '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within':
                                    {
                                        outline: 'none',
                                    },
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
}