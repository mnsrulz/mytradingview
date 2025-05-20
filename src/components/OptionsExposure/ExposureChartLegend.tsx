import { getColorPallete } from "@/lib/color";
import { Box, Stack, Typography } from "@mui/material";
const colorCodes = getColorPallete();

export const ExposureChartLegend = (props: { expirations: string[], showLegendOnTop: boolean }) => {
    //check back later on how to optimize it
    const { expirations, showLegendOnTop } = props;
    if (showLegendOnTop) {
        return <Stack direction={'row'} sx={{ flexWrap: 'wrap' }} columnGap={2}>
            {
                expirations.map((e, ix) => <Stack key={ix} direction={'column'} justifyContent={'space-evenly'}>
                    <Stack direction="row" alignItems="center" columnGap={1} >
                        <Box width={24} height={8} sx={{ bgcolor: colorCodes[ix] }}></Box>
                        <Typography variant="caption">{e}</Typography>
                    </Stack>
                </Stack>)
            }
        </Stack>
    }
    return <Stack direction={'column'} width={128}>
        {
            expirations.map((e, ix) => <Stack key={ix} direction={'column'} justifyContent={'space-evenly'}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Box width={32} height={8} sx={{ bgcolor: colorCodes[ix] }}></Box>
                    <Typography variant="caption">{e}</Typography>
                </Stack>
            </Stack>)
        }
    </Stack>
}
