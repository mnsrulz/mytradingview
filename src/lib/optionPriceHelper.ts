import yf from 'yahoo-finance2';
type optionPriceType = { symbol: string, strike: number, expirationDate: Date, type: 'CALLS' | 'PUTS' }
export const getOptionPrice = async (args: optionPriceType) => {
    const { expirationDate, strike, symbol, type } = args;
    const resp = await yf.options(args.symbol, {
        date: expirationDate
    });
    const existingOption = resp.options.find(r => r.expirationDate.getDate() == expirationDate.getDate());
    const pp = (() => {
        switch (type) {
            case 'CALLS':
                return existingOption?.calls
            case 'PUTS':
                return existingOption?.puts
            default:
                return null
        }
    })()?.find(c => c.strike == strike)
    return pp;
}