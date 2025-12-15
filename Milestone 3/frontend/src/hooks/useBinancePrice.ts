import { useState, useEffect, useRef } from 'react';

interface BinancePrice {
  symbol: string;
  price: number;
  priceChange: number;
  priceChangePercent: number;
  high: number;
  low: number;
  volume: number;
  lastUpdated: Date;
}

const BINANCE_SYMBOLS: Record<string, string> = {
  BTC: 'btcusdt',
  ETH: 'ethusdt',
  BNB: 'bnbusdt',
  DOGE: 'dogeusdt',
  ADA: 'adausdt',
};

export const useBinancePrice = (coinSymbol: string) => {
  const [price, setPrice] = useState<BinancePrice | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const symbol = BINANCE_SYMBOLS[coinSymbol];
    if (!symbol) {
      setError(`Unsupported coin: ${coinSymbol}`);
      return;
    }

    const connect = () => {
      try {
        // Use Binance WebSocket for real-time price
        const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@ticker`);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          setError(null);
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          setPrice({
            symbol: coinSymbol,
            price: parseFloat(data.c),
            priceChange: parseFloat(data.p),
            priceChangePercent: parseFloat(data.P),
            high: parseFloat(data.h),
            low: parseFloat(data.l),
            volume: parseFloat(data.v),
            lastUpdated: new Date(),
          });
        };

        ws.onerror = () => {
          setError('WebSocket error');
          setIsConnected(false);
        };

        ws.onclose = () => {
          setIsConnected(false);
          // Reconnect after 5 seconds
          reconnectTimeoutRef.current = setTimeout(connect, 5000);
        };
      } catch (err) {
        setError('Failed to connect');
        setIsConnected(false);
      }
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [coinSymbol]);

  return { price, isConnected, error };
};

// Hook for multiple coins
export const useBinancePrices = (coinSymbols: string[]) => {
  const [prices, setPrices] = useState<Record<string, BinancePrice>>({});
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const streams = coinSymbols
      .map(s => BINANCE_SYMBOLS[s])
      .filter(Boolean)
      .map(s => `${s}@ticker`)
      .join('/');

    if (!streams) return;

    const connect = () => {
      const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
      wsRef.current = ws;

      ws.onopen = () => setIsConnected(true);

      ws.onmessage = (event) => {
        const { data } = JSON.parse(event.data);
        const symbol = Object.keys(BINANCE_SYMBOLS).find(
          key => BINANCE_SYMBOLS[key] === data.s.toLowerCase()
        );
        
        if (symbol) {
          setPrices(prev => ({
            ...prev,
            [symbol]: {
              symbol,
              price: parseFloat(data.c),
              priceChange: parseFloat(data.p),
              priceChangePercent: parseFloat(data.P),
              high: parseFloat(data.h),
              low: parseFloat(data.l),
              volume: parseFloat(data.v),
              lastUpdated: new Date(),
            },
          }));
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      wsRef.current?.close();
    };
  }, [coinSymbols.join(',')]);

  return { prices, isConnected };
};
