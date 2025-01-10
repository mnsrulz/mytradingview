
import { NextResponse } from "next/server";
import { getCurrentPrice, getFullOptionChain } from '@/lib/tradierService';
import { MicroOptionContract } from "@/lib/types";
import { calculateExposureData } from "@/lib/mzDataService";
import dayjs from "dayjs";

export async function GET(request: Request, p: { params: { symbol: string } }) {
    const { symbol } = p.params;
    const fullOptionChain = await getFullOptionChain(symbol);
    const spotPrice = await getCurrentPrice(symbol);

    const indexedObject = fullOptionChain.reduce((previous, current) => {
        previous[current.expiration_date] = previous[current.expiration_date] || {};
        previous[current.expiration_date][current.strike] = previous[current.expiration_date][current.strike] || {};
        //does it make sense to throw exception if delta/gamma values doesn't seem accurate? like gamma being negative or delta being greater than 1?
        if (current.option_type == 'call') {
            previous[current.expiration_date][current.strike].call = { oi: current.open_interest, volume: current.volume, delta: current.greeks?.delta, gamma: current.greeks?.gamma };
        } else if (current.option_type == 'put') {
            previous[current.expiration_date][current.strike].put = { oi: current.open_interest, volume: current.volume, delta: current.greeks?.delta, gamma: current.greeks?.gamma };
        } else {
            throw new Error("Invalid option type");
        }
        return previous;
    }, {} as Record<string, Record<string, MicroOptionContract>>);

    const response = await calculateExposureData({
        data: indexedObject,
        spotDate: dayjs().format('YYYY-MM-DD'),
        spotPrice
    })

    return NextResponse.json(response)
}