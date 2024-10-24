import { HistoricalDataResponse } from "@/lib/types"
import dayjs from "dayjs";
import { ConditionalFormattingBox } from "./ConditionalFormattingBox";
import { numberFormatter, percentageFormatter } from "@/lib/formatters";
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider } from "@mui/material";
import { TickerSearchDialog } from "./TickerSearchDialog";

type MyProps = {
    xLabels: string[],
    yLabels: string[],
    data: number[][],
    formatter: 'percent' | 'number'
}
const formatters = {'percent': percentageFormatter, number: numberFormatter}
export const HeatMap = (props: MyProps) => {
    const { xLabels, yLabels, data, formatter } = props;
    const fmt = formatters[formatter];
    return <TableContainer component={Paper} sx={{
        width: 'auto', // Set width of the TableContainer to auto
        maxWidth: '100%', // Optional: prevent it from exceeding the parent width
        display: 'inline-block', // Make sure the container doesn't stretch
        mt: 1
    }}>
        <Table size="small" sx={{
            tableLayout: 'auto', // Allow table to auto-adjust to content
            width: 'auto' // Ensure the table takes only the width it needs
        }} padding='none'>
            <TableHead>
                <TableRow key="tablehead-row">
                    <TableCell key='month' sx={{ px: 1 }}>Month</TableCell>
                    {
                        xLabels.map(c => <TableCell align="right" sx={{ px: 1 }} key={c}>{c}</TableCell>)
                    }
                </TableRow>
            </TableHead>
            <TableBody>
                {data.map((row, ix) => (
                    <TableRow
                        key={`row-${ix}`}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 }, padding: 0 }}
                    >
                        <TableCell key={`${ix}-${yLabels[ix]}`} component="th" scope="row" sx={{ width: 100, px: 1 }}>
                            {yLabels[ix]}
                        </TableCell>
                        {
                            row.map((c, ixx) => <TableCell key={`${ix}-${ixx}`} align="right" sx={{ padding: 0, width: 80, height: '32px' }} padding="none">
                                {/* {row[`d${c}`]} */}
                                <ConditionalFormattingBox value={c * 1000} formattedValue={`${fmt(c)}`} />
                            </TableCell>)
                        }
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>
}