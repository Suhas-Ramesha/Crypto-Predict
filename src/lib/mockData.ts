// Mock data for the crypto forecasting dashboard

export interface PricePoint {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Model {
  id: number;
  coin: string;
  version: string;
  createdAt: string;
  mse: number;
  mae: number;
  r2: number;
  notes: string;
}

export interface Prediction {
  id: number;
  modelId: number;
  coin: string;
  prediction: number;
  createdAt: string;
  confidence: number;
}

// Generate realistic BTC price data for the last 30 days
export const generateHistoricalData = (): PricePoint[] => {
  const data: PricePoint[] = [];
  const now = new Date();
  let basePrice = 95000;

  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Add some realistic volatility
    const volatility = (Math.random() - 0.5) * 4000;
    const trend = (30 - i) * 50; // Slight upward trend
    basePrice = basePrice + volatility + (Math.random() > 0.5 ? trend * 0.1 : -trend * 0.05);
    
    const open = basePrice + (Math.random() - 0.5) * 1000;
    const close = basePrice + (Math.random() - 0.5) * 1000;
    const high = Math.max(open, close) + Math.random() * 1500;
    const low = Math.min(open, close) - Math.random() * 1500;
    const volume = 20000000000 + Math.random() * 15000000000;

    data.push({
      timestamp: date.toISOString(),
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume: Math.round(volume),
    });
  }

  return data;
};

// Generate prediction data points (future 7 days)
export const generatePredictions = (lastPrice: number): PricePoint[] => {
  const predictions: PricePoint[] = [];
  const now = new Date();
  let basePrice = lastPrice;

  for (let i = 1; i <= 7; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);

    // Predictions with slight upward bias
    const volatility = (Math.random() - 0.4) * 3000;
    basePrice = basePrice + volatility;

    predictions.push({
      timestamp: date.toISOString(),
      open: basePrice,
      high: basePrice + Math.random() * 2000,
      low: basePrice - Math.random() * 2000,
      close: Math.round(basePrice * 100) / 100,
      volume: 25000000000 + Math.random() * 10000000000,
    });
  }

  return predictions;
};

export const mockModels: Model[] = [
  {
    id: 1,
    coin: "BTC",
    version: "v20251210_1430",
    createdAt: "2024-12-10T14:30:00Z",
    mse: 0.00234,
    mae: 0.0312,
    r2: 0.9456,
    notes: "LSTM model with 60-day lookback window",
  },
  {
    id: 2,
    coin: "BTC",
    version: "v20251208_0900",
    createdAt: "2024-12-08T09:00:00Z",
    mse: 0.00289,
    mae: 0.0398,
    r2: 0.9312,
    notes: "XGBoost ensemble with technical indicators",
  },
  {
    id: 3,
    coin: "BTC",
    version: "v20251205_1600",
    createdAt: "2024-12-05T16:00:00Z",
    mse: 0.00312,
    mae: 0.0421,
    r2: 0.9187,
    notes: "Transformer-based model",
  },
];

export const mockRecentPredictions: Prediction[] = [
  {
    id: 1,
    modelId: 1,
    coin: "BTC",
    prediction: 98450.23,
    createdAt: "2024-12-11T08:15:00Z",
    confidence: 0.87,
  },
  {
    id: 2,
    modelId: 1,
    coin: "BTC",
    prediction: 97890.50,
    createdAt: "2024-12-11T06:00:00Z",
    confidence: 0.82,
  },
  {
    id: 3,
    modelId: 2,
    coin: "BTC",
    prediction: 99120.75,
    createdAt: "2024-12-10T22:30:00Z",
    confidence: 0.79,
  },
];

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatVolume = (value: number): string => {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toFixed(2)}`;
};

export const formatPercentage = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${(value * 100).toFixed(2)}%`;
};
