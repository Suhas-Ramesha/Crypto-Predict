import { useState, useMemo } from "react";
import { Header } from "@/components/dashboard/Header";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { CoinSelector } from "@/components/dashboard/CoinSelector";
import { PriceChart } from "@/components/dashboard/PriceChart";
import { ModelInfo } from "@/components/dashboard/ModelInfo";
import { PredictionPanel } from "@/components/dashboard/PredictionPanel";
import { ModelComparison } from "@/components/dashboard/ModelComparison";
import {
  generateHistoricalData,
  generatePredictions,
  coins,
  CoinInfo,
  formatCurrency,
  formatVolume,
  formatPercentage,
  getModelForCoin,
} from "@/lib/mockData";
import { TrendingUp, DollarSign, BarChart3, Percent } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { toast } = useToast();
  const [selectedCoin, setSelectedCoin] = useState<CoinInfo>(coins[0]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [latestPrediction, setLatestPrediction] = useState<number | null>(null);

  // Get model for selected coin
  const selectedModel = getModelForCoin(selectedCoin.symbol);

  // Generate data for selected coin
  const historicalData = useMemo(
    () => generateHistoricalData(selectedCoin),
    [selectedCoin]
  );

  const lastPrice = historicalData[historicalData.length - 1]?.close || 0;

  const predictions = useMemo(
    () => generatePredictions(lastPrice, selectedCoin.symbol === "DOGE" ? 0.06 : 0.03),
    [lastPrice, selectedCoin.symbol]
  );

  // Calculate stats
  const priceChange24h = useMemo(() => {
    if (historicalData.length < 2) return 0;
    const yesterday = historicalData[historicalData.length - 2].close;
    const today = historicalData[historicalData.length - 1].close;
    return (today - yesterday) / yesterday;
  }, [historicalData]);

  const handleCoinChange = (coin: CoinInfo) => {
    setSelectedCoin(coin);
    setShowPredictions(false);
    setLatestPrediction(null);
  };

  const handleRunPrediction = () => {
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setShowPredictions(true);
      const prediction = predictions[0]?.close || lastPrice * 1.02;
      setLatestPrediction(prediction);

      toast({
        title: "Prediction Complete",
        description: `${selectedCoin.symbol} next day forecast: ${formatCurrency(prediction, selectedCoin.symbol)}`,
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background gradient-mesh">
      <Header />

      <main className="container px-4 py-6 md:px-6 md:py-8">
        {/* Coin Selector */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            Select Cryptocurrency
          </h2>
          <CoinSelector selectedCoin={selectedCoin} onSelectCoin={handleCoinChange} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Current Price"
            value={formatCurrency(lastPrice, selectedCoin.symbol)}
            change={formatPercentage(priceChange24h)}
            changeType={priceChange24h >= 0 ? "positive" : "negative"}
            icon={DollarSign}
            subtitle={`${selectedCoin.symbol}/USD`}
            coinColor={selectedCoin.color}
          />
          <StatsCard
            title="24h High"
            value={formatCurrency(
              Math.max(...historicalData.slice(-1).map((d) => d.high)),
              selectedCoin.symbol
            )}
            icon={TrendingUp}
            subtitle="Daily peak"
            coinColor={selectedCoin.color}
          />
          <StatsCard
            title="24h Volume"
            value={formatVolume(
              historicalData[historicalData.length - 1]?.volume || 0
            )}
            icon={BarChart3}
            subtitle="Trading volume"
          />
          <StatsCard
            title="Model Accuracy"
            value={`${(selectedModel?.accuracy || 0).toFixed(1)}%`}
            change="R² Score"
            changeType="positive"
            icon={Percent}
            subtitle={selectedModel?.algorithm || "No model"}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <PriceChart
              historicalData={historicalData}
              predictions={predictions}
              showPredictions={showPredictions}
              coin={selectedCoin}
            />
          </div>

          {/* Right Sidebar - Controls */}
          <div className="space-y-6">
            <ModelInfo model={selectedModel} coin={selectedCoin} />
            <PredictionPanel
              model={selectedModel}
              coin={selectedCoin}
              onRunPrediction={handleRunPrediction}
              showPredictions={showPredictions}
              onTogglePredictions={setShowPredictions}
              latestPrediction={latestPrediction}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Model Comparison - Full Width */}
        <div className="mt-6">
          <ModelComparison />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
