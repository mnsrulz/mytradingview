'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Box, Chip, Dialog, DialogContent, Divider, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import HistoryIcon from "@mui/icons-material/History";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import InsightsIcon from "@mui/icons-material/Insights";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CalculateIcon from "@mui/icons-material/Calculate";
import AssessmentIcon from "@mui/icons-material/Assessment";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import ExploreIcon from "@mui/icons-material/Explore";
import { useAllSymbols } from "@/lib/useAllSymbols";
import { useRecentSymbols } from "@/lib/useRecentSymbols";
import { SearchTickerItem } from "@/lib/types";

const LOGO_BASE = 'https://raw.githubusercontent.com/nvstly/icons/main/ticker_icons';

const TickerLogo = ({ symbol, size = 28 }: { symbol: string; size?: number }) => {
    const [imgError, setImgError] = useState(false);
    if (imgError || !symbol) {
        return (
            <Box sx={{
                width: size, height: size, borderRadius: 1, bgcolor: 'grey.700', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: size * 0.4, fontWeight: 700, flexShrink: 0,
            }}>
                {symbol?.slice(0, 2)}
            </Box>
        );
    }
    return (
        <Box
            component="img"
            src={`${LOGO_BASE}/${symbol}.png`}
            alt={symbol}
            onError={() => setImgError(true)}
            sx={{ width: size, height: size, borderRadius: 1, objectFit: 'contain', bgcolor: 'grey.800', flexShrink: 0 }}
        />
    );
};

interface Command {
    id: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    action: string;
    keywords: string[];
}

const FEATURE_ALIASES: Record<string, { path: string; label: string }> = {
    exposure: { path: 'options/analyze', label: 'DEX/GEX Exposure' },
    dex: { path: 'options/analyze', label: 'DEX/GEX Exposure' },
    gex: { path: 'options/analyze', label: 'DEX/GEX Exposure' },
    pricing: { path: 'options/pricing', label: 'Option Pricing' },
    price: { path: 'options/pricing', label: 'Option Pricing' },
    iv: { path: 'options/iv', label: 'Implied Volatility' },
    volatility: { path: 'options/iv', label: 'Implied Volatility' },
    'expected-move': { path: 'options/expected-move', label: 'Expected Move' },
    em: { path: 'options/expected-move', label: 'Expected Move' },
    seasonal: { path: 'seasonal', label: 'Seasonal Pattern' },
    history: { path: 'seasonal', label: 'Seasonal Pattern' },
};

const COMMANDS: Command[] = [
    { id: 'beta', label: 'Symbol Explorer', description: 'Browse symbols with /beta/[symbol]', icon: <ExploreIcon />, action: '/beta', keywords: ['beta', 'new', 'symbol', 'explorer'] },
    { id: 'trades', label: 'Trades', description: 'View and manage trades', icon: <TrendingUpIcon />, action: '/trades', keywords: ['trade', 'position'] },
    { id: 'portfolio', label: 'Portfolio', description: 'View portfolio positions', icon: <WorkOutlineIcon />, action: '/portfolio', keywords: ['portfolio', 'position', 'holdings'] },
    { id: 'hedge', label: 'Hedge Tracker', description: 'Manage hedge strategies', icon: <WorkOutlineIcon />, action: '/portfolio/hedge', keywords: ['hedge', 'protection', 'strategy'] },
    { id: 'dex-gex', label: 'DEX/GEX', description: 'Options depth and gamma exposure', icon: <InsightsIcon />, action: '/options/analyze', keywords: ['dex', 'gex', 'exposure', 'gamma', 'depth'] },
    { id: 'pricing', label: 'Option Pricing', description: 'Pricing models and chain analysis', icon: <AttachMoneyIcon />, action: '/options/pricing', keywords: ['pricing', 'option', 'chain', 'price'] },
    { id: 'iv', label: 'Implied Volatility', description: 'IV history and term structure', icon: <ElectricBoltIcon />, action: '/options/iv', keywords: ['iv', 'volatility', 'implied'] },
    { id: 'expected-move', label: 'Expected Move', description: 'Expected price range from options', icon: <CompareArrowsIcon />, action: '/options/expected-move', keywords: ['expected', 'move', 'range'] },
    { id: 'seasonal', label: 'Seasonal', description: 'Historical seasonal trends', icon: <CalendarMonthIcon />, action: '/seasonal', keywords: ['seasonal', 'pattern', 'history'] },
    { id: 'calculator', label: 'Calculator', description: 'Return calculator', icon: <CalculateIcon />, action: '/calculator', keywords: ['calculator', 'return', 'math'] },
    { id: 'reports', label: 'Greeks Report', description: 'Options Greeks report', icon: <AssessmentIcon />, action: '/reports/greeks', keywords: ['greeks', 'report', 'delta', 'gamma'] },
];

type ResultItem =
    | { kind: 'symbol'; data: SearchTickerItem }
    | { kind: 'recent'; symbol: string }
    | { kind: 'command'; data: Command }
    | { kind: 'shortcut'; symbol: string; feature: string; label: string; path: string };

const parseQuery = (query: string): { symbolPart: string; featurePart: string } => {
    const parts = query.trim().split(/\s+/);
    if (parts.length >= 2) {
        return { symbolPart: parts[0], featurePart: parts.slice(1).join(' ') };
    }
    return { symbolPart: query, featurePart: '' };
};

export const CommandBar = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<'switch' | 'full'>('full');
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const { search } = useAllSymbols();
    const { display: recentSymbols, add: addRecent } = useRecentSymbols();

    const isOnBetaSymbolPage = /^\/beta\/[^/]+(\/.*)?$/.test(pathname);
    const currentSymbol = isOnBetaSymbolPage ? pathname.split('/')[2] : null;

    const results: ResultItem[] = useMemo(() => {
        if (mode === 'switch') {
            const searchTerm = query || '';
            const symbolMatches = search(searchTerm).map(s => ({ kind: 'symbol' as const, data: s }));
            if (!searchTerm) {
                const recentItems: ResultItem[] = recentSymbols.map(s => ({ kind: 'recent' as const, symbol: s }));
                return recentItems;
            }
            return symbolMatches;
        }

        if (!query) {
            const recentItems: ResultItem[] = recentSymbols.map(s => ({ kind: 'recent' as const, symbol: s }));
            const commandItems: ResultItem[] = COMMANDS.map(cmd => ({ kind: 'command' as const, data: cmd }));
            return [...recentItems, ...commandItems];
        }

        const { symbolPart, featurePart } = parseQuery(query);
        const featureMatch = featurePart ? Object.entries(FEATURE_ALIASES).find(([alias]) =>
            alias.toLowerCase().startsWith(featurePart.toLowerCase())
        ) : null;

        const symbolMatches = search(symbolPart).map(s => ({ kind: 'symbol' as const, data: s }));

        // If we have a symbol match AND a feature match, show shortcuts
        if (featureMatch && symbolMatches.length > 0) {
            const [alias, feature] = featureMatch;
            const shortcuts: ResultItem[] = symbolMatches.slice(0, 3).map(s => ({
                kind: 'shortcut' as const,
                symbol: s.data.symbol,
                feature: feature.label,
                label: `${s.data.symbol} — ${feature.label}`,
                path: `/beta/${s.data.symbol}/${feature.path}`,
            }));
            return [...shortcuts, ...symbolMatches];
        }

        // Check if query itself matches a feature (show all symbols for that feature)
        if (featureMatch && !featurePart) {
            const commandMatches = COMMANDS.filter(cmd =>
                cmd.label.toLowerCase().includes(query.toLowerCase()) ||
                cmd.keywords.some(kw => kw.includes(query.toLowerCase()))
            ).map(cmd => ({ kind: 'command' as const, data: cmd }));
            return [...symbolMatches, ...commandMatches];
        }

        const commandMatches = COMMANDS.filter(cmd =>
            cmd.label.toLowerCase().includes(query.toLowerCase()) ||
            cmd.description.toLowerCase().includes(query.toLowerCase()) ||
            cmd.keywords.some(kw => kw.includes(query.toLowerCase()))
        ).map(cmd => ({ kind: 'command' as const, data: cmd }));

        return [...symbolMatches, ...commandMatches];
    }, [query, search, recentSymbols]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    const handleDialogEntered = useCallback(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        if (!listRef.current) return;
        const item = listRef.current.children[selectedIndex] as HTMLElement;
        if (item) {
            item.scrollIntoView({ block: 'nearest' });
        }
    }, [selectedIndex]);

    const handleSelect = useCallback((item: ResultItem) => {
        const navigateToSymbol = (symbol: string) => {
            if (mode === 'switch' && isOnBetaSymbolPage) {
                const segments = pathname.split('/');
                segments[2] = symbol;
                router.push(segments.join('/'));
            } else {
                router.push(`/beta/${symbol}`);
            }
        };

        switch (item.kind) {
            case 'symbol':
                addRecent(item.data.symbol);
                navigateToSymbol(item.data.symbol);
                break;
            case 'recent':
                addRecent(item.symbol);
                navigateToSymbol(item.symbol);
                break;
            case 'shortcut':
                addRecent(item.symbol);
                router.push(item.path);
                break;
            case 'command':
                router.push(item.data.action);
                break;
        }
        setOpen(false);
        setQuery('');
    }, [router, addRecent, mode, isOnBetaSymbolPage, pathname]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(i => Math.min(i + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && results[selectedIndex]) {
            e.preventDefault();
            handleSelect(results[selectedIndex]);
        } else if (e.key === 'Escape') {
            setOpen(false);
            setQuery('');
        }
    }, [results, selectedIndex, handleSelect]);

    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setMode('full');
                setOpen(true);
                return;
            }
            if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
                const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
                if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target instanceof HTMLInputElement) {
                    return;
                }
                e.preventDefault();
                setMode('switch');
                setOpen(true);
            }
        };
        document.addEventListener('keydown', handleGlobalKeyDown);
        return () => document.removeEventListener('keydown', handleGlobalKeyDown);
    }, []);

    const getSymbolFromItem = (item: ResultItem): string => {
        if (item.kind === 'symbol') return item.data.symbol;
        if (item.kind === 'recent') return item.symbol;
        if (item.kind === 'shortcut') return item.symbol;
        return '';
    };

    return (
        <Dialog
            open={open}
            onClose={() => { setOpen(false); setQuery(''); }}
            maxWidth="sm"
            fullWidth
            TransitionProps={{ onEntered: handleDialogEntered }}
            PaperProps={{
                sx: {
                    position: 'fixed',
                    top: '15%',
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: '0 16px 70px 0 rgba(0,0,0,0.2)',
                }
            }}
        >
            <DialogContent sx={{ p: 0 }}>
                <TextField
                    inputRef={inputRef}
                    fullWidth
                    placeholder={mode === 'switch' && currentSymbol
                        ? `Switch from ${currentSymbol}...`
                        : "Search symbols, commands, or try 'NVDA exposure'..."
                    }
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Chip label="ESC" size="small" variant="outlined" sx={{ fontSize: 10, height: 20 }} />
                                </InputAdornment>
                            ),
                        }
                    }}
                    sx={{
                        '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                        '& .MuiInputBase-root': { px: 2, py: 1.5 },
                        '& .MuiInputBase-input': { fontSize: '1rem' },
                    }}
                />

                {results.length > 0 && <Divider />}

                <Box ref={listRef} sx={{ maxHeight: 420, overflow: 'auto', py: 0.5 }}>
                    {mode === 'switch' && !query && recentSymbols.length > 0 && (
                        <Stack direction="row" alignItems="center" gap={0.5} sx={{ px: 2, py: 0.5 }}>
                            <HistoryIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                                Recent
                            </Typography>
                        </Stack>
                    )}

                    {mode === 'full' && !query && recentSymbols.length > 0 && (
                        <Stack direction="row" alignItems="center" gap={0.5} sx={{ px: 2, py: 0.5 }}>
                            <HistoryIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                                Recent
                            </Typography>
                        </Stack>
                    )}

                    {mode === 'full' && !query && (
                        <Typography variant="caption" color="text.secondary" sx={{ px: 2, py: 0.5, display: 'block' }}>
                            Commands
                        </Typography>
                    )}

                    {mode === 'full' && query && results.some(r => r.kind === 'symbol') && (
                        <Typography variant="caption" color="text.secondary" sx={{ px: 2, py: 0.5, display: 'block' }}>
                            Symbols
                        </Typography>
                    )}

                    {mode === 'switch' && query && results.length > 0 && (
                        <Typography variant="caption" color="text.secondary" sx={{ px: 2, py: 0.5, display: 'block' }}>
                            Symbols
                        </Typography>
                    )}

                    {mode === 'full' && query && results.some(r => r.kind === 'command') && (
                        <Typography variant="caption" color="text.secondary" sx={{ px: 2, py: 0.5, display: 'block' }}>
                            Commands
                        </Typography>
                    )}

                    {mode === 'full' && query && results.some(r => r.kind === 'shortcut') && (
                        <Typography variant="caption" color="text.secondary" sx={{ px: 2, py: 0.5, display: 'block' }}>
                            Go to
                        </Typography>
                    )}

                    {results.map((item, index) => {
                        const symbol = getSymbolFromItem(item);
                        const label = item.kind === 'symbol' ? item.data.symbol
                            : item.kind === 'recent' ? item.symbol
                            : item.kind === 'shortcut' ? item.label
                            : item.data.label;
                        const sublabel = item.kind === 'symbol' ? item.data.name
                            : item.kind === 'recent' ? 'Recent search'
                            : item.kind === 'shortcut' ? `Open ${item.feature}`
                            : item.data.description;
                        const itemKey = item.kind === 'symbol' ? item.data.symbol
                            : item.kind === 'recent' ? `recent-${item.symbol}`
                            : item.kind === 'shortcut' ? `shortcut-${item.symbol}-${item.path}`
                            : item.data.id;

                        return (
                            <Stack
                                key={itemKey}
                                direction="row"
                                alignItems="center"
                                gap={1.5}
                                sx={{
                                    px: 2,
                                    py: 1,
                                    mx: 0.5,
                                    borderRadius: 1,
                                    cursor: 'pointer',
                                    bgcolor: index === selectedIndex ? 'action.selected' : 'transparent',
                                    '&:hover': { bgcolor: 'action.hover' },
                                }}
                                onClick={() => handleSelect(item)}
                                onMouseEnter={() => setSelectedIndex(index)}
                            >
                                {item.kind === 'command' ? (
                                    <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', width: 28, justifyContent: 'center', flexShrink: 0 }}>
                                        {item.data.icon}
                                    </Box>
                                ) : (
                                    <TickerLogo symbol={symbol} size={28} />
                                )}
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <Typography variant="body2" fontWeight="medium" noWrap>
                                        {label}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" noWrap>
                                        {sublabel}
                                    </Typography>
                                </Box>
                                {(item.kind === 'symbol' || item.kind === 'recent' || item.kind === 'shortcut') && (
                                    <Chip
                                        label={mode === 'switch' ? 'Switch' : 'Go'}
                                        size="small"
                                        variant="outlined"
                                        color="primary"
                                        sx={{ height: 20, fontSize: 10, flexShrink: 0 }}
                                    />
                                )}
                            </Stack>
                        );
                    })}

                    {query && results.length === 0 && (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                No results for &quot;{query}&quot;
                            </Typography>
                        </Box>
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    );
}
