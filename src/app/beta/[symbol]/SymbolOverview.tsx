'use client';
import { useStockPrice } from "@/lib/mzQuotesService";
import { Box, Card, CardContent, CardActionArea, Divider, Grid, Skeleton, Stack, Typography } from "@mui/material";
import { green, red } from "@mui/material/colors";
import InsightsIcon from "@mui/icons-material/Insights";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import Link from "next/link";
import { WidgetGrid } from "@/components/widgets/WidgetGrid";

const FEATURES = [
    { label: 'DEX/GEX Exposure', description: 'Options depth and gamma exposure', href: 'options/analyze', icon: <InsightsIcon /> },
    { label: 'Option Pricing', description: 'Pricing models and chain analysis', href: 'options/pricing', icon: <AttachMoneyIcon /> },
    { label: 'Implied Volatility', description: 'IV history and term structure', href: 'options/iv', icon: <ElectricBoltIcon /> },
    { label: 'Expected Move', description: 'Expected price range from options', href: 'options/expected-move', icon: <CompareArrowsIcon /> },
];

export const SymbolOverview = ({ symbol }: { symbol: string }) => {
    const { quotes } = useStockPrice(symbol);
    const quote = quotes[symbol];

    return (
        <Stack spacing={2}>
            <Stack direction="row" alignItems="center" gap={2}>
                <Typography variant="h4" fontWeight="bold">
                    {symbol}
                </Typography>
                {quote ? (
                    <Stack direction="row" alignItems="baseline" gap={1}>
                        <Typography variant="h5" fontWeight="medium">
                            ${quote.price.toFixed(2)}
                        </Typography>
                        <Typography
                            variant="body1"
                            fontWeight="medium"
                            sx={{ color: quote.change >= 0 ? green[600] : red[600] }}
                        >
                            {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)} ({quote.changePercent.toFixed(2)}%)
                        </Typography>
                    </Stack>
                ) : (
                    <Skeleton variant="text" width={200} height={40} />
                )}
            </Stack>

            <Divider />

            <Typography variant="h6" fontWeight="medium">
                Analytics
            </Typography>

            <Grid container spacing={2}>
                {FEATURES.map((feature) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={feature.href}>
                        <Card variant="outlined" sx={{ height: '100%' }}>
                            <CardActionArea
                                component={Link}
                                href={`/beta/${symbol}/${feature.href}`}
                                sx={{ height: '100%' }}
                            >
                                <CardContent>
                                    <Stack spacing={1}>
                                        <Stack direction="row" alignItems="center" gap={1} sx={{ color: 'primary.main' }}>
                                            {feature.icon}
                                            <Typography variant="subtitle1" fontWeight="medium">
                                                {feature.label}
                                            </Typography>
                                        </Stack>
                                        <Typography variant="body2" color="text.secondary">
                                            {feature.description}
                                        </Typography>
                                    </Stack>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Divider />

            <Typography variant="h6" fontWeight="medium">
                Metrics
            </Typography>

            <WidgetGrid symbol={symbol} currentPrice={quote?.price} />
        </Stack>
    );
}
