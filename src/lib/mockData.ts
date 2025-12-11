// Mock data for the crypto forecasting dashboard with 5 coins and Linear Regression models

export interface PricePoint {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface CoinInfo {
  symbol: string;
  name: string;
  icon: string;
  color: string;
  basePrice: number;
}

export interface Model {
  id: number;
  coin: string;
  version: string;
  createdAt: string;
  algorithm: string;
  accuracy: number;
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

// Supported coins
export const coins: CoinInfo[] = [
  { symbol: "BTC", name: "Bitcoin", icon: "₿", color: "#F7931A", basePrice: 95000 },
  { symbol: "ETH", name: "Ethereum", icon: "Ξ", color: "#627EEA", basePrice: 3400 },
  { symbol: "BNB", name: "Binance", icon: "◈", color: "#F3BA2F", basePrice: 620 },
  { symbol: "DOGE", name: "Dogecoin", icon: "Ð", color: "#C2A633", basePrice: 0.32 },
  { symbol: "ADA", name: "Cardano", icon: "₳", color: "#0033AD", basePrice: 0.95 },
];

// Linear Regression models for each coin
export const mockModels: Model[] = [
  {
    id: 1,
    coin: "BTC",
    version: "LR_v20251210",
    createdAt: "2024-12-10T14:30:00Z",
    algorithm: "Linear Regression",
    accuracy: 87.5,
    mse: 0.00234,
    mae: 0.0312,
    r2: 0.875,
    notes: "Linear Regression with 30-day rolling features",
  },
  {
    id: 2,
    coin: "ETH",
    version: "LR_v20251210",
    createdAt: "2024-12-10T14:35:00Z",
    algorithm: "Linear Regression",
    accuracy: 84.2,
    mse: 0.00289,
    mae: 0.0398,
    r2: 0.842,
    notes: "Linear Regression with momentum indicators",
  },
  {
    id: 3,
    coin: "BNB",
    version: "LR_v20251210",
    createdAt: "2024-12-10T14:40:00Z",
    algorithm: "Linear Regression",
    accuracy: 82.8,
    mse: 0.00312,
    mae: 0.0421,
    r2: 0.828,
    notes: "Linear Regression with volume features",
  },
  {
    id: 4,
    coin: "DOGE",
    version: "LR_v20251210",
    createdAt: "2024-12-10T14:45:00Z",
    algorithm: "Linear Regression",
    accuracy: 79.5,
    mse: 0.00356,
    mae: 0.0489,
    r2: 0.795,
    notes: "Linear Regression with social sentiment proxy",
  },
  {
    id: 5,
    coin: "ADA",
    version: "LR_v20251210",
    createdAt: "2024-12-10T14:50:00Z",
    algorithm: "Linear Regression",
    accuracy: 81.3,
    mse: 0.00334,
    mae: 0.0456,
    r2: 0.813,
    notes: "Linear Regression with market cap correlation",
  },
];

// Generate realistic price data for the last 30 days
export const generateHistoricalData = (coin: CoinInfo): PricePoint[] => {
  const data: PricePoint[] = [];
  const now = new Date();
  let basePrice = coin.basePrice;
  const volatilityFactor = coin.symbol === "DOGE" ? 0.08 : 0.04;

  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const volatility = (Math.random() - 0.5) * basePrice * volatilityFactor;
    const trend = (30 - i) * (basePrice * 0.001);
    basePrice = basePrice + volatility + (Math.random() > 0.5 ? trend * 0.1 : -trend * 0.05);
    
    const open = basePrice + (Math.random() - 0.5) * basePrice * 0.02;
    const close = basePrice + (Math.random() - 0.5) * basePrice * 0.02;
    const high = Math.max(open, close) * (1 + Math.random() * 0.02);
    const low = Math.min(open, close) * (1 - Math.random() * 0.02);
    const volume = (coin.basePrice * 1000000) * (1 + Math.random());

    data.push({
      timestamp: date.toISOString(),
      open: Math.round(open * 10000) / 10000,
      high: Math.round(high * 10000) / 10000,
      low: Math.round(low * 10000) / 10000,
      close: Math.round(close * 10000) / 10000,
      volume: Math.round(volume),
    });
  }

  return data;
};

// Generate prediction data points (future 7 days)
export const generatePredictions = (lastPrice: number, volatilityFactor: number = 0.03): PricePoint[] => {
  const predictions: PricePoint[] = [];
  const now = new Date();
  let basePrice = lastPrice;

  for (let i = 1; i <= 7; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);

    const volatility = (Math.random() - 0.4) * basePrice * volatilityFactor;
    basePrice = basePrice + volatility;

    predictions.push({
      timestamp: date.toISOString(),
      open: basePrice,
      high: basePrice * (1 + Math.random() * 0.02),
      low: basePrice * (1 - Math.random() * 0.02),
      close: Math.round(basePrice * 10000) / 10000,
      volume: basePrice * 1000000 * (1 + Math.random()),
    });
  }

  return predictions;
};

export const mockRecentPredictions: Prediction[] = [
  { id: 1, modelId: 1, coin: "BTC", prediction: 98450.23, createdAt: "2024-12-11T08:15:00Z", confidence: 0.87 },
  { id: 2, modelId: 2, coin: "ETH", prediction: 3520.50, createdAt: "2024-12-11T08:10:00Z", confidence: 0.84 },
  { id: 3, modelId: 3, coin: "BNB", prediction: 645.75, createdAt: "2024-12-11T08:05:00Z", confidence: 0.82 },
  { id: 4, modelId: 4, coin: "DOGE", prediction: 0.345, createdAt: "2024-12-11T08:00:00Z", confidence: 0.79 },
  { id: 5, modelId: 5, coin: "ADA", prediction: 1.02, createdAt: "2024-12-11T07:55:00Z", confidence: 0.81 },
];

export const formatCurrency = (value: number, coin?: string): string => {
  if (coin === "DOGE" || coin === "ADA" || value < 1) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(value);
  }
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
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
};

export const formatPercentage = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${(value * 100).toFixed(2)}%`;
};

export const getCoinInfo = (symbol: string): CoinInfo | undefined => {
  return coins.find(c => c.symbol === symbol);
};

export const getModelForCoin = (symbol: string): Model | undefined => {
  return mockModels.find(m => m.coin === symbol);
};
