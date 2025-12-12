import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Coins,
  LineChart,
  Brain,
  Wallet,
  Activity,
  Target,
  Sparkles,
} from 'lucide-react';

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: 'Welcome to CryptoForecast!',
    description: 'This tutorial will guide you through all the features. Our platform uses Linear Regression models to predict cryptocurrency prices. Let\'s explore!',
    icon: Sparkles,
  },
  {
    id: 2,
    title: 'Coin Selection',
    description: 'Choose from 5 cryptocurrencies: Bitcoin (BTC), Ethereum (ETH), Binance Coin (BNB), Dogecoin (DOGE), and Cardano (ADA). Each coin has its own trained model.',
    icon: Coins,
    highlight: 'coin-selector',
  },
  {
    id: 3,
    title: 'Live Price Data',
    description: 'Watch real-time prices from Binance exchange. The live display shows current price, 24h change, high/low, and volume updated every second.',
    icon: Activity,
  },
  {
    id: 4,
    title: 'Interactive Price Chart',
    description: 'View 30 days of historical data and 7-day predictions. The chart shows price movements with predictions overlaid when enabled.',
    icon: LineChart,
    highlight: 'price-chart',
  },
  {
    id: 5,
    title: 'Technical Indicators',
    description: 'Analyze with SMA, EMA, RSI, MACD, and Bollinger Bands. Each indicator helps identify trends and potential entry/exit points.',
    icon: Activity,
    highlight: 'indicators',
  },
  {
    id: 6,
    title: 'AI Predictions',
    description: 'Click "Run Prediction" to generate forecasts. Our Linear Regression models analyze patterns to predict future prices with confidence scores.',
    icon: Brain,
    highlight: 'prediction-panel',
  },
  {
    id: 7,
    title: 'Portfolio Tracker',
    description: 'Track your holdings and monitor P&L in real-time. Add positions with buy prices to see unrealized gains/losses as prices change.',
    icon: Wallet,
    highlight: 'portfolio',
  },
  {
    id: 8,
    title: 'Prediction History',
    description: 'All your predictions are saved automatically. Review past forecasts, track accuracy, and improve your strategy over time.',
    icon: Target,
  },
];

interface TutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialOverlay = ({ isOpen, onClose }: TutorialOverlayProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
    localStorage.setItem('tutorial_completed', 'true');
  };

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  const step = tutorialSteps[currentStep];
  const Icon = step.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="w-full max-w-lg mx-4"
          >
            <Card className="glass-card border-primary/30 overflow-hidden">
              {/* Progress Bar */}
              <div className="h-1 bg-secondary">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3"
                  >
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Step {currentStep + 1} of {tutorialSteps.length}
                      </p>
                      <h3 className="text-lg font-semibold text-foreground">
                        {step.title}
                      </h3>
                    </div>
                  </motion.div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={handleSkip}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Content */}
                <motion.p
                  key={step.description}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-muted-foreground mb-6 leading-relaxed"
                >
                  {step.description}
                </motion.p>

                {/* Step Indicators */}
                <div className="flex justify-center gap-1.5 mb-6">
                  {tutorialSteps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentStep
                          ? 'bg-primary w-4'
                          : index < currentStep
                          ? 'bg-primary/50'
                          : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className="text-muted-foreground"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>

                  <Button
                    onClick={handleNext}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {currentStep === tutorialSteps.length - 1 ? (
                      'Get Started'
                    ) : (
                      <>
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>

                {/* Skip Button */}
                {currentStep < tutorialSteps.length - 1 && (
                  <button
                    onClick={handleSkip}
                    className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Skip tutorial
                  </button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
