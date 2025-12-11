import { Link } from "react-router-dom";
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
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
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

      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-mesh">
        <div className="container mx-auto px-4 md:px-6 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/30 hover:bg-primary/20">
              <Zap className="h-3 w-3 mr-1" />
              AI-Powered Predictions
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 tracking-tight">
              Forecast Crypto Prices with{" "}
              <span className="text-gradient-primary">Machine Learning</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Harness the power of Linear Regression models to predict cryptocurrency prices.
              Analyze BTC, ETH, BNB, DOGE, and ADA with professional-grade forecasting tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
            </div>

            {/* Supported Coins */}
            <div className="mt-12 flex items-center justify-center gap-6 flex-wrap">
              <span className="text-sm text-muted-foreground">Supported:</span>
              {coins.map((coin) => (
                <div
                  key={coin.symbol}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50"
                >
                  <span style={{ color: coin.color }} className="text-lg font-bold">
                    {coin.icon}
                  </span>
                  <span className="text-sm font-medium text-foreground">{coin.symbol}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-chart-prediction/10 rounded-full blur-3xl translate-x-1/2" />
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 border-t border-border/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Powerful Forecasting Features
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform combines advanced machine learning with intuitive visualization
              to help you make informed trading decisions.
            </p>
          </div>

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
              <div
                key={feature.title}
                className="glass-card p-6 group hover:border-primary/30 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 md:py-32 bg-secondary/20 border-y border-border/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "5", label: "Cryptocurrencies" },
              { value: "85%+", label: "Avg Accuracy" },
              { value: "30", label: "Days Historical" },
              { value: "7", label: "Days Forecast" },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <p className="text-4xl md:text-5xl font-bold text-gradient-primary mb-2">
                  {stat.value}
                </p>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Model Performance Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Model Performance
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our Linear Regression models are trained on extensive historical data
              and validated for accuracy across all supported cryptocurrencies.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-4">
            {coins.map((coin, index) => {
              const accuracies = [87.5, 84.2, 82.8, 79.5, 81.3];
              return (
                <div
                  key={coin.symbol}
                  className="glass-card p-6 text-center animate-fade-in hover:border-primary/30 transition-all"
                  style={{ animationDelay: `${index * 0.1}s` }}
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
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 gradient-mesh">
        <div className="container mx-auto px-4 md:px-6">
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

export default Landing;
