import { PricePoint } from './mockData';

// Simple Moving Average
export const calculateSMA = (data: PricePoint[], period: number): (number | null)[] => {
  const result: (number | null)[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, d) => acc + d.close, 0);
      result.push(sum / period);
    }
  }
  
  return result;
};

// Exponential Moving Average
export const calculateEMA = (data: PricePoint[], period: number): (number | null)[] => {
  const result: (number | null)[] = [];
  const multiplier = 2 / (period + 1);
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else if (i === period - 1) {
      // First EMA uses SMA
      const sum = data.slice(0, period).reduce((acc, d) => acc + d.close, 0);
      result.push(sum / period);
    } else {
      const prevEMA = result[i - 1] as number;
      const currentEMA = (data[i].close - prevEMA) * multiplier + prevEMA;
      result.push(currentEMA);
    }
  }
  
  return result;
};

// Relative Strength Index
export const calculateRSI = (data: PricePoint[], period: number = 14): (number | null)[] => {
  const result: (number | null)[] = [];
  const gains: number[] = [];
  const losses: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      result.push(null);
      continue;
    }
    
    const change = data[i].close - data[i - 1].close;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
    
    if (i < period) {
      result.push(null);
    } else {
      const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;
      
      if (avgLoss === 0) {
        result.push(100);
      } else {
        const rs = avgGain / avgLoss;
        result.push(100 - (100 / (1 + rs)));
      }
    }
  }
  
  return result;
};

// MACD (Moving Average Convergence Divergence)
export const calculateMACD = (data: PricePoint[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9) => {
  const fastEMA = calculateEMA(data, fastPeriod);
  const slowEMA = calculateEMA(data, slowPeriod);
  
  const macdLine: (number | null)[] = fastEMA.map((fast, i) => {
    const slow = slowEMA[i];
    if (fast === null || slow === null) return null;
    return fast - slow;
  });
  
  // Signal line is EMA of MACD line
  const signalLine: (number | null)[] = [];
  const multiplier = 2 / (signalPeriod + 1);
  
  let signalEMA: number | null = null;
  
  for (let i = 0; i < macdLine.length; i++) {
    if (macdLine[i] === null) {
      signalLine.push(null);
      continue;
    }
    
    if (signalEMA === null) {
      // Find first N valid MACD values for initial SMA
      const validValues = macdLine.slice(0, i + 1).filter(v => v !== null) as number[];
      if (validValues.length >= signalPeriod) {
        signalEMA = validValues.slice(-signalPeriod).reduce((a, b) => a + b, 0) / signalPeriod;
      }
      signalLine.push(signalEMA);
    } else {
      signalEMA = (macdLine[i]! - signalEMA) * multiplier + signalEMA;
      signalLine.push(signalEMA);
    }
  }
  
  // Histogram
  const histogram = macdLine.map((macd, i) => {
    const signal = signalLine[i];
    if (macd === null || signal === null) return null;
    return macd - signal;
  });
  
  return { macdLine, signalLine, histogram };
};

// Bollinger Bands
export const calculateBollingerBands = (data: PricePoint[], period: number = 20, stdDev: number = 2) => {
  const sma = calculateSMA(data, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1 || sma[i] === null) {
      upper.push(null);
      lower.push(null);
    } else {
      const slice = data.slice(i - period + 1, i + 1);
      const mean = sma[i]!;
      const variance = slice.reduce((acc, d) => acc + Math.pow(d.close - mean, 2), 0) / period;
      const standardDeviation = Math.sqrt(variance);
      
      upper.push(mean + stdDev * standardDeviation);
      lower.push(mean - stdDev * standardDeviation);
    }
  }
  
  return { middle: sma, upper, lower };
};

// Volume Moving Average
export const calculateVolumeMA = (data: PricePoint[], period: number = 20): (number | null)[] => {
  const result: (number | null)[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, d) => acc + d.volume, 0);
      result.push(sum / period);
    }
  }
  
  return result;
};

// VWAP (Volume Weighted Average Price)
export const calculateVWAP = (data: PricePoint[]): number[] => {
  let cumulativeTPV = 0;
  let cumulativeVolume = 0;
  
  return data.map(d => {
    const typicalPrice = (d.high + d.low + d.close) / 3;
    cumulativeTPV += typicalPrice * d.volume;
    cumulativeVolume += d.volume;
    return cumulativeTPV / cumulativeVolume;
  });
};

export interface TechnicalIndicators {
  sma7: (number | null)[];
  sma20: (number | null)[];
  ema12: (number | null)[];
  ema26: (number | null)[];
  rsi: (number | null)[];
  macd: {
    macdLine: (number | null)[];
    signalLine: (number | null)[];
    histogram: (number | null)[];
  };
  bollingerBands: {
    upper: (number | null)[];
    middle: (number | null)[];
    lower: (number | null)[];
  };
}

export const calculateAllIndicators = (data: PricePoint[]): TechnicalIndicators => {
  return {
    sma7: calculateSMA(data, 7),
    sma20: calculateSMA(data, 20),
    ema12: calculateEMA(data, 12),
    ema26: calculateEMA(data, 26),
    rsi: calculateRSI(data, 14),
    macd: calculateMACD(data),
    bollingerBands: calculateBollingerBands(data),
  };
};
