import ky from "ky";
type OptionsData = Record<string, { "l": number, "a": number }>;
type optionPriceType = { symbol: string, strike: number, expirationDate: Date, type: 'CALLS' | 'PUTS' }
export const getOptionPrice = async (args: optionPriceType) => {
    const { expirationDate, strike, symbol, type } = args;
    const resp = await ky(`https://www.optionsprofitcalculator.com/ajax/getOptions?stock=${symbol}&reqId=1`).json<{
        options: Record<string, {
            c: OptionsData,
            p: OptionsData
        }>
    }>();
    
    const expiry = expirationDate.toISOString().substring(0, 10);
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