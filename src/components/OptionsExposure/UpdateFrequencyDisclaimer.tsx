import { Box, Link, Typography } from "@mui/material"

export const UpdateFrequencyDisclaimer = () => {
    return <Box textAlign="right">
        <Typography variant="caption" fontStyle={"italic"}>Click <Link href="https://github.com/mnsrulz/mytradingview#data-update-frequencies">here</Link> to know more about when this data updates</Typography>
    </Box>
}