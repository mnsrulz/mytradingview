'use client';

import React, { useMemo } from "react";
import { Card, Box, Typography, Stack, Divider } from "@mui/material";
import { green, red } from "@mui/material/colors";
import { percentageFormatter } from "@/lib/formatters";
import { PositionPricing } from "@/lib/usePortfolio";
import NumberFlow from "@number-flow/react";

interface HoldingsSummaryProps {
  positions: PositionPricing[];
  selectedAccountId: string;
}

/**
 * A professional KPI block for displaying change metrics
 */
const StatBlock = ({
  label,
  value,
  percent
}: {
  label: string;
  value: number;
  percent: number
}) => {
  const isPositive = value >= 0;
  const color = isPositive ? green[700] : red[700];

  return (
    <Box sx={{ flex: 1 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight={700}
        sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block', letterSpacing: 0.5 }}
      >
        {label}
      </Typography>
      <Stack direction="row" spacing={1} alignItems="baseline">
        <Typography variant="h6" fontWeight={700} sx={{ color, lineHeight: 1 }}>
          {isPositive ? '+' : ''}{<NumberFlow value={value} locales="en-US" format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} />}
        </Typography>
        <Typography variant="body2" fontWeight={600} sx={{ color, opacity: 0.8 }}>
          {isPositive ? '+' : ''}{percentageFormatter(percent)}
        </Typography>
      </Stack>
    </Box>
  );
};

export function HoldingsSummary({
  positions,
  selectedAccountId,
}: HoldingsSummaryProps) {

  const summary = useMemo(() => {
    // 1. Filter positions by account if selected
    const filtered = selectedAccountId
      ? positions.filter((p) => p.brokerAccountId === selectedAccountId)
      : positions;

    // 2. Calculate Market Value and Cost Basis
    const totalValue = filtered.reduce((acc, p) => acc + p.totalValue, 0);
    const totalCost = filtered.reduce((acc, p) => acc + (p.costBasis || 0) * p.quantity, 0);

    // 3. Today's Performance (Assuming p.change is the daily price delta)
    const todayChange = filtered.reduce((acc, p) => acc + (p.change * p.quantity), 0);
    const dayStartValue = totalValue - todayChange;
    const todayChangePercent = dayStartValue > 0 ? (todayChange / dayStartValue) : 0;

    // 4. Total Overall Performance
    const totalChange = totalValue - totalCost;
    const totalChangePercent = totalCost > 0 ? (totalChange / totalCost) : 0;

    return {
      totalValue,
      todayChange,
      todayChangePercent,
      totalChange,
      totalChangePercent,
      count: filtered.length
    };
  }, [positions, selectedAccountId]);

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        bgcolor: 'background.paper',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        my: 1
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* Header: Main Portfolio Balance */}
        <Typography
          variant="overline"
          color="text.secondary"
          fontWeight={600}
          sx={{ letterSpacing: 1.2 }}
        >
          {selectedAccountId ? 'Account Value' : 'Total Portfolio Value'}
        </Typography>
        <Typography
          variant="h3"
          fontWeight={800}
          sx={{ mb: 3, mt: 0.5, letterSpacing: -1 }}
        >
          <NumberFlow value={summary.totalValue} locales="en-US" format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} />
        </Typography>

        <Divider sx={{ mb: 2.5, borderStyle: 'dashed' }} />

        {/* Stats Row: Today vs. Total */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={3}
          divider={<Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' }, mx: 1 }} />}
        >
          <StatBlock
            label="Today's Change"
            value={summary.todayChange}
            percent={summary.todayChangePercent}
          />
          <StatBlock
            label="Total Returns"
            value={summary.totalChange}
            percent={summary.totalChangePercent}
          />
        </Stack>
      </Box>

      {/* Footer Strip */}
      <Box
        sx={{
          px: 3,
          py: 1,
          bgcolor: 'action.hover',
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        <Typography variant="caption" color="text.disabled" fontWeight={600}>
          LIVE UPDATES ACTIVE
        </Typography>
        <Typography variant="caption" color="text.disabled" fontWeight={600}>
          {summary.count} HOLDINGS
        </Typography>
      </Box>
    </Card>
  );
}