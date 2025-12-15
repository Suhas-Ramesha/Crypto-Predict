import { useState, useMemo, useEffect } from "react";
import { format, subDays } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { motion, useScroll, useTransform } from "framer-motion";
import { Header } from "@/components/dashboard/Header";
import { Footer } from "@/components/dashboard/Footer";
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
import { apiClient } from "@/services/api";
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
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [showPredictions, setShowPredictions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [latestPrediction, setLatestPrediction] = useState<number | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);


  const { savePrediction } = usePredictions();

  // Parallax Effect Hooks
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.5]);

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

    try {
      // Fetch real historical data from Binance
      const { fetchHistoricalPrices } = await import('@/services/cryptoData');
      const realHistoricalData = await fetchHistoricalPrices(
        selectedCoin.symbol,
        720,
        dateRange.from.getTime(),
        dateRange.to.getTime()
      );

      // Prepare data for API
      const historicalDataForAPI = realHistoricalData.map(d => ({
        timestamp: d.timestamp.toISOString(),
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
        volume: d.volume,
      }));

      // Get coin name for API
      const coinNameMap: Record<string, string> = {
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'BNB': 'binance_coin',
        'DOGE': 'dogecoin',
        'ADA': 'cardano',
      };
      const coinName = coinNameMap[selectedCoin.symbol];

      // Call backend API with real data
      const response = await apiClient.makePrediction(coinName, {
        historical_data: historicalDataForAPI,
        forecast_days: 7,
      });

      // Get first prediction
      const prediction = response.predictions[0]?.predicted_price || lastPrice * 1.02;
      setLatestPrediction(prediction);
      setShowPredictions(true);

      // Save prediction to database
      await savePrediction({
        coinSymbol: selectedCoin.symbol,
        predictedPrice: prediction,
        modelVersion: selectedModel?.version || 'unknown',
        confidence: (response.model_info.accuracy || 80) / 100,
        horizonDays: 7,
      });

      toast({
        title: "Prediction Complete & Saved",
        description: `${selectedCoin.symbol} forecast: ${formatCurrency(prediction, selectedCoin.symbol)} (using real market data)`,
      });
    } catch (error) {
      console.error('Prediction error:', error);
      toast({
        title: "Prediction Failed",
        description: error instanceof Error ? error.message : "Failed to get prediction",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
    <div className="min-h-screen bg-background gradient-mesh relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-10 pointer-events-none"
        style={{ backgroundImage: `url('/crypto-bg.png')` }}
      />

      {/* Parallax Background Elements */}
      <motion.div
        style={{ y: y1, opacity }}
        className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none z-0"
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl pointer-events-none z-0"
      />
      <motion.div
        style={{ y: y1 }}
        className="absolute top-[60%] left-[-10%] w-[400px] h-[400px] rounded-full bg-secondary/10 blur-3xl pointer-events-none z-0"
      />

      <div className="relative z-10">
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
            <div className="lg:col-span-2 space-y-6">
              <TechnicalIndicatorsPanel historicalData={historicalData} coin={selectedCoin} />

              <div className="glass-card animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <div className="p-4 border-b border-border/50">
                  <h3 className="font-semibold text-foreground">Recent Predictions</h3>
                </div>
                <div className="p-2">
                  {/* Re-using PredictionHistory but we might need to adjust it if it has its own card styling */}
                  <PredictionHistory />
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="glass-card p-5 animate-fade-in space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-foreground">Data Period</h3>
                </div>
                <div className="flex flex-col space-y-4">
                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground block">From Date</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateRange.from && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.from ? format(dateRange.from, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateRange.from}
                          onSelect={(date) => date && setDateRange(prev => ({ ...prev, from: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground block">To Date</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateRange.to && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.to ? format(dateRange.to, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateRange.to}
                          onSelect={(date) => date && setDateRange(prev => ({ ...prev, to: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  {/* Verification Feedback */}
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">
                      Using data from <span className="text-primary font-medium">{format(dateRange.from, "MMM d")}</span> to <span className="text-primary font-medium">{format(dateRange.to, "MMM d")}</span> for prediction.
                    </p>
                  </div>
                </div>
              </div>
              <ModelInfo model={selectedModel} coin={selectedCoin} />
              <PredictionPanel model={selectedModel} coin={selectedCoin} onRunPrediction={handleRunPrediction} showPredictions={showPredictions} onTogglePredictions={setShowPredictions} latestPrediction={latestPrediction} isLoading={isLoading} />
            </div>
          </motion.div>

          {/* Portfolio + Model Comparison Row */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <PortfolioTracker />
            <ModelComparison />
          </motion.div>
        </motion.main>
        <Footer />
      </div>
    </div>
  );
};

export default Dashboard;