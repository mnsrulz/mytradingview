import { Trade } from "@prisma/client"

export interface ITradeView extends Trade {
  averageProfitPerDay: number
  maximumProfit: number
  maximumRisk: number
  maxReturn: number
  maxAnnualizedReturn: number
  actualProfit: number
  actualAnnualizedReturn: number
  actualProfitPerDay: number
  remainingProfitPerDay: number
  buyCost: number,
  sellCost: number,
  isClosed: boolean,
  contractCurrentPrice?: number
}

export type StockPriceData = {
  item: SearchTickerItem,
  quoteSummary: {
    marketState: 'POST' | 'REGULAR' | 'POSTPOST' | 'PRE',
    hasPrePostMarketData: boolean,
    regularMarketPrice: number,
    regularMarketChange: number,
    regularMarketChangePercent: number,
    postMarketPrice: number,
    postMarketChange: number,
    postMarketChangePercent: number,
    preMarketPrice: number,
    preMarketChange: number,
    preMarketChangePercent: number
  }
}

export type TradierOptionContractData = {
  strike: number,
  open_interest: number,
  bid: number,
  ask: number,
  last: number,
  volume: number,
  expiration_date: string,
  option_type: 'put' | 'call',
  greeks: {
    delta: number,
    gamma: number
  }
}

export type MiniOptionContract = {
  strike: number,
  open_interest: number,
  volume: number,
  expiration_date: string,
  option_type: 'put' | 'call',
  greeks: {
    delta: number,
    gamma: number
  }
}

export type TradierOptionData = {
  options: {
    option: TradierOptionContractData[]
  }
}

export type IOptionsGrid = {
  id: string
}

export type NumberRange = { start: number, end: number }



export type SearchTickerResult = { items: SearchTickerItem[] };
export type SearchTickerItem = { symbol: string, name: string }
export type AddTickerToMyListResult = { success: boolean }

export type MicroOptionContractItem = { oi: number, volume: number, delta: number, gamma: number }
export type MicroOptionContract = { call: MicroOptionContractItem, put: MicroOptionContractItem }


type HistoricalDataItem = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type HistoricalData = {
  day: HistoricalDataItem[];
};

export type HistoricalDataResponse = {
  history: HistoricalData;
};

export type EarningsSeason = {
  open: number,
  close: number,
  closePercentage: number;
  openPercentage: number;
  nextClosePercentage?: number;
  nextOpenPercentage?: number;
  nextClose?: number;
  nextOpen?: number;
  date: string;
}

export type ABCType = { ask: number, bid: number, last: number, volume: number, open_interest: number, strike: number, greeks: { delta: number, gamma: number } };
export type minimap = { a: number, b: number, l: number, v: number, oi: number, s: number, g: { d: number, g: number } };
export type XYZType = { date: string, dte: number, c: minimap[], p: minimap[] };


type CallPut = {
  contractSymbol: string;
  strike: number;
  // currency: string;
  // lastPrice: number;
  // change: number;
  // percentChange: number;
  // volume: number;
  // openInterest: number;
  // bid: number;
  // ask: number;
  // contractSize: string;
  // expiration: string;
  // lastTradeDate: string;
  // impliedVolatility: number;
  // inTheMoney: boolean;
}
export type YahooOptionsResponse = {
  underlyingSymbol: string;
  expirationDates: Date[];
  strikes: number[];
  hasMiniOptions: boolean;
  options: {
    expirationDate: Date;
    hasMiniOptions: boolean;
    calls: CallPut[];
    puts: CallPut[];
  }[];
};

export enum DexGexType {
  'DEX' = 'DEX',
  'GEX' = 'GEX',
  'OI' = 'OI',
  'VOLUME' = 'VOLUME'
}

export enum DataModeType {
  'CBOE' = 'CBOE',
  'TRADIER' = 'TRADIER',
  'HISTORICAL' = 'HISTORICAL'
}

export type ExposureDataRequest = { data: Record<string, Record<string, MicroOptionContract>>, spotPrice: number, spotDate: string }

export type OptionGreeksSummaryByDateResponse = { symbol: string, call_volume: number, put_volume: number, call_oi: number, put_oi: number }

export type OIAnomalyReportDataResponse = { dt: string, option: string, option_symbol: string }

export type OptionsInnerData = {
  c: Record<string, {
    a: number,
    b: number,
    l: number,
    oi: number,
    v: number
  }>,
  p: Record<string, {
    a: number,
    b: number,
    l: number,
    oi: number,
    v: number
  }>
}

export type OptionsPricingDataResponse = {
  spotPrice: number,
  options: Record<string, OptionsInnerData>
}

export type OptionGreeksSummaryBySymbolResponse = {
  dt: string;
  price: number;
  call_delta: number;
  put_delta: number;
  call_gamma: number;
  put_gamma: number;
  call_oi: number;
  put_oi: number;
  call_volume: number;
  put_volume: number;
  call_put_dex_ratio: number;
  net_gamma: number;
  call_put_oi_ratio: number;
  call_put_volume_ratio: number;
}


export type ExposureSnapshotByDateResponse = { symbol: string, dex: { hdAssetUrl: string, sdAssetUrl: string }, gex: { hdAssetUrl: string, sdAssetUrl: string } }
export type ExposureSnapshotBySymbolResponse = { date: string, dex: { hdAssetUrl: string, sdAssetUrl: string }, gex: { hdAssetUrl: string, sdAssetUrl: string } }

export type ExposureDataResponse = {
  data: {
    call: {
      absDelta: number[],
      absGamma: number[],
      openInterest: number[],
      volume: number[]
    },
    put: {
      absDelta: number[],
      absGamma: number[],
      openInterest: number[],
      volume: number[]
    },
    netGamma: number[],
    strikes: string[],
    expiration: string,
    dte: number
  }[],
  spotPrice: number
}
