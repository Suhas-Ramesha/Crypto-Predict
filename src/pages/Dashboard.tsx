import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/dashboard/Header";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { CoinSelector } from "@/components/dashboard/CoinSelector";
import { PriceChart } from "@/components/dashboard/PriceChart";
import { ModelInfo } from "@/components/dashboard/ModelInfo";
import { PredictionPanel } from "@/components/dashboard/PredictionPanel";
import { ModelComparison } from "@/components/dashboard/ModelComparison";
import { PortfolioTracker } from "@/components/dashboard/PortfolioTracker";
import { TechnicalIndicatorsPanel } from "@/components/dashboard/TechnicalIndicatorsPanel";
import { LivePriceDisplay } from "@/components/dashboard/LivePriceDisplay";
import { PredictionHistory } from "@/components/dashboard/PredictionHistory";
import { TutorialOverlay } from "@/components/tutorial/TutorialOverlay";
import { usePredictions } from "@/hooks/usePredictions";
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
import { TrendingUp, DollarSign, BarChart3, Percent, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { toast } = useToast();
  const [selectedCoin, setSelectedCoin] = useState<CoinInfo>(coins[0]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [latestPrediction, setLatestPrediction] = useState<number | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const { savePrediction } = usePredictions();

  const selectedModel = getModelForCoin(selectedCoin.symbol);

  const historicalData = useMemo(
    () => generateHistoricalData(selectedCoin),
    [selectedCoin]
  );

  const lastPrice = historicalData[historicalData.length - 1]?.close || 0;

  const predictions = useMemo(
    () => generatePredictions(lastPrice, selectedCoin.symbol === "DOGE" ? 0.06 : 0.03),
    [lastPrice, selectedCoin.symbol]
  );

  const priceChange24h = useMemo(() => {
    if (historicalData.length < 2) return 0;
    const yesterday = historicalData[historicalData.length - 2].close;
    const today = historicalData[historicalData.length - 1].close;
    return (today - yesterday) / yesterday;
  }, [historicalData]);

  useEffect(() => {
    const tutorialCompleted = localStorage.getItem('tutorial_completed');
    if (!tutorialCompleted) {
      setShowTutorial(true);
    }
  }, []);

  const handleCoinChange = (coin: CoinInfo) => {
    setSelectedCoin(coin);
    setShowPredictions(false);
    setLatestPrediction(null);
  };

  const handleRunPrediction = async () => {
    setIsLoading(true);

    setTimeout(async () => {
      const prediction = predictions[0]?.close || lastPrice * 1.02;
      setLatestPrediction(prediction);
      setShowPredictions(true);
      setIsLoading(false);

      // Save prediction to database
      await savePrediction({
        coinSymbol: selectedCoin.symbol,
        predictedPrice: prediction,
        modelVersion: selectedModel?.version || 'unknown',
        confidence: (selectedModel?.accuracy || 80) / 100,
        horizonDays: 7,
      });

      toast({
        title: "Prediction Complete & Saved",
        description: `${selectedCoin.symbol} forecast: ${formatCurrency(prediction, selectedCoin.symbol)}`,
      });
    }, 1500);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-background gradient-mesh">
      <Header />
      <TutorialOverlay isOpen={showTutorial} onClose={() => {
        setShowTutorial(false);
        localStorage.setItem('tutorial_completed', 'true');
      }} />

      <motion.main 
        className="container px-4 py-6 md:px-6 md:py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Tutorial Button */}
        <motion.div variants={itemVariants} className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTutorial(true)}
            className="text-muted-foreground"
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Tutorial
          </Button>
        </motion.div>

        {/* Coin Selector */}
        <motion.div variants={itemVariants} className="mb-6">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            Select Cryptocurrency
          </h2>
          <CoinSelector selectedCoin={selectedCoin} onSelectCoin={handleCoinChange} />
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard title="Current Price" value={formatCurrency(lastPrice, selectedCoin.symbol)} change={formatPercentage(priceChange24h)} changeType={priceChange24h >= 0 ? "positive" : "negative"} icon={DollarSign} subtitle={`${selectedCoin.symbol}/USD`} coinColor={selectedCoin.color} />
          <StatsCard title="24h High" value={formatCurrency(Math.max(...historicalData.slice(-1).map((d) => d.high)), selectedCoin.symbol)} icon={TrendingUp} subtitle="Daily peak" coinColor={selectedCoin.color} />
          <StatsCard title="24h Volume" value={formatVolume(historicalData[historicalData.length - 1]?.volume || 0)} icon={BarChart3} subtitle="Trading volume" />
          <StatsCard title="Model Accuracy" value={`${(selectedModel?.accuracy || 0).toFixed(1)}%`} change="R² Score" changeType="positive" icon={Percent} subtitle={selectedModel?.algorithm || "No model"} />
        </motion.div>

        {/* Live Price + Chart Row */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="lg:col-span-1">
            <LivePriceDisplay coin={selectedCoin} />
          </div>
          <div className="lg:col-span-3">
            <PriceChart historicalData={historicalData} predictions={predictions} showPredictions={showPredictions} coin={selectedCoin} />
          </div>
        </motion.div>

        {/* Technical Indicators + Prediction Panel */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <TechnicalIndicatorsPanel historicalData={historicalData} coin={selectedCoin} />
          </div>
          <div className="space-y-6">
            <ModelInfo model={selectedModel} coin={selectedCoin} />
            <PredictionPanel model={selectedModel} coin={selectedCoin} onRunPrediction={handleRunPrediction} showPredictions={showPredictions} onTogglePredictions={setShowPredictions} latestPrediction={latestPrediction} isLoading={isLoading} />
          </div>
        </motion.div>

        {/* Portfolio + History Row */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <PortfolioTracker />
          <PredictionHistory />
        </motion.div>

        {/* Model Comparison */}
        <motion.div variants={itemVariants}>
          <ModelComparison />
        </motion.div>
      </motion.main>
    </div>
  );
};

export default Dashboard;