import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PricePoint, CoinInfo } from '@/lib/mockData';
import { calculateAllIndicators, TechnicalIndicators } from '@/lib/technicalIndicators';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Bar,
  ReferenceLine,
} from 'recharts';
import { Activity, TrendingUp, BarChart3 } from 'lucide-react';

interface TechnicalIndicatorsPanelProps {
  historicalData: PricePoint[];
  coin: CoinInfo;
}

export const TechnicalIndicatorsPanel = ({ historicalData, coin }: TechnicalIndicatorsPanelProps) => {
  const indicators = useMemo(() => calculateAllIndicators(historicalData), [historicalData]);

  const chartData = useMemo(() => {
    return historicalData.map((d, i) => ({
      date: new Date(d.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      close: d.close,
      sma7: indicators.sma7[i],
      sma20: indicators.sma20[i],
      ema12: indicators.ema12[i],
      ema26: indicators.ema26[i],
      rsi: indicators.rsi[i],
      macd: indicators.macd.macdLine[i],
      signal: indicators.macd.signalLine[i],
      histogram: indicators.macd.histogram[i],
      bbUpper: indicators.bollingerBands.upper[i],
      bbMiddle: indicators.bollingerBands.middle[i],
      bbLower: indicators.bollingerBands.lower[i],
    }));
  }, [historicalData, indicators]);

  const latestRSI = indicators.rsi[indicators.rsi.length - 1];
  const rsiSignal = latestRSI !== null 
    ? latestRSI > 70 ? 'Overbought' : latestRSI < 30 ? 'Oversold' : 'Neutral'
    : 'N/A';

  const latestMACD = indicators.macd.histogram[indicators.macd.histogram.length - 1];
  const macdSignal = latestMACD !== null
    ? latestMACD > 0 ? 'Bullish' : 'Bearish'
    : 'N/A';

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Activity className="h-5 w-5 text-primary" />
            Technical Indicators
          </CardTitle>
          <div className="flex gap-2">
            <Badge 
              variant="outline" 
              className={`text-xs ${
                rsiSignal === 'Overbought' ? 'border-destructive/50 text-destructive' :
                rsiSignal === 'Oversold' ? 'border-success/50 text-success' :
                'border-muted-foreground/50'
              }`}
            >
              RSI: {rsiSignal}
            </Badge>
            <Badge 
              variant="outline" 
              className={`text-xs ${
                macdSignal === 'Bullish' ? 'border-success/50 text-success' :
                macdSignal === 'Bearish' ? 'border-destructive/50 text-destructive' :
                'border-muted-foreground/50'
              }`}
            >
              MACD: {macdSignal}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="sma" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-secondary/50">
            <TabsTrigger value="sma" className="text-xs">SMA/EMA</TabsTrigger>
            <TabsTrigger value="bollinger" className="text-xs">Bollinger</TabsTrigger>
            <TabsTrigger value="rsi" className="text-xs">RSI</TabsTrigger>
            <TabsTrigger value="macd" className="text-xs">MACD</TabsTrigger>
          </TabsList>

          <TabsContent value="sma" className="mt-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    width={60}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="close" 
                    stroke={coin.color}
                    strokeWidth={2}
                    dot={false}
                    name="Price"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sma7" 
                    stroke="hsl(var(--success))"
                    strokeWidth={1.5}
                    strokeDasharray="4 2"
                    dot={false}
                    name="SMA 7"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sma20" 
                    stroke="hsl(var(--warning))"
                    strokeWidth={1.5}
                    strokeDasharray="4 2"
                    dot={false}
                    name="SMA 20"
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
            <div className="flex justify-center gap-4 mt-2 text-xs">
              <span className="flex items-center gap-1">
                <div className="w-3 h-0.5 rounded" style={{ backgroundColor: coin.color }} />
                Price
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-0.5 rounded bg-success" />
                SMA 7
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-0.5 rounded bg-warning" />
                SMA 20
              </span>
            </div>
          </TabsContent>

          <TabsContent value="bollinger" className="mt-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    width={60}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="bbUpper"
                    stroke="transparent"
                    fill="hsl(var(--primary) / 0.1)"
                    name="Upper Band"
                  />
                  <Area
                    type="monotone"
                    dataKey="bbLower"
                    stroke="transparent"
                    fill="hsl(var(--background))"
                    name="Lower Band"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bbUpper" 
                    stroke="hsl(var(--primary) / 0.5)"
                    strokeWidth={1}
                    dot={false}
                    name="Upper"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bbMiddle" 
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    dot={false}
                    name="Middle"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bbLower" 
                    stroke="hsl(var(--primary) / 0.5)"
                    strokeWidth={1}
                    dot={false}
                    name="Lower"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="close" 
                    stroke={coin.color}
                    strokeWidth={2}
                    dot={false}
                    name="Price"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </motion.div>
          </TabsContent>

          <TabsContent value="rsi" className="mt-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    width={30}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <ReferenceLine y={70} stroke="hsl(var(--destructive))" strokeDasharray="3 3" />
                  <ReferenceLine y={30} stroke="hsl(var(--success))" strokeDasharray="3 3" />
                  <Line 
                    type="monotone" 
                    dataKey="rsi" 
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                    name="RSI"
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Oversold (&lt;30)</span>
              <span className="font-mono">RSI: {latestRSI?.toFixed(1) || 'N/A'}</span>
              <span>Overbought (&gt;70)</span>
            </div>
          </TabsContent>

          <TabsContent value="macd" className="mt-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" />
                  <Bar 
                    dataKey="histogram" 
                    fill="hsl(var(--primary) / 0.5)"
                    name="Histogram"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="macd" 
                    stroke="hsl(var(--primary))"
                    strokeWidth={1.5}
                    dot={false}
                    name="MACD"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="signal" 
                    stroke="hsl(var(--warning))"
                    strokeWidth={1.5}
                    dot={false}
                    name="Signal"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </motion.div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
