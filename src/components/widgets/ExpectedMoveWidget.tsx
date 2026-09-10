'use client';

import {
    Box,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    useTheme,
} from '@mui/material';
import { useState } from 'react';

import { useExpectedMove } from '@/lib/socket';
import { WidgetShell } from './WidgetShell';

interface ExpectedMoveWidgetProps {
    symbol: string;
    lookbackDays: number;
    currentPrice?: number;
}

interface ExpectedMoveBarProps {
    currentPrice: number;
    min: number;
    max: number;
}

/**
 * Visualizes:
 *
 *   Expected range  = solid bar
 *   Outside range   = red dotted extension
 *   Current price   = colored marker
 *
 * The visual scale expands when current price moves outside
 * the expected range.
 */
const ExpectedMoveBar = ({
    currentPrice,
    min,
    max,
}: ExpectedMoveBarProps) => {
    const theme = useTheme();

    const isBelowRange = currentPrice < min;
    const isAboveRange = currentPrice > max;
    const isOutsideRange = isBelowRange || isAboveRange;

    /*
     * Dynamic display scale.
     *
     * Normally:
     *   min ---------------- max
     *
     * If price moves above:
     *   min -------- max -------- current
     *
     * If price moves below:
     *   current -------- min -------- max
     */
    const displayMin = Math.min(min, currentPrice);
    const displayMax = Math.max(max, currentPrice);
    const displayRange = displayMax - displayMin || 1;

    const toPct = (price: number) =>
        ((price - displayMin) / displayRange) * 100;

    const minPct = toPct(min);
    const maxPct = toPct(max);
    const currentPct = toPct(currentPrice);

    /*
     * Determine marker severity based on how far
     * current price has moved relative to the expected range.
     */
    const expectedCenter = (min + max) / 2;
    const expectedHalf = (max - min) / 2 || 1;

    const normalizedDistance =
        Math.abs(currentPrice - expectedCenter) / expectedHalf;

    const markerColor =
        normalizedDistance > 1
            ? theme.palette.error.main
            : normalizedDistance > 0.7
                ? theme.palette.warning.main
                : theme.palette.success.main;

    /*
     * Distance beyond the expected boundary.
     *
     * Example:
     * Expected = 95 - 105
     * Current  = 110
     *
     * 5 points beyond / 5 point expected half-range
     * = 100% beyond
     */
    const outsidePct = isOutsideRange
        ? Math.round(
            ((isBelowRange
                ? min - currentPrice
                : currentPrice - max) /
                expectedHalf) *
            100
        )
        : 0;

    return (
        <Box>
            {/* -------------------------------------------------- */}
            {/* Top labels                                         */}
            {/* -------------------------------------------------- */}

            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={0.5}
            >
                <Typography
                    variant="caption"
                    color={isBelowRange ? markerColor : 'text.secondary'}
                    fontSize="0.65rem"
                    fontWeight={600}
                >
                    ${min.toFixed(1)}
                </Typography>

                <Typography
                    variant="caption"
                    color="text.secondary"
                    fontSize="0.6rem"
                    fontWeight={600}
                >
                    EXPECTED RANGE
                </Typography>

                <Typography
                    variant="caption"
                    color={isAboveRange ? markerColor : 'text.secondary'}
                    fontSize="0.65rem"
                    fontWeight={600}
                >
                    ${max.toFixed(1)}
                </Typography>
            </Stack>

            {/* -------------------------------------------------- */}
            {/* Main visualization                                  */}
            {/* -------------------------------------------------- */}

            <Box
                sx={{
                    position: 'relative',
                    height: 16,
                }}
            >
                {/* Background track */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 4,
                        left: 0,
                        right: 0,
                        height: 8,
                        bgcolor: 'grey.100',
                        borderRadius: 4,
                    }}
                />

                {/* ------------------------------------------------ */}
                {/* Expected range - SOLID                           */}
                {/* ------------------------------------------------ */}

                <Box
                    sx={{
                        position: 'absolute',
                        top: 4,
                        left: `${minPct}%`,
                        width: `${Math.max(maxPct - minPct, 1)}%`,
                        height: 8,
                        bgcolor: 'primary.light',
                        borderRadius: 4,
                    }}
                />

                {/* ------------------------------------------------ */}
                {/* Below expected range - RED DOTTED                */}
                {/* ------------------------------------------------ */}

                {isBelowRange && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 5,
                            left: 0,
                            width: `${minPct}%`,
                            height: 6,

                            background: `repeating-linear-gradient(
                                90deg,
                                ${theme.palette.error.main} 0px,
                                ${theme.palette.error.main} 3px,
                                transparent 3px,
                                transparent 7px
                            )`,
                        }}
                    />
                )}

                {/* ------------------------------------------------ */}
                {/* Above expected range - RED DOTTED                */}
                {/* ------------------------------------------------ */}

                {isAboveRange && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 5,
                            left: `${maxPct}%`,
                            width: `${100 - maxPct}%`,
                            height: 6,

                            background: `repeating-linear-gradient(
                                90deg,
                                ${theme.palette.error.main} 0px,
                                ${theme.palette.error.main} 3px,
                                transparent 3px,
                                transparent 7px
                            )`,
                        }}
                    />
                )}

                {/* ------------------------------------------------ */}
                {/* Expected range boundaries                        */}
                {/* ------------------------------------------------ */}

                {isOutsideRange && (
                    <>
                        <Box
                            sx={{
                                position: 'absolute',
                                left: `${minPct}%`,
                                top: 2,
                                width: 2,
                                height: 12,
                                bgcolor: 'text.secondary',
                                transform: 'translateX(-50%)',
                                zIndex: 1,
                            }}
                        />

                        <Box
                            sx={{
                                position: 'absolute',
                                left: `${maxPct}%`,
                                top: 2,
                                width: 2,
                                height: 12,
                                bgcolor: 'text.secondary',
                                transform: 'translateX(-50%)',
                                zIndex: 1,
                            }}
                        />
                    </>
                )}

                {/* ------------------------------------------------ */}
                {/* Current price marker                             */}
                {/* ------------------------------------------------ */}

                <Box
                    sx={{
                        position: 'absolute',
                        left: `${currentPct}%`,
                        top: 1,

                        width: 14,
                        height: 14,

                        borderRadius: '50%',
                        bgcolor: markerColor,

                        border: '2px solid white',
                        transform: 'translateX(-50%)',

                        boxShadow: 2,
                        zIndex: 3,
                    }}
                />
            </Box>

            {/* -------------------------------------------------- */}
            {/* Bottom information                                  */}
            {/* -------------------------------------------------- */}

            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mt={0.5}
            >
                <Typography
                    variant="caption"
                    color="text.secondary"
                    fontSize="0.6rem"
                >
                    Expected: ${min.toFixed(0)} – ${max.toFixed(0)}
                </Typography>

                {isOutsideRange && (
                    <Typography
                        variant="caption"
                        color="error.main"
                        fontSize="0.6rem"
                        fontWeight={700}
                    >
                        {outsidePct}% beyond
                    </Typography>
                )}

                <Typography
                    variant="caption"
                    color={markerColor}
                    fontSize="0.6rem"
                    fontWeight={700}
                >
                    Current: ${currentPrice.toFixed(2)}
                </Typography>
            </Stack>
        </Box>
    );
};

