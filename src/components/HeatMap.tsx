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
import { numberFormatter, percentageFormatter } from "@/lib/formatters";

type HeatMapProps = {
    zeroHeaderLabel: string;
    xLabels: string[];
    yLabels: string[];
    data: number[][];
    formatter: "percent" | "number";
    showLegend?: boolean;
};

const formatters = {
    percent: percentageFormatter,
    number: numberFormatter,
};

export const HeatMap = ({
    xLabels,
    yLabels,
    data,
    formatter,
    zeroHeaderLabel
}: HeatMapProps) => {
    const fmt = formatters[formatter];

    return (
        <Box>
            <TableContainer
                component={Paper}
                elevation={2}
                sx={{
                    width: 'auto', // Set width of the TableContainer to auto
                    //   borderRadius: 1.5,
                    // overflow: "hidden",
                    //   display: "inline-block",
                    maxWidth: "100%",
                    display: 'inline-block', // Make sure the container doesn't stretch
                    mt: 2,
                }}
            >
                <Table
                    size="small"
                    sx={{
                        tableLayout: "auto",
                        "& th, & td": {
                            borderColor: "divider",
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
                            <TableCell>{zeroHeaderLabel}</TableCell>
                            {xLabels.map((label) => (
                                <TableCell key={label} align="center">
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
                                        color: "text.secondary",
                                        px: 1,
                                        py: 0.5,
                                    },
                                    "& td": {
                                        fontSize: "0.85rem",
                                        fontWeight: 500,
                                        color: "text.secondary",
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
                                    sx={{ whiteSpace: "nowrap" }}
                                >
                                    {yLabels[ix]}
                                </TableCell>

                                {/* Heatmap Cells */}
                                {row.map((val, ixx) => (
                                    <ConditionalFormattingCell
                                        key={`${ix}-${ixx}`}
                                        value={val}
                                        formattedValue={fmt(val)}
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
