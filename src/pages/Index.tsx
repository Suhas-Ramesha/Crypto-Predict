import { useState, useMemo } from "react";
import { Header } from "@/components/dashboard/Header";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { PriceChart } from "@/components/dashboard/PriceChart";
import { ModelSelector } from "@/components/dashboard/ModelSelector";
import { PredictionPanel } from "@/components/dashboard/PredictionPanel";
import { RecentPredictions } from "@/components/dashboard/RecentPredictions";
import {
  generateHistoricalData,
  generatePredictions,
  mockModels,
  mockRecentPredictions,
  formatCurrency,
  formatVolume,
  formatPercentage,
  Model,
} from "@/lib/mockData";
import { TrendingUp, DollarSign, BarChart3, Percent } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [selectedModel, setSelectedModel] = useState<Model | null>(mockModels[0]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [latestPrediction, setLatestPrediction] = useState<number | null>(null);

  // Generate data
  const historicalData = useMemo(() => generateHistoricalData(), []);
  const lastPrice = historicalData[historicalData.length - 1]?.close || 0;
  const predictions = useMemo(
    () => generatePredictions(lastPrice),
    [lastPrice]
  );

  // Calculate stats
  const priceChange24h = useMemo(() => {
    if (historicalData.length < 2) return 0;
    const yesterday = historicalData[historicalData.length - 2].close;
    const today = historicalData[historicalData.length - 1].close;
    return (today - yesterday) / yesterday;
  }, [historicalData]);

  const handleRunPrediction = () => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setShowPredictions(true);
      const prediction = predictions[0]?.close || lastPrice * 1.02;
      setLatestPrediction(prediction);

      toast({
        title: "Prediction Complete",
        description: `Next day forecast: ${formatCurrency(prediction)}`,
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background gradient-mesh">
      <Header />

      <main className="container px-4 py-6 md:px-6 md:py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Current Price"
            value={formatCurrency(lastPrice)}
            change={formatPercentage(priceChange24h)}
            changeType={priceChange24h >= 0 ? "positive" : "negative"}
            icon={DollarSign}
            subtitle="BTC/USD"
          />
          <StatsCard
            title="24h High"
            value={formatCurrency(
              Math.max(...historicalData.slice(-1).map((d) => d.high))
            )}
            icon={TrendingUp}
            subtitle="Daily peak"
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
            value={`${((selectedModel?.r2 || 0) * 100).toFixed(1)}%`}
            change="R² Score"
            changeType="positive"
            icon={Percent}
            subtitle={selectedModel?.version || "No model selected"}
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
            />
          </div>

          {/* Right Sidebar - Controls */}
          <div className="space-y-6">
            <ModelSelector
              models={mockModels}
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
            />
            <PredictionPanel
              selectedModel={selectedModel}
              onRunPrediction={handleRunPrediction}
              showPredictions={showPredictions}
              onTogglePredictions={setShowPredictions}
              latestPrediction={latestPrediction}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Recent Predictions - Full Width */}
        <div className="mt-6">
          <RecentPredictions predictions={mockRecentPredictions} />
        </div>
      </main>
    </div>
  );
};

export default Index;
