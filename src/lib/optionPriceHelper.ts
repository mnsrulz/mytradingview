import ky from "ky";

type OptionsData = Record<string, { "l": 0.01, }>;

type optionPriceType = { symbol: string, strike: number, expirationDate: Date, type: 'CALLS' | 'PUTS' }
export const getOptionPrice = async (args: optionPriceType) => {
    const { expirationDate, strike, symbol, type } = args;

    const resp = await ky(`https://www.optionsprofitcalculator.com/ajax/getOptions?stock=${args.symbol}&reqId=1`).json<{
        options: Record<string, {
            c: OptionsData,
            p: OptionsData
        }>
    }>();

    // console.log(resp);    
    const expiry = expirationDate.toISOString().substring(0, 10);
    console.log(expiry);

    const existingOption = resp.options[expiry];
    const pp = (() => {
        switch (type) {
            case 'CALLS':
                return existingOption?.c
            case 'PUTS':
                return existingOption?.p
            default:
                return null
        }
    })();
    const sk = strike.toLocaleString(undefined, { minimumFractionDigits: 2 });
    return pp && pp[sk];
}