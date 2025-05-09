import { DexGexType } from "@/lib/types";
import { CartesianMarkerProps, DatumValue } from "@nivo/core";

export const getMarkers = ({ spotPrice, spotPriceLine, exposureType, callWall, putWall }: { spotPrice: number, spotPriceLine: number, exposureType: DexGexType, callWall: string, putWall: string }) => {
    const markers: CartesianMarkerProps<DatumValue>[] = [{
        value: '0',
        axis: 'x'
    }, {
        value: `${spotPriceLine}`,
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
                value: `${callWall}`,
                axis: 'y',
                legendPosition: spotPriceLine == Number(callWall) ? 'top-right' : 'top-left',
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
                value: `${callWall}`,
                axis: 'y',
                legendPosition: spotPriceLine == Number(callWall) ? 'top-right' : 'top-left',
                legend: `CALL WALL: $${callWall}`,
                lineStyle: {
                    strokeDasharray: '4', color: 'green', stroke: 'green'
                },
                textStyle: {
                    stroke: 'green', strokeWidth: 0.25, fontSize: '8px', transform: 'translateY(-8px)'
                }
            })

            markers.push({
                value: `${putWall}`,
                axis: 'y',
                legendPosition: spotPriceLine == Number(putWall) ? 'top-right' : 'top-left',
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