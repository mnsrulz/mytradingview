import dayjs from 'dayjs'
import { OptionsPricingDataResponse, OptionsInnerData, OptionsQuote } from '@/lib/types'

export type HedgeStrategyType = 'PUT_DEBIT_SPREAD' | 'CALL_CREDIT_SPREAD' | 'DEEP_ITM_CALL'

export type HedgeLeg = {
    type: 'CALL' | 'PUT';
    mode: 'BUY' | 'SELL';
    strike: number;
    expiration: string;
    quantity: number;
    bid: number;
    ask: number;
    contractSymbol: string;
}

export type HedgeStrategy = {
    id: string;
    type: HedgeStrategyType;
    label: string;
    expiration: string;
    legs: HedgeLeg[];
    netDebit: number;
    netCredit: number;
    maxLoss: number;
    maxGain: number;
    protectionAmount: number;
    costAsPercentOfPosition: number;
    score: number;
}

const TARGET_DTE = [30, 45, 60]

const findClosestExpiration = (availableExpirations: string[], targetDte: number): string | null => {
    const now = dayjs()
    const targetDate = now.add(targetDte, 'day')

    let closest: string | null = null
    let minDiff = Infinity

    for (const exp of availableExpirations) {
        const expDayjs = dayjs(exp)
        const dte = expDayjs.diff(now, 'day')
        if (dte < 7) continue
        const diff = Math.abs(expDayjs.diff(targetDate, 'day'))
        if (diff < minDiff) {
            minDiff = diff
            closest = exp
        }
    }

    return closest
}

const getExpirationsForDte = (options: OptionsPricingDataResponse): { dte: number; expiration: string }[] => {
    const results: { dte: number; expiration: string }[] = []
    const now = dayjs()
    const availableExpirations = Object.keys(options.options)

    for (const target of TARGET_DTE) {
        const closest = findClosestExpiration(availableExpirations, target)
        if (closest) {
            const dte = dayjs(closest).diff(now, 'day')
            if (!results.some(r => r.expiration === closest)) {
                results.push({ dte, expiration: closest })
            }
        }
    }

    return results
}

const findPutStrikeByDelta = (
    strikes: number[],
    currentPrice: number,
    targetDeltaMagnitude: number,
    type: 'ITM' | 'OTM'
): number | null => {
    const deltaOffset = type === 'OTM'
        ? (0.5 - targetDeltaMagnitude)
        : (targetDeltaMagnitude - 0.5)

    const distanceFactor = 0.3
    const distance = currentPrice * deltaOffset * distanceFactor

    let targetStrike: number
    if (type === 'OTM') {
        targetStrike = currentPrice - distance
    } else {
        targetStrike = currentPrice + distance
    }

    const closest = strikes.reduce((prev, curr) =>
        Math.abs(curr - targetStrike) < Math.abs(prev - targetStrike) ? curr : prev
    )

    return closest
}

const findStrikeByDelta = (
    strikes: number[],
    currentPrice: number,
    targetDeltaMagnitude: number,
    type: 'ITM' | 'OTM'
): number | null => {
    const deltaOffset = type === 'OTM'
        ? (0.5 - targetDeltaMagnitude)
        : (targetDeltaMagnitude - 0.5)

    const distanceFactor = 0.3
    const distance = currentPrice * deltaOffset * distanceFactor

    let targetStrike: number
    if (type === 'OTM') {
        targetStrike = currentPrice + distance
    } else {
        targetStrike = currentPrice - distance
    }

    const closest = strikes.reduce((prev, curr) =>
        Math.abs(curr - targetStrike) < Math.abs(prev - targetStrike) ? curr : prev
    )

    return closest
}

const getQuote = (chain: Record<string, OptionsQuote> | undefined, strike: number): OptionsQuote | undefined => {
    if (!chain) return undefined
    return chain[strike.toString()]
}

export const generatePutDebitSpread = (
    options: OptionsPricingDataResponse,
    expiration: string,
    currentPrice: number,
    positionValue: number,
    hedgeRatio: number
): HedgeStrategy | null => {
    const expData = options.options[expiration]
    if (!expData) return null

    const puts = expData.p
    if (!puts || Object.keys(puts).length === 0) return null

    const strikes = Object.keys(puts).map(Number).sort((a, b) => a - b)

    const longStrike = findPutStrikeByDelta(strikes, currentPrice, 0.4, 'OTM')
    const shortStrike = findPutStrikeByDelta(strikes, currentPrice, 0.2, 'OTM')

    if (!longStrike || !shortStrike || longStrike <= shortStrike) return null

    const longQuote = getQuote(puts, longStrike)
    const shortQuote = getQuote(puts, shortStrike)

    if (!longQuote || !shortQuote) return null
    if (longQuote.a === 0 || shortQuote.b === 0) return null

    const netDebit = longQuote.a - shortQuote.b
    if (netDebit <= 0) return null

    const width = longStrike - shortStrike
    const protection = width - netDebit
    const contracts = Math.ceil((positionValue * (hedgeRatio / 100)) / (100 * netDebit))
    const totalCost = netDebit * 100 * contracts
    const costAsPercent = (totalCost / positionValue) * 100

    return {
        id: `pds-${expiration}-${longStrike}-${shortStrike}`,
        type: 'PUT_DEBIT_SPREAD',
        label: `Put Debit Spread ${dayjs(expiration).format('MM/DD')} ${shortStrike}/${longStrike}`,
        expiration,
        legs: [
            { type: 'PUT', mode: 'BUY', strike: longStrike, expiration, quantity: 1, bid: longQuote.b, ask: longQuote.a, contractSymbol: '' },
            { type: 'PUT', mode: 'SELL', strike: shortStrike, expiration, quantity: 1, bid: shortQuote.b, ask: shortQuote.a, contractSymbol: '' },
        ],
        netDebit,
        netCredit: 0,
        maxLoss: totalCost,
        maxGain: (protection * 100 * contracts) - totalCost,
        protectionAmount: protection * 100 * contracts,
        costAsPercentOfPosition: costAsPercent,
        score: protection / netDebit,
    }
}

export const generateCallCreditSpread = (
    options: OptionsPricingDataResponse,
    expiration: string,
    currentPrice: number,
    positionValue: number,
    hedgeRatio: number
): HedgeStrategy | null => {
    const expData = options.options[expiration]
    if (!expData) return null

    const calls = expData.c
    if (!calls || Object.keys(calls).length === 0) return null

    const strikes = Object.keys(calls).map(Number).sort((a, b) => a - b)

    const shortStrike = findStrikeByDelta(strikes, currentPrice, 0.3, 'OTM')
    const longStrike = findStrikeByDelta(strikes, currentPrice, 0.15, 'OTM')

    if (!shortStrike || !longStrike || longStrike <= shortStrike) return null

    const shortQuote = getQuote(calls, shortStrike)
    const longQuote = getQuote(calls, longStrike)

    if (!shortQuote || !longQuote) return null
    if (shortQuote.b === 0 || longQuote.a === 0) return null

    const netCredit = shortQuote.b - longQuote.a
    if (netCredit <= 0) return null

    const width = longStrike - shortStrike
    const maxLoss = width - netCredit
    const contracts = Math.ceil((positionValue * (hedgeRatio / 100)) / (100 * netCredit))
    const totalCredit = netCredit * 100 * contracts
    const totalMaxLoss = maxLoss * 100 * contracts

    return {
        id: `ccs-${expiration}-${shortStrike}-${longStrike}`,
        type: 'CALL_CREDIT_SPREAD',
        label: `Call Credit Spread ${dayjs(expiration).format('MM/DD')} ${shortStrike}/${longStrike}`,
        expiration,
        legs: [
            { type: 'CALL', mode: 'SELL', strike: shortStrike, expiration, quantity: 1, bid: shortQuote.b, ask: shortQuote.a, contractSymbol: '' },
            { type: 'CALL', mode: 'BUY', strike: longStrike, expiration, quantity: 1, bid: longQuote.b, ask: longQuote.a, contractSymbol: '' },
        ],
        netDebit: 0,
        netCredit,
        maxLoss: totalMaxLoss,
        maxGain: totalCredit,
        protectionAmount: totalCredit,
        costAsPercentOfPosition: 0,
        score: netCredit / maxLoss,
    }
}

export const generateDeepItmCall = (
    options: OptionsPricingDataResponse,
    expiration: string,
    currentPrice: number,
    positionValue: number,
    hedgeRatio: number
): HedgeStrategy | null => {
    const expData = options.options[expiration]
    if (!expData) return null

    const calls = expData.c
    if (!calls || Object.keys(calls).length === 0) return null

    const strikes = Object.keys(calls).map(Number).sort((a, b) => a - b)

    const strike = findStrikeByDelta(strikes, currentPrice, 0.8, 'ITM')
    if (!strike) return null

    const quote = getQuote(calls, strike)
    if (!quote) return null
    if (quote.b === 0) return null

    const premium = quote.b
    const upsideCap = strike - currentPrice
    const contracts = Math.ceil((positionValue * (hedgeRatio / 100)) / (100 * premium))
    const totalPremium = premium * 100 * contracts

    return {
        id: `ditm-${expiration}-${strike}`,
        type: 'DEEP_ITM_CALL',
        label: `Deep ITM Call ${dayjs(expiration).format('MM/DD')} $${strike}`,
        expiration,
        legs: [
            { type: 'CALL', mode: 'SELL', strike, expiration, quantity: 1, bid: quote.b, ask: quote.a, contractSymbol: '' },
        ],
        netDebit: 0,
        netCredit: premium,
        maxLoss: (currentPrice - premium) * 100 * contracts,
        maxGain: totalPremium + (upsideCap * 100 * contracts),
        protectionAmount: totalPremium,
        costAsPercentOfPosition: 0,
        score: premium / (currentPrice - strike || 1),
    }
}

export const generateHedgeSuggestions = (
    options: OptionsPricingDataResponse,
    currentPrice: number,
    positionValue: number,
    hedgeRatio: number = 25
): HedgeStrategy[] => {
    const expirations = getExpirationsForDte(options)
    const strategies: HedgeStrategy[] = []

    for (const { expiration } of expirations) {
        const pds = generatePutDebitSpread(options, expiration, currentPrice, positionValue, hedgeRatio)
        if (pds) strategies.push(pds)

        const ccs = generateCallCreditSpread(options, expiration, currentPrice, positionValue, hedgeRatio)
        if (ccs) strategies.push(ccs)

        const ditm = generateDeepItmCall(options, expiration, currentPrice, positionValue, hedgeRatio)
        if (ditm) strategies.push(ditm)
    }

    return strategies
        .sort((a, b) => b.score - a.score)
        .slice(0, 9)
}
