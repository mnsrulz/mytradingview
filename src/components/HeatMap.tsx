import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Box,
} from "@mui/material";
import { ConditionalFormattingCell } from "./ConditionalFormattingBox";
import { numberFormatter, percentageFormatter, currencyCompactFormatter } from "@/lib/formatters";
import { getColorV2 } from "@/lib/color";

export type GetColorProps = { value: number, minValue: number, maxValue: number, rowIndex: number, colIndex: number }
type HeatMapProps = {
    zeroHeaderLabel: string;
    xLabels: string[];
    yLabels: string[];
    data: number[][];
    formatter: "percent" | "number" | "currency";
    showLegend?: boolean;
    useMinMaxValuesForColorScale?: boolean;
    columnWidth?: number;
    highlightRowIndex?: number;
    displayZeroValues?: boolean;
    getColorCallback?: (p: GetColorProps) => string;
};

const formatters = {
    percent: percentageFormatter,
    number: numberFormatter,
    currency: currencyCompactFormatter
};

//expose a color callback that takes the value and returns the color, instead of calculating the color inside the cell component. This way we can reuse the color logic for other components like conditional formatting box, and also have more control over the color scale (e.g., using percentiles instead of min/max)
export const HeatMap = ({
    xLabels,
    yLabels,
    data,
    formatter,
    zeroHeaderLabel,
    columnWidth,
    highlightRowIndex,
    displayZeroValues = false,
    getColorCallback,
}: HeatMapProps) => {
    const fmt = formatters[formatter];
    const minValue = Math.min(...data.flat().map(v => v));
    const maxValue = Math.max(...data.flat().map(v => v));
    const cellWidth = 100;
    return (
        <Box>
            <TableContainer
                component={Paper}
                elevation={1}
                sx={{
                    display: "inline-block",
                    maxWidth: "100%",
                }}
            >
                <Table
                    size="small"
                    sx={{
                        tableLayout: columnWidth ? "fixed" : "auto", // Ensure fixed layout for consistent cell sizes
                        //width: columnWidth ? `${columnWidth}px` : '100%', // Set table width based on columnWidth or default to 100%
                        width: 'auto',
                        minWidth: 'unset',
                        "& th, & td": {
                            //borderColor: "divider",
                        },
                        "& td": {
                            fontFamily: "Roboto Mono, monospace",
                            fontWeight: 400,
                        },
                    }}
                    padding="none"
                >
                    {/* === Table Header === */}
                    <TableHead>
                        <TableRow
                            sx={{
                                backgroundColor: "action.hover",
                                "& th": {
                                    fontSize: "0.7rem",
                                    fontWeight: 600,
                                    color: "text.secondary",
                                    fontFamily: "Inter, Roboto, sans-serif",
                                    px: 1,
                                    py: 0.5,
                                },
                            }}
                        >
                            <TableCell key="zero-header" sx={{ width: columnWidth ? `${columnWidth}px` : 'auto' }}>
                                {zeroHeaderLabel}
                            </TableCell>
                            {xLabels.map((label) => (
                                <TableCell key={label} align="center" width={cellWidth}>
                                    {label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    {/* === Table Body === */}
                    <TableBody>
                        {data.map((row, ix) => (
                            <TableRow
                                key={`row-${ix}`}
                                sx={{
                                    "&:last-child td, &:last-child th": { border: 0 },
                                    "& th": {
                                        fontSize: "0.7rem",
                                        fontFamily: "Inter, Roboto, sans-serif",
                                        fontWeight: 500,
                                        //color: "text.secondary",
                                        px: 1,
                                        py: 0.5,
                                    },
                                    "& td": {
                                        fontSize: "0.85rem",
                                        fontWeight: 500,
                                        //color: "text.secondary",
                                        px: 0.5,
                                        py: 0.5,
                                    },
                                }}
                            >
                                {/* Y Label */}
                                <TableCell
                                    component="th"
                                    scope="row"
                                    align="right"
                                    sx={{
                                        whiteSpace: "nowrap",
                                        //backgroundColor: highlightRowIndex === ix ? "rgba(255, 0, 0, 0.1)" : "inherit"
                                        backgroundColor: highlightRowIndex === ix ? "action.selected" : "transparent",
                                        //border: highlightRowIndex === ix ? '5px solid blue': undefined,
                                        fontWeight: highlightRowIndex === ix ? 900 : undefined,
                                        
                                        position: "relative",

                                        ...(highlightRowIndex === ix && {
                                        animation: "glow 1.5s ease-in-out infinite",
                                        }),

                                        "@keyframes glow": {
                                        "0%": {
                                            boxShadow: "0 0 0px rgba(210, 99, 25, 0.4)",
                                        },
                                        "50%": {
                                            boxShadow: "0 0 10px rgba(210, 99, 25, 0.9)",
                                        },
                                        "100%": {
                                            boxShadow: "0 0 0px rgba(210, 99, 25, 0.4)",
                                        },
                                        },

                                        transition: "all 150ms ease",
                                    }}
                                >
                                    {yLabels[ix]}
                                </TableCell>

                                {/* Heatmap Cells */}
                                {row.map((val, ixx) => (
                                    <ConditionalFormattingCell
                                        width={cellWidth}
                                        key={`${ix}-${ixx}`}
                                        value={val == 0 && !displayZeroValues ? NaN : val} // Treat zero as NaN if displayZeroValues is false
                                        formattedValue={fmt(val)}
                                        color={getColorCallback ? getColorCallback({
                                            value: val,
                                            minValue,
                                            maxValue,
                                            colIndex: ixx,
                                            rowIndex: ix
                                        }) : getColorV2(val, minValue, maxValue)}
                                    />
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};
