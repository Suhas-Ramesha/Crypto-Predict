import { useMemo, useState } from "react";
import {
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { PricePoint, formatCurrency, CoinInfo, formatVolume } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { BarChart2, TrendingUp, Activity } from "lucide-react";

interface PriceChartProps {
  historicalData: PricePoint[];
  predictions: PricePoint[];
  showPredictions: boolean;
  coin: CoinInfo;
}

type ChartType = "area" | "line";

export const PriceChart = ({
  historicalData,
  predictions,
  showPredictions,
  coin,
}: PriceChartProps) => {
  const [chartType, setChartType] = useState<ChartType>("area");
  const [showVolume, setShowVolume] = useState(false);

  const chartData = useMemo(() => {
    const historical = historicalData.map((d) => ({
      date: new Date(d.timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      price: d.close,
      volume: d.volume,
      type: "historical",
    }));

    if (showPredictions) {
      const predicted = predictions.map((d) => ({
        date: new Date(d.timestamp).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        prediction: d.close,
        volume: d.volume, // Prediction might not have volume, handle gracefully
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
      const volume = payload.find((p: any) => p.dataKey === "volume");

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
          {volume && (
            <p className="text-xs text-muted-foreground mt-1">
              Vol: {formatVolume(volume.value)}
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
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {coin.symbol}/INR Price Chart
          </h2>
          <p className="text-sm text-muted-foreground">
            30-day historical data {showPredictions && "+ 7-day forecast"}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-secondary/30 p-1 rounded-lg">
          <Button
            variant={chartType === "area" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setChartType("area")}
            className="h-8 px-2 text-xs"
          >
            <TrendingUp className="h-3 w-3 mr-1" /> Area
          </Button>
          <Button
            variant={chartType === "line" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setChartType("line")}
            className="h-8 px-2 text-xs"
          >
            <Activity className="h-3 w-3 mr-1" /> Line
          </Button>
          <div className="w-px h-4 bg-border/50 mx-1" />
          <Button
            variant={showVolume ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setShowVolume(!showVolume)}
            className="h-8 px-2 text-xs"
          >
            <BarChart2 className="h-3 w-3 mr-1" /> Vol
          </Button>
        </div>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
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
            {/* Price Y Axis */}
            <YAxis
              yAxisId="left"
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
            {/* Volume Y Axis (Hidden or Right aligned) */}
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="hsl(215, 20%, 65%)"
              fontSize={0} // Hide ticks
              tickLine={false}
              axisLine={false}
              domain={[0, (dataMax: number) => dataMax * 4]} // Scale volume down
            />
            <Tooltip content={<CustomTooltip />} />

            {showPredictions && lastHistoricalDate && (
              <ReferenceLine
                yAxisId="left"
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

            {/* Volume Bars */}
            {showVolume && (
              <Bar
                yAxisId="right"
                dataKey="volume"
                fill="hsl(215, 20%, 35%)"
                opacity={0.3}
                barSize={10}
              />
            )}

            {/* Historical Price */}
            {chartType === "area" ? (
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="price"
                stroke={coin.color}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#colorPrice-${coin.symbol})`}
                dot={false}
                activeDot={{ r: 6, fill: coin.color }}
              />
            ) : (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="price"
                stroke={coin.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: coin.color }}
              />
            )}

            {/* Prediction Price */}
            {showPredictions && (
              chartType === "area" ? (
                <Area
                  yAxisId="left"
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
              ) : (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="prediction"
                  stroke="hsl(270, 91%, 65%)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  activeDot={{ r: 6, fill: "hsl(270, 91%, 65%)" }}
                />
              )
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