export const ExpectedMoveWidget = ({
    symbol,
    lookbackDays,
    currentPrice: currentPriceProp,
}: ExpectedMoveWidgetProps) => {
    const [expiryMode, setExpiryMode] =
        useState<'weekly' | 'monthly'>('monthly');

    const {
        data,
        isLoading,
        hasError,
        error,
    } = useExpectedMove(
        symbol,
        lookbackDays,
        expiryMode,
    );

    const latest =
        data.length > 0
            ? data[data.length - 1]
            : null;

    const lastClose =
        latest?.last_close ?? 0;

    /*
     * Use live/current price when supplied.
     * Otherwise fall back to latest close.
     */
    const currentPrice =
        currentPriceProp ?? lastClose;

    /*
     * Expected move percentage should be based
     * on the price from which the expected move
     * was calculated.
     */
    const percentage =
        latest && latest.last_close > 0
            ? (latest.straddle_price / latest.last_close) * 100
            : null;

    /*
     * Expected range is always centered around
     * the latest close.
     */
    const expectedMin =
        latest
            ? latest.last_close - latest.straddle_price
            : 0;

    const expectedMax =
        latest
            ? latest.last_close + latest.straddle_price
            : 0;

    return (
        <WidgetShell
            title="EXPECTED MOVE"
            headerAction={
                <ToggleButtonGroup
                    value={expiryMode}
                    exclusive
                    onChange={(_, value) => {
                        if (value !== null) {
                            setExpiryMode(value);
                        }
                    }}
                    size="small"
                >
                    <ToggleButton
                        value="weekly"
                        sx={{
                            px: 1,
                            py: 0.25,
                            minHeight: 28,
                            textTransform: 'none',
                        }}
                    >
                        W
                    </ToggleButton>

                    <ToggleButton
                        value="monthly"
                        sx={{
                            px: 1,
                            py: 0.25,
                            minHeight: 28,
                            textTransform: 'none',
                        }}
                    >
                        M
                    </ToggleButton>
                </ToggleButtonGroup>
            }
            loading={isLoading}
            error={hasError ? error : undefined}
        >
            <Stack spacing={0.75}>
                {/* Expected move percentage */}
                {percentage !== null && latest && (
                    <Stack
                        direction="row"
                        alignItems="baseline"
                        spacing={0.5}
                    >
                        <Typography
                            variant="subtitle1"
                            fontWeight={700}
                        >
                            {percentage.toFixed(2)}%
                        </Typography>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            (${latest.straddle_price.toFixed(2)})
                        </Typography>
                    </Stack>
                )}

                {/* Expected move bar */}
                {latest && currentPrice > 0 && (
                    <ExpectedMoveBar
                        currentPrice={currentPrice}
                        min={expectedMin}
                        max={expectedMax}
                    />
                )}
            </Stack>
        </WidgetShell>
    );
};