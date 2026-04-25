import { getColor } from "@/lib/color";
import theme from "@/theme";
import { Box, TableCell } from "@mui/material";
type IConditionalFormattingBoxProps = { value: number, formattedValue: string, color?: string };
export const ConditionalFormattingBox = (props: IConditionalFormattingBoxProps) => {
    const { value, formattedValue } = props;
    if (value && !Number.isNaN(value)) {
        let color = getColor(value);
        return <Box
            sx={{
                backgroundColor: color,
                width: "100%",
                height: "100%",
                padding: "2px", //padding seems to have no effect???
                display: 'flex',
                alignItems: 'center', // Align content vertically
                justifyContent: 'flex-end',
                color: theme.palette.common.black
            }}
        >
            {formattedValue}
        </Box>
        // return <Typography variant="body1" style={{ backgroundColor: color }}>{p.formattedValue}</Typography>
        // return <span style={{ backgroundColor: color }}>{p.formattedValue}</span>
    }
}

export const ConditionalFormattingCell = (props: IConditionalFormattingBoxProps & { width?: number }) => {
    const { value, formattedValue, color, width } = props;
    const isNan = Number.isNaN(value);
    return <TableCell
        sx={{
            backgroundColor: color,
            textAlign: 'right',
            border: "1px solid",
            borderColor: "divider",
        }}
    >
        {isNan ? '' : formattedValue}
    </TableCell>

}