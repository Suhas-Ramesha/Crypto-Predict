import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bitcoin,
  TrendingUp,
  Brain,
  BarChart3,
  Shield,
  Zap,
  ArrowRight,
  LineChart,
  Target,
  Users,
  ChevronRight,
} from "lucide-react";
import { coins } from "@/lib/mockData";

const Landing = () => {
  const { scrollY } = useScroll();
  const heroRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Parallax transforms
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.95]);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress((scrolled / maxScroll) * 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 z-50 origin-left"
        style={{ scaleX: scrollProgress / 100 }}
      />

      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 glow-primary">
                <Bitcoin className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">CryptoForecast</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/auth">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Parallax */}
      <section className="relative overflow-hidden" ref={heroRef}>
        {/* Parallax Background */}
        <motion.div
          className="absolute inset-0 z-0"
          style={{ y: y1 }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{
              backgroundImage: "url(/crypto-bg.png)",
              filter: "blur(2px)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
        </motion.div>

        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-1/2 left-0 w-72 h-72 bg-primary/20 rounded-full blur-3xl"
          style={{ y: y2, x: -100 }}
        />
        <motion.div
          className="absolute top-1/4 right-0 w-96 h-96 bg-chart-prediction/10 rounded-full blur-3xl"
          style={{ y: y1, x: 100 }}
        />

        <motion.div
          className="container relative z-10 mx-auto px-4 md:px-6 py-20 md:py-32"
          style={{ opacity, scale }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-6 bg-primary/10 text-primary border-primary/30 hover:bg-primary/20">
                <Zap className="h-3 w-3 mr-1" />
                AI-Powered Predictions
              </Badge>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Forecast Crypto Prices with{" "}
              <span className="text-gradient-primary">Machine Learning</span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Harness the power of Linear Regression models to predict cryptocurrency prices.
              Analyze BTC, ETH, BNB, DOGE, and ADA with professional-grade forecasting tools.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link to="/auth">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 glow-primary">
                  Start Forecasting
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="border-border/50 hover:bg-accent/50">
                  View Demo
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>

            {/* Supported Coins */}
            <motion.div
              className="mt-12 flex items-center justify-center gap-6 flex-wrap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <span className="text-sm text-muted-foreground">Supported:</span>
              {coins.map((coin, index) => (
                <motion.div
                  key={coin.symbol}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <span style={{ color: coin.color }} className="text-lg font-bold">
                    {coin.icon}
                  </span>
                  <span className="text-sm font-medium text-foreground">{coin.symbol}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features Section with Scroll Animations */}
      <ScrollSection>
        <div className="container mx-auto px-4 md:px-6">
          <FadeInSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Powerful Forecasting Features
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our platform combines advanced machine learning with intuitive visualization
                to help you make informed trading decisions.
              </p>
            </div>
          </FadeInSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: "Linear Regression Models",
                description:
                  "Trained on historical data with advanced feature engineering for accurate price predictions.",
              },
              {
                icon: LineChart,
                title: "Interactive Charts",
                description:
                  "Visualize historical prices and predicted trends with our interactive charting tools.",
              },
              {
                icon: Target,
                title: "Model Accuracy Metrics",
                description:
                  "Track R², MSE, and MAE scores to understand model performance and reliability.",
              },
              {
                icon: BarChart3,
                title: "Multi-Coin Support",
                description:
                  "Analyze and forecast prices for BTC, ETH, BNB, DOGE, and ADA all in one dashboard.",
              },
              {
                icon: Shield,
                title: "Secure Platform",
                description:
                  "Enterprise-grade security with encrypted authentication and data protection.",
              },
              {
                icon: TrendingUp,
                title: "Real-Time Predictions",
                description:
                  "Get instant forecasts with confidence intervals to guide your trading strategy.",
              },
            ].map((feature, index) => (
              <FadeInSection key={feature.title} delay={index * 0.1}>
                <div className="glass-card p-6 group hover:border-primary/30 transition-all duration-300 h-full">
                  <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </ScrollSection>

      {/* Stats Section */}
      <section className="py-20 md:py-32 bg-secondary/20 border-y border-border/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "5", label: "Cryptocurrencies" },
              { value: "95%+", label: "Avg Accuracy" },
              { value: "30", label: "Days Historical" },
              { value: "7", label: "Days Forecast" },
            ].map((stat, index) => (
              <FadeInSection key={stat.label} delay={index * 0.1}>
                <div className="text-center">
                  <p className="text-4xl md:text-5xl font-bold text-gradient-primary mb-2">
                    {stat.value}
                  </p>
                  <p className="text-muted-foreground">{stat.label}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Model Performance Section */}
      <ScrollSection>
        <div className="container mx-auto px-4 md:px-6">
          <FadeInSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Model Performance
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our Linear Regression models are trained on extensive historical data
                and validated for accuracy across all supported cryptocurrencies.
              </p>
            </div>
          </FadeInSection>

          <div className="grid md:grid-cols-5 gap-4">
            {coins.map((coin, index) => {
              const accuracies = [96.8, 96.5, 95.9, 96.2, 95.7];
              return (
                <FadeInSection key={coin.symbol} delay={index * 0.1}>
                  <motion.div
                    className="glass-card p-6 text-center hover:border-primary/30 transition-all"
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <div
                      className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold"
                      style={{ backgroundColor: `${coin.color}20`, color: coin.color }}
                    >
                      {coin.icon}
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{coin.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{coin.symbol}</p>
                    <div className="bg-success/10 text-success px-3 py-1 rounded-full text-sm font-mono">
                      {accuracies[index]}% R²
                    </div>
                  </motion.div>
                </FadeInSection>
              );
            })}
          </div>
        </div>
      </ScrollSection>

      {/* CTA Section */}
      <section className="py-20 md:py-32 gradient-mesh">
        <div className="container mx-auto px-4 md:px-6">
          <FadeInSection>
            <div className="glass-card p-8 md:p-12 max-w-4xl mx-auto text-center">
              <Users className="h-12 w-12 text-primary mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ready to Start Forecasting?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Join our platform and gain access to powerful machine learning models
                for cryptocurrency price prediction.
              </p>
              <Link to="/auth">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 glow-primary">
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Bitcoin className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">CryptoForecast</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 CryptoForecast. Predictions are for educational purposes only.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Scroll animation wrapper components
const ScrollSection = ({ children }: { children: React.ReactNode }) => {
  return <section className="py-20 md:py-32 border-t border-border/50">{children}</section>;
};

const FadeInSection = ({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
};

export default Landing;
