'use client';
import { useRouter } from "next/navigation";
import { useAllSymbols } from "@/lib/useAllSymbols";
import { useRecentSymbols } from "@/lib/useRecentSymbols";
import { useMultiWatchlists } from "@/lib/hooks";
import { useStockPrice } from "@/lib/mzQuotesService";
import {
    Box, Card, CardActionArea, Chip, Divider, Grid, LinearProgress,
    Paper, Stack, TextField, Typography
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import HistoryIcon from "@mui/icons-material/History";
import StarIcon from "@mui/icons-material/Star";
import InsightsIcon from "@mui/icons-material/Insights";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AssessmentIcon from "@mui/icons-material/Assessment";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { green, red } from "@mui/material/colors";
import { NumberFlowGroup } from "@number-flow/react";

const MARKET_PULSE_SYMBOLS = ['SPY', 'QQQ', 'NVDA', 'AMD', 'TSM'];

const QUICK_ACCESS = [
    { label: 'DEX/GEX', description: 'Exposure analysis', href: '/options/analyze', icon: <InsightsIcon /> },
    { label: 'Pricing', description: 'Option chain & pricing', href: '/options/pricing', icon: <AttachMoneyIcon /> },
    { label: 'IV', description: 'Implied volatility', href: '/options/iv', icon: <ElectricBoltIcon /> },
    { label: 'Expected Move', description: 'Price range from options', href: '/options/expected-move', icon: <CompareArrowsIcon /> },
    { label: 'Seasonal', description: 'Historical patterns', href: '/seasonal', icon: <CalendarMonthIcon /> },
    { label: 'Reports', description: 'Greeks & analytics', href: '/reports/greeks', icon: <AssessmentIcon /> },
];

const TickerCard = ({ symbol, price, change, changePercent, loading, onClick }: {
    symbol: string; price?: number; change?: number; changePercent?: number;
    loading: boolean; onClick: () => void;
}) => {
    const isUp = (change ?? 0) >= 0;
    return (
        <Card variant="outlined" sx={{ flex: '1 1 0', minWidth: 120 }}>
            <CardActionArea onClick={onClick} sx={{ p: 1.5 }}>
                <Stack direction="row" alignItems="center" gap={1}>
                    <TickerLogo symbol={symbol} size={20} />
                    <Typography variant="caption" color="text.secondary" fontWeight="bold" letterSpacing={0.5}>
                        {symbol}
                    </Typography>
                </Stack>
                {loading || price === undefined ? (
                    <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                        <LinearProgress sx={{ height: 16, borderRadius: 0.5 }} />
                        <LinearProgress sx={{ height: 12, borderRadius: 0.5, width: '60%' }} />
                    </Stack>
                ) : (
                    <Stack sx={{ mt: 0.5 }}>
                        <Typography variant="body1" fontWeight="bold">
                            {price < 1 ? `$${price.toFixed(4)}` : price >= 1000 ? `$${price.toFixed(0)}` : `$${price.toFixed(2)}`}
                        </Typography>
                        <Typography variant="caption" fontWeight="medium" sx={{ color: isUp ? green[600] : red[600] }}>
                            {isUp ? '+' : ''}{change?.toFixed(2)} ({isUp ? '+' : ''}{changePercent?.toFixed(2)}%)
                        </Typography>
                    </Stack>
                )}
            </CardActionArea>
        </Card>
    );
};

const LOGO_BASE = 'https://raw.githubusercontent.com/nvstly/icons/main/ticker_icons';

const TickerLogo = ({ symbol, size = 28 }: { symbol: string; size?: number }) => {
    const [imgError, setImgError] = useState(false);
    if (imgError) {
        return (
            <Box sx={{
                width: size, height: size, borderRadius: 1, bgcolor: 'grey.700', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: size * 0.4, fontWeight: 700, flexShrink: 0,
            }}>
                {symbol.slice(0, 2)}
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

const SymbolRow = ({ symbol, name, price, change, changePercent, onClick }: {
    symbol: string; name?: string; price?: number; change?: number; changePercent?: number;
    onClick: () => void;
}) => (
    <Stack
        direction="row" alignItems="center" gap={1.5}
        sx={{ px: 1.5, py: 1, borderRadius: 1, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
        onClick={onClick}
    >
        <TickerLogo symbol={symbol} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" fontWeight="medium" noWrap>{symbol}</Typography>
            {name && <Typography variant="caption" color="text.secondary" noWrap>{name}</Typography>}
        </Box>
        {price !== undefined && (
            <Stack alignItems="flex-end">
                <Typography variant="body2" fontWeight="medium">
                    {price < 1 ? `$${price.toFixed(4)}` : price >= 1000 ? `$${price.toFixed(0)}` : `$${price.toFixed(2)}`}
                </Typography>
                {change !== undefined && (
                    <Typography variant="caption" fontWeight="medium" sx={{ color: (change ?? 0) >= 0 ? green[600] : red[600] }}>
                        {(change ?? 0) >= 0 ? '+' : ''}{change?.toFixed(2)}%
                    </Typography>
                )}
            </Stack>
        )}
    </Stack>
);

function BetaHomeContent() {
    const router = useRouter();
    const { loading: symbolsLoading, search, setWatchlisted } = useAllSymbols();
    const { display: recentSymbols, add: addRecent } = useRecentSymbols();
    const { watchlists } = useMultiWatchlists();
    const [query, setQuery] = useState('');

    const watchlistSymbols = useMemo(() => {
        const all = watchlists.flatMap(w => w.tickers.map(t => t.symbol));
        return [...new Set(all)];
    }, [JSON.stringify(watchlists)]);

    const watchlistNames = useMemo(() => {
        const map: Record<string, string> = {};
        for (const w of watchlists) {
            for (const t of w.tickers) {
                if (!map[t.symbol]) map[t.symbol] = t.name;
            }
        }
        return map;
    }, [JSON.stringify(watchlists)]);

    useEffect(() => { setWatchlisted(watchlistSymbols); }, [watchlistSymbols, setWatchlisted]);

    const allSymbolsForPrices = useMemo(() =>
        [...new Set([...MARKET_PULSE_SYMBOLS, ...recentSymbols, ...watchlistSymbols])],
        [recentSymbols, watchlistSymbols]);

    const { quotes, loading: pricesLoading } = useStockPrice(allSymbolsForPrices);

    const searchResults = useMemo(() => query ? search(query).slice(0, 8) : [], [query, search]);

    const handleSelect = (symbol: string) => {
        addRecent(symbol);
        router.push(`/beta/${symbol}`);
    };

    return (
        <NumberFlowGroup>
            <Stack spacing={2.5}>
                <TextField
                    fullWidth
                    placeholder={symbolsLoading ? 'Loading symbols...' : 'Search by symbol or name...'}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={symbolsLoading}
                    autoFocus
                    slotProps={{
                        input: {
                            startAdornment: <SearchIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />,
                            endAdornment: <Chip label="/" size="small" variant="outlined" sx={{ fontSize: 10, height: 20 }} />,
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && searchResults.length > 0) handleSelect(searchResults[0].symbol);
                    }}
                />

                {query && searchResults.length > 0 && (
                    <Paper variant="outlined" sx={{ p: 0.5 }}>
                        {searchResults.map((item) => (
                            <SymbolRow
                                key={item.symbol}
                                symbol={item.symbol}
                                name={item.name}
                                onClick={() => handleSelect(item.symbol)}
                            />
                        ))}
                    </Paper>
                )}

                <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold" letterSpacing={1} sx={{ mb: 1, display: 'block' }}>
                        MARKET PULSE
                    </Typography>
                    <Stack direction="row" spacing={1.5} sx={{ overflowX: 'auto', pb: 0.5 }}>
                        {MARKET_PULSE_SYMBOLS.map((sym) => {
                            const q = quotes[sym];
                            return (
                                <TickerCard
                                    key={sym}
                                    symbol={sym}
                                    price={q?.price}
                                    change={q?.change}
                                    changePercent={q?.changePercent}
                                    loading={pricesLoading}
                                    onClick={() => handleSelect(sym)}
                                />
                            );
                        })}
                    </Stack>
                </Box>

                <Divider />

                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Stack direction="row" alignItems="center" gap={0.5} sx={{ mb: 1 }}>
                            <HistoryIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary" fontWeight="bold" letterSpacing={0.5}>
                                RECENT
                            </Typography>
                        </Stack>
                        <Paper variant="outlined" sx={{ p: 0.5 }}>
                            {recentSymbols.map((sym) => {
                                const q = quotes[sym];
                                return (
                                    <SymbolRow
                                        key={sym}
                                        symbol={sym}
                                        price={q?.price}
                                        change={q?.change}
                                        changePercent={q?.changePercent}
                                        onClick={() => handleSelect(sym)}
                                    />
                                );
                            })}
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <Stack direction="row" alignItems="center" gap={0.5} sx={{ mb: 1 }}>
                            <StarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary" fontWeight="bold" letterSpacing={0.5}>
                                WATCHLIST
                            </Typography>
                        </Stack>
                        <Paper variant="outlined" sx={{ p: 0.5 }}>
                            {watchlistSymbols.length === 0 && (
                                <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                                    No symbols in watchlist
                                </Typography>
                            )}
                            {watchlistSymbols.map((sym) => {
                                const q = quotes[sym];
                                const name = watchlistNames[sym];
                                return (
                                    <SymbolRow
                                        key={sym}
                                        symbol={sym}
                                        name={name}
                                        price={q?.price}
                                        change={q?.change}
                                        changePercent={q?.changePercent}
                                        onClick={() => handleSelect(sym)}
                                    />
                                );
                            })}
                        </Paper>
                    </Grid>
                </Grid>

                <Divider />

                <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold" letterSpacing={1} sx={{ mb: 1, display: 'block' }}>
                        QUICK ACCESS
                    </Typography>
                    <Grid container spacing={1.5}>
                        {QUICK_ACCESS.map((item) => (
                            <Grid size={{ xs: 6, sm: 4, md: 2 }} key={item.href}>
                                <Card variant="outlined" sx={{ height: '100%' }}>
                                    <CardActionArea component={Link} href={item.href} sx={{ p: 1.5 }}>
                                        <Stack spacing={0.5}>
                                            <Box sx={{ color: 'primary.main', display: 'flex' }}>
                                                {item.icon}
                                            </Box>
                                            <Typography variant="body2" fontWeight="medium">{item.label}</Typography>
                                            <Typography variant="caption" color="text.secondary" noWrap>{item.description}</Typography>
                                        </Stack>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Stack>
        </NumberFlowGroup>
    );
}

export default BetaHomeContent;
