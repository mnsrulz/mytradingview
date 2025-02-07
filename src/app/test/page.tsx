'use client';
import { TickerSearch } from "@/components/TickerSearch";
import { useCSVReader } from 'react-papaparse';


import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react";
import { MiniOptionContract } from "@/lib/types";

[
    "Expiration Date",
    "Symbol",
    "Last",
    "Chg",
    "Bid",
    "Ask",
    "Volume",
    "Open Int",
    "Delta",
    "Theta",
    "IV Mid",
    "Strike",
    "Symbol",
    "Last",
    "Chg",
    "Bid",
    "Ask",
    "Volume",
    "Open Int",
    "Delta",
    "Theta",
    "IV Mid"
]

type ParsedCsvType = { data: string[][], errors: [], meta: [] }
type CsvIndexInfoType = {
    expirationIx: number;
    strikeIx: number;
    callSymbolIx: number;
    callVolumeIx: number;
    callOiIx: number;
    callDeltaIx: number;
    callGammaIx: number;
    putSymbolIx: number;
    putVolumeIx: number;
    putOiIx: number;
    putDeltaIx: number;
    putGammaIx: number;
}

function parseIndexes(value: string[]) {
    const indexes = [value.indexOf('Expiration Date'), value.indexOf('Strike'),
    value.indexOf('Symbol'), value.indexOf("Volume"), value.indexOf('Open Int'), value.indexOf('Delta'), value.indexOf('Theta'),
    value.lastIndexOf('Symbol'), value.lastIndexOf("Volume"), value.lastIndexOf('Open Int'), value.lastIndexOf('Delta'), value.lastIndexOf('Theta')]

    if (indexes.some(k => k == -1)) throw new Error('some indexes were not found in the data which are required');
    const [expirationIx, strikeIx, callSymbolIx, callVolumeIx, callOiIx, callDeltaIx, callGammaIx, putSymbolIx, putVolumeIx, putOiIx, putDeltaIx, putGammaIx] = indexes;
    return {
        expirationIx, strikeIx, callSymbolIx, callVolumeIx, callOiIx, callDeltaIx, callGammaIx, putSymbolIx, putVolumeIx, putOiIx, putDeltaIx, putGammaIx
    } as CsvIndexInfoType;
}

const FViewer = (props: { data: ParsedCsvType }) => {
    const { data } = props;
    // const [symbolName, setSymbolName] = useState('')
    // const [lastPrice, setLastPrice] = useState(0)
    useEffect(() => {

        if (data) {
            let foundHeaderInfo = false;
            let indexInfo: CsvIndexInfoType | undefined = undefined;
            let mappedOptions: MiniOptionContract[] = []


            for (const item of data.data) {

                if (!foundHeaderInfo) {
                    if (item.includes('Expiration Date')) {
                        foundHeaderInfo = true;
                        indexInfo = parseIndexes(item)
                    }
                    continue;
                }

                if (!indexInfo) continue;
                if (item.some(k => k == '' || k == undefined)) {
                    console.log(`skipping row since it doesn't contain values in all the columns`, item)
                    continue;
                }

                mappedOptions.push({
                    expiration_date: item[indexInfo.expirationIx],
                    open_interest: Number(item[indexInfo.callOiIx]),
                    option_type: 'call',
                    strike: Number(item[indexInfo.strikeIx]),
                    volume: Number(item[indexInfo.callVolumeIx]),
                    greeks: {
                        delta: Number(item[indexInfo.callDeltaIx]),
                        gamma: Number(item[indexInfo.callGammaIx])
                    }
                }, {
                    expiration_date: item[indexInfo.expirationIx],
                    open_interest: Number(item[indexInfo.callOiIx]),
                    option_type: 'put',
                    strike: Number(item[indexInfo.strikeIx]),
                    volume: Number(item[indexInfo.putVolumeIx]),
                    greeks: {
                        delta: Number(item[indexInfo.putDeltaIx]),
                        gamma: Number(item[indexInfo.putGammaIx])
                    }
                })

                /*
                   const mappedOptions = optionChain.map(({ strike, expiration_date, greeks, open_interest, option_type, volume }) => ({
                           strike, expiration_date, open_interest, option_type, volume, greeks: {
                               delta: greeks?.delta || 0,
                               gamma: greeks?.gamma || 0,
                           }
                       }));
                   */


                // const [symbolName, lastPriceTextValue] = data.data.find(j => j.length == 3) || [];   //per fidelity spec

            }

            debugger;
            // setSymbolName(symbolName);
            // setLastPrice(Number(lastPriceTextValue.split(':').at(-1)));
        }


    }, [data]);
    
    return <OptionsAnalysisComponent cachedDates={cachedDates} dte={daysToExpiration} 
        sc={strikeCount} dataMode={dataMode} data={mappedOptions} symbol={symbol} 
        price={currentPrice} tab={analysisType} />
    

}

export default function Page() {
    const router = useRouter();
    const { CSVReader } = useCSVReader();
    const [hasData, setHasData] = useState(false);
    const [csvRawData, setCsvRawData] = useState<ParsedCsvType>({ data: [], errors: [], meta: [] });



    return <><CSVReader
        onUploadAccepted={(results: any) => {
            console.log('---------------------------');
            console.log(results);
            console.log('---------------------------');
            setCsvRawData(results);
            setHasData(true);
        }}
    >
        {({
            getRootProps,
            acceptedFile,
            ProgressBar,
            getRemoveFileProps,
        }: any) => (
            <>
                <div>
                    <button type='button' {...getRootProps()}>
                        Browse file
                    </button>
                    <div>
                        {acceptedFile && acceptedFile.name}
                    </div>
                    <button {...getRemoveFileProps()} >
                        Remove
                    </button>
                </div>
                <ProgressBar />
            </>
        )}
    </CSVReader>

        {hasData && <FViewer data={csvRawData} />}

    </>
}