import { getColorPallete } from "@/lib/color";
import { DexGexType } from "@/lib/types";
import { CartesianMarkerProps, DatumValue } from "@nivo/core";
import { PartialTheme, usePartialTheme } from "@nivo/theming"
import { createTheme, Theme } from '@mui/material/styles';
import theme from '@/theme';

const colorCodes = getColorPallete();
export const getMarkers = ({ spotPrice, spotPriceLine, exposureType, callWall, putWall }: { spotPrice: number, spotPriceLine: number, exposureType: DexGexType, callWall: number, putWall: number }) => {
    const markers: CartesianMarkerProps<DatumValue>[] = [{
        value: '0',
        axis: 'x'
    }, {
        value: spotPriceLine,
        axis: 'y',
        legendPosition: 'top-left',
        legend: `SPOT PRICE: $${spotPrice.toFixed(2)}`,
        lineStyle: {
            strokeDasharray: '4', color: 'red', stroke: 'red'
        },
        textStyle: {
            stroke: 'red', strokeWidth: 0.25, fontSize: '8px', transform: 'translateY(-8px)'
        }
    }];

    if (exposureType === DexGexType.GEX) {
        if (callWall == putWall) {
            markers.push({
                value: callWall,
                axis: 'y',
                legendPosition: spotPriceLine == callWall ? 'top-right' : 'top-left',
                legend: `WALL: $${callWall}`,
                lineStyle: {
                    strokeDasharray: '4', color: 'violet', stroke: 'violet'
                },
                textStyle: {
                    stroke: 'violet', strokeWidth: 0.25, fontSize: '8px', transform: 'translateY(-8px)'
                }
            })
        } else {

            markers.push({
                value: callWall,
                axis: 'y',
                legendPosition: spotPriceLine == callWall ? 'top-right' : 'top-left',
                legend: `CALL WALL: $${callWall}`,
                lineStyle: {
                    strokeDasharray: '4', color: 'green', stroke: 'green'
                },
                textStyle: {
                    stroke: 'green', strokeWidth: 0.25, fontSize: '8px', transform: 'translateY(-8px)'
                }
            })

            markers.push({
                value: putWall,
                axis: 'y',
                legendPosition: spotPriceLine == putWall ? 'top-right' : 'top-left',
                legend: `PUT WALL: $${putWall}`,
                lineStyle: {
                    strokeDasharray: '4', color: 'orange', stroke: 'orange'
                },
                textStyle: {
                    stroke: 'orange', strokeWidth: 0.25, fontSize: '8px', margin: 0, padding: 0, top: 0, transform: 'translateY(-8px)'
                }
            })
        }
    }
    return markers;
}

export const getLegends = (expirations: string[]) => {
    return [
        {
            dataFrom: 'keys',
            data: expirations.map(k => ({ label: k, color: colorCodes[expirations.indexOf(k)], id: k })),
            anchor: 'top-right',
            direction: 'column',
            justify: false,
            translateX: 80,
            itemWidth: 80,
            itemHeight: 16,
            itemsSpacing: 2,
            symbolSize: 10,
            effects: [
                {
                    on: 'hover',
                    style: {
                        itemOpacity: 1,
                    },
                },
            ],
        },
    ]
}
const lightTheme = createTheme({
    palette: {
        mode: 'light'
    }
})
const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});
export const getTheme = (isDarkMode: boolean) => {
    const muiTheme = isDarkMode ? darkTheme : lightTheme;
    return {
        axis: {
            domain: {
                line: {
                    stroke: muiTheme.palette.divider, // Use MUI divider color for axis lines
                    strokeWidth: 1,
                },
            },
            ticks: {
                line: {
                    stroke: muiTheme.palette.text.primary, // Use MUI divider color for tick lines
                    strokeWidth: 1,
                },
                text: {
                    fill: muiTheme.palette.text.primary,
                    //fill: isDarkMode ? muiTheme.palette.text.secondary : muiTheme.palette.text.primary, // Adjust text color for dark mode
                    fontSize: '12px',//muiTheme.typography.body2,
                    font: muiTheme.typography.fontFamily
                },


            },
            legend: {
                text: {
                    fill: muiTheme.palette.text.primary,
                    font: muiTheme.typography.fontFamily
                },
            },
        },
        grid: {
            line: {
                stroke: isDarkMode ? muiTheme.palette.grey[800] : muiTheme.palette.divider, // Adjust grid line color for dark mode
                strokeWidth: 1,
            },
        },
        legends: {
            text: {
                fill: isDarkMode ? muiTheme.palette.text.secondary : muiTheme.palette.text.primary, // Adjust legend label color for dark mode
                fontSize: muiTheme.typography.body2.fontSize,
            },
        },
        tooltip: {
            container: {
                background: isDarkMode ? muiTheme.palette.grey[900] : muiTheme.palette.background.paper, // Adjust tooltip background for dark mode
                color: isDarkMode ? muiTheme.palette.text.primary : muiTheme.palette.text.primary, // Adjust tooltip text color for dark mode
                fontSize: muiTheme.typography.body2.fontSize,
                borderRadius: muiTheme.shape.borderRadius,
                boxShadow: muiTheme.shadows[1], // Use MUI shadow for tooltip
                padding: muiTheme.spacing(1),
            },
        },
    } as PartialTheme;
};
