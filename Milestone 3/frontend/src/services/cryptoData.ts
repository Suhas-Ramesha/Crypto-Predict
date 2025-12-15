/**
 * Service to fetch real cryptocurrency price data from Binance API
 * Uses public API - no authentication required
 */

const BINANCE_API = 'https://api.binance.com/api/v3';

export interface HistoricalOHLCV {
    timestamp: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

const SYMBOL_MAP: Record<string, string> = {
    'BTC': 'BTCUSDT',
    'ETH': 'ETHUSDT',
    'BNB': 'BNBUSDT',
    'DOGE': 'DOGEUSDT',
    'ADA': 'ADAUSDT',
};

// USD to INR conversion rate (approximate)
const USD_TO_INR = 83.5;

/**
 * Fetch historical price data from Binance
 * @param symbol - Coin symbol (BTC, ETH, etc.)
 * @param hours - Number of hours of historical data (default 720 = 30 days)
 */
export async function fetchHistoricalPrices(
    symbol: string,
    hours: number = 720,
    startTime?: number,
    endTime?: number
): Promise<HistoricalOHLCV[]> {
    const binanceSymbol = SYMBOL_MAP[symbol];
    if (!binanceSymbol) {
        throw new Error(`Unknown coin symbol: ${symbol}`);
    }

    try {
        // Fetch klines (candlestick) data
        // interval: 1h (hourly), limit: max 1000
        const limit = Math.min(hours, 1000);
        let url = `${BINANCE_API}/klines?symbol=${binanceSymbol}&interval=1h`;

        if (startTime && endTime) {
            url += `&startTime=${startTime}&endTime=${endTime}&limit=1000`;
        } else {
            url += `&limit=${limit}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Binance API error: ${response.statusText}`);
        }

        const data = await response.json();

        // Convert to OHLCV format
        // Binance kline format: [openTime, open, high, low, close, volume, closeTime, ...]
        const ohlcvData: HistoricalOHLCV[] = data.map((kline: any[]) => ({
            timestamp: new Date(kline[0]), // openTime
            open: parseFloat(kline[1]) * USD_TO_INR, // Convert USD to INR
            high: parseFloat(kline[2]) * USD_TO_INR,
            low: parseFloat(kline[3]) * USD_TO_INR,
            close: parseFloat(kline[4]) * USD_TO_INR,
            volume: parseFloat(kline[5]),
        }));

        return ohlcvData;
    } catch (error) {
        console.error('Error fetching historical prices from Binance:', error);
        throw error;
    }
}

/**
 * Fetch current price for a coin
 */
export async function fetchCurrentPrice(symbol: string): Promise<number> {
    const binanceSymbol = SYMBOL_MAP[symbol];
    if (!binanceSymbol) {
        throw new Error(`Unknown coin symbol: ${symbol}`);
    }

    try {
        const response = await fetch(
            `${BINANCE_API}/ticker/price?symbol=${binanceSymbol}`
        );

        if (!response.ok) {
            throw new Error(`Binance API error: ${response.statusText}`);
        }

        const data = await response.json();
        return parseFloat(data.price) * USD_TO_INR; // Convert to INR
    } catch (error) {
        console.error('Error fetching current price from Binance:', error);
        throw error;
    }
}
