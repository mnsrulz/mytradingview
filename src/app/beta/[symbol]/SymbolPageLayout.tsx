import { Stack, Typography, Breadcrumbs, Link as MuiLink } from "@mui/material";
import Link from "next/link";

interface SymbolLayoutProps {
    symbol: string;
    feature: string;
    featureLabel: string;
    children: React.ReactNode;
}

export const SymbolPageLayout = ({ symbol, feature, featureLabel, children }: SymbolLayoutProps) => {
    return (
        <Stack spacing={1}>
            <Breadcrumbs aria-label="breadcrumb">
                <MuiLink
                    component={Link}
                    href={`/beta/${symbol}`}
                    underline="hover"
                    color="inherit"
                    variant="body2"
                >
                    {symbol}
                </MuiLink>
                <Typography variant="body2" color="text.primary">
                    {featureLabel}
                </Typography>
            </Breadcrumbs>
            {children}
        </Stack>
    );
}
