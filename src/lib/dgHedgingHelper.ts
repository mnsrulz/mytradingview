import { OptionsHedgingDataset } from "./socket";
import { TradierOptionData } from "./types";

///responsible for returning the strikes which we have to return in response.
export const getCalculatedStrikes = (currentPrice: number, maxStrikes: number, strikes: number[]) => {
    const currentOrAboveStrikes = strikes.filter(j => j >= currentPrice).sort((a, b) => a - b).reverse();
    const belowCurrentStrikes = strikes.filter(j => j < currentPrice).sort((a, b) => a - b);
    let result = [];
    while (result.length < maxStrikes && (currentOrAboveStrikes.length > 0 || belowCurrentStrikes.length > 0)) {
        result.push(...[currentOrAboveStrikes.pop(), belowCurrentStrikes.pop()].filter(j => j));
    }
    return result.map(Number).sort((a, b) => a - b);
}

export const calculateHedging = (allOptionChains: TradierOptionData[], allStrikes: number[], allDates: string[], currentPrice: number) => {
    const allOp = allOptionChains.flatMap(j => j.options.option.map(s => s));
    //console.log(`Rendering with dates: ${allDates} and strikes: ${allStrikes}`);
    // const model: Record<number, { puts: number[], calls: number[], data: number[] }> = {};
    const dmodel: OptionsHedgingDataset[] = [];
    const gmodel: OptionsHedgingDataset[] = [];
    const oimodel: OptionsHedgingDataset[] = [];
    const volumemodel: OptionsHedgingDataset[] = [];
    let dmaxPosition = 0, gmaxPosition = 0, oimaxPosition = 0, volumemaxPosition = 0;
    for (const sp of allStrikes) {
        const deltaExposure: OptionsHedgingDataset = { strike: sp };
        const gammaExposure: OptionsHedgingDataset = { strike: sp };
        const oi: OptionsHedgingDataset = { strike: sp };
        const volume: OptionsHedgingDataset = { strike: sp };
        let sumOfPv = 0, sumOfCv = 0;
        let sumOfGPv = 0, sumOfGCv = 0;
        let sumOfOpenInterestPv = 0, sumOfOpenInterestCv = 0;
        let sumOfVolumePv = 0, sumOfVolumeCv = 0;
        dmodel.push(deltaExposure);
        gmodel.push(gammaExposure);
        oimodel.push(oi);
        volumemodel.push(volume);
        // model[sp] = {
        //   calls: [],
        //   puts: [],
        //   data: []
        // }
        for (const dt of allDates) {
            const cv_o = allOp.find(j => j.strike == sp && j.expiration_date == dt && j.option_type == 'call');
            const pv_o = allOp.find(j => j.strike == sp && j.expiration_date == dt && j.option_type == 'put');

            const cv = (cv_o?.open_interest || 0) * (cv_o?.greeks?.delta || 0) * 100 * currentPrice;
            const pv = (pv_o?.open_interest || 0) * (pv_o?.greeks?.delta || 0) * 100 * currentPrice;

            const gcv = (cv_o?.open_interest || 0) * (cv_o?.greeks?.gamma || 0) * 100 * currentPrice;
            const gpv = (pv_o?.open_interest || 0) * (pv_o?.greeks?.gamma || 0) * 100 * currentPrice;
            // model[sp].calls.push(cv);
            // model[sp].puts.push(pv);
            // model[sp].data.push(-cv, pv);

            const oicv = cv_o?.open_interest || 0;
            const oipv = pv_o?.open_interest || 0;

            const volumecv = cv_o?.volume || 0;
            const volumepv = pv_o?.volume || 0;

            deltaExposure[`${dt}-call`] = -cv;
            deltaExposure[`${dt}-put`] = -pv;

            oi[`${dt}-call`] = -oicv;
            oi[`${dt}-put`] = oipv;

            volume[`${dt}-call`] = -volumecv;
            volume[`${dt}-put`] = volumepv;

            const gv = gcv - gpv;

            if (gv > 0) {
                gammaExposure[`${dt}-call`] = -gv;
                gammaExposure[`${dt}-put`] = 0;
            } else {
                gammaExposure[`${dt}-call`] = 0;
                gammaExposure[`${dt}-put`] = -gv;
            }

            sumOfPv = sumOfPv + Math.abs(pv);
            sumOfCv = sumOfCv + Math.abs(cv);

            sumOfGPv = sumOfGPv + Math.abs(gpv);
            sumOfGCv = sumOfGCv + Math.abs(gcv);

            sumOfOpenInterestCv = sumOfOpenInterestCv + Math.abs(oicv);
            sumOfOpenInterestPv = sumOfOpenInterestPv + Math.abs(oipv);
            
            sumOfVolumeCv = sumOfVolumeCv + Math.abs(volumecv);
            sumOfVolumePv = sumOfVolumePv + Math.abs(volumepv);
        }
        dmaxPosition = Math.max(dmaxPosition, sumOfPv, sumOfCv);
        gmaxPosition = Math.max(gmaxPosition, sumOfGPv, sumOfGCv);        
        oimaxPosition = Math.max(oimaxPosition, sumOfOpenInterestPv, sumOfOpenInterestCv);
        volumemaxPosition = Math.max(volumemaxPosition, sumOfVolumePv, sumOfVolumeCv);
    }

    const finalResponse = {
        exposureData: {
            expirations: allDates,
            strikes: allStrikes,
            currentPrice,
            deltaDataset: {
                dataset: dmodel,
                maxPosition: dmaxPosition
            },
            gammaDataset: {
                dataset: gmodel,
                maxPosition: gmaxPosition
            },
            oiDataset: {
                dataset: oimodel,
                maxPosition: oimaxPosition
            },
            volumeDataset: {
                dataset: volumemodel,
                maxPosition: volumemaxPosition
            }
        },
        raw: allOptionChains
    }

    return finalResponse;
}