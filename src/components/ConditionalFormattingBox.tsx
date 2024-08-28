import { getColor } from "@/lib/color";
import { Box } from "@mui/material";
type IConditionalFormattingBoxProps = { value: number, formattedValue: string }
export const ConditionalFormattingBox = (props: IConditionalFormattingBoxProps) => {
    const { value, formattedValue } = props;
    if (!Number.isNaN(value)) {
        let color = getColor(value);
        return <Box
            sx={{
                backgroundColor: color,
                width: "100%",
                height: "100%",
                padding: "2px"
            }}
        >
            {formattedValue}
        </Box>
        // return <Typography variant="body1" style={{ backgroundColor: color }}>{p.formattedValue}</Typography>
        // return <span style={{ backgroundColor: color }}>{p.formattedValue}</span>
    }
}