import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { PricePoint, formatCurrency, CoinInfo } from "@/lib/mockData";

interface PriceChartProps {
  historicalData: PricePoint[];
  predictions: PricePoint[];
  showPredictions: boolean;
  coin: CoinInfo;
}

export const PriceChart = ({
  historicalData,
  predictions,
  showPredictions,
  coin,
}: PriceChartProps) => {
  const chartData = useMemo(() => {
    const historical = historicalData.map((d) => ({
      date: new Date(d.timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      price: d.close,
      type: "historical",
    }));

    if (showPredictions) {
      const predicted = predictions.map((d) => ({
        date: new Date(d.timestamp).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        prediction: d.close,
        type: "prediction",
      }));

      const lastHistorical = historical[historical.length - 1];
      return [
        ...historical,
        { ...lastHistorical, prediction: lastHistorical.price },
        ...predicted,
      ];
    }

    return historical;
  }, [historicalData, predictions, showPredictions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const price = payload.find((p: any) => p.dataKey === "price");
      const prediction = payload.find((p: any) => p.dataKey === "prediction");

      return (
        <div className="glass-card p-3 border border-border/50">
          <p className="text-sm font-medium text-foreground mb-2">{label}</p>
          {price && (
            <p className="text-sm font-mono" style={{ color: coin.color }}>
              Price: {formatCurrency(price.value, coin.symbol)}
            </p>
          )}
          {prediction && (
            <p className="text-sm font-mono text-chart-prediction">
              Predicted: {formatCurrency(prediction.value, coin.symbol)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const lastHistoricalDate = historicalData[historicalData.length - 1]
    ? new Date(historicalData[historicalData.length - 1].timestamp).toLocaleDateString(
      "en-US",
      { month: "short", day: "numeric" }
    )
    : null;

  return (
    <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {coin.symbol}/INR Price Chart
          </h2>
          <p className="text-sm text-muted-foreground">
            30-day historical data {showPredictions && "+ 7-day forecast"}
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: coin.color }}
            />
            <span className="text-muted-foreground">Historical</span>
          </div>
          {showPredictions && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-chart-prediction" />
              <span className="text-muted-foreground">Prediction</span>
            </div>
          )}
        </div>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id={`colorPrice-${coin.symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={coin.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={coin.color} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPrediction" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(270, 91%, 65%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(270, 91%, 65%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(217, 33%, 20%)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              stroke="hsl(215, 20%, 65%)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(215, 20%, 65%)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => {
                if (value >= 100000) return `₹${(value / 100000).toFixed(2)}L`; // Lakhs
                if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
                if (value >= 1) return `₹${value.toFixed(0)}`;
                return `₹${value.toFixed(2)}`;
              }}
              domain={["auto", "auto"]}
            />
            <Tooltip content={<CustomTooltip />} />
            {showPredictions && lastHistoricalDate && (
              <ReferenceLine
                x={lastHistoricalDate}
                stroke="hsl(215, 20%, 45%)"
                strokeDasharray="5 5"
                label={{
                  value: "Today",
                  position: "top",
                  fill: "hsl(215, 20%, 65%)",
                  fontSize: 11,
                }}
              />
            )}
            <Area
              type="monotone"
              dataKey="price"
              stroke={coin.color}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#colorPrice-${coin.symbol})`}
              dot={false}
              activeDot={{ r: 6, fill: coin.color }}
            />
            {showPredictions && (
              <Area
                type="monotone"
                dataKey="prediction"
                stroke="hsl(270, 91%, 65%)"
                strokeWidth={2}
                strokeDasharray="5 5"
                fillOpacity={1}
                fill="url(#colorPrediction)"
                dot={false}
                activeDot={{ r: 6, fill: "hsl(270, 91%, 65%)" }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
