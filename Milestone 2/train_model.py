#!/usr/bin/env python3
"""
Linear Regression Model Training with Cross-Validation & Hyperparameter Tuning
- Performs 5-Fold Time Series Cross-Validation
- Hyperparameter tuning with GridSearchCV for Ridge/Lasso/ElasticNet
- Evaluates with R² Score, MAE (₹), and MSE metrics
- Generates visualization graphs (Actual vs Predicted, Residuals, etc.)
- Saves best model for each coin
"""

import os
import json
import pickle
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.linear_model import LinearRegression, Ridge, Lasso, ElasticNet
from sklearn.model_selection import GridSearchCV, TimeSeriesSplit, cross_val_score
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from datetime import datetime

# Set style for plots
sns.set_style("whitegrid")
plt.rcParams['figure.figsize'] = (12, 6)

# ========== SETTINGS ==========
COINS = {
    "bitcoin": "BTC",
    "ethereum": "ETH",
    "binance_coin": "BNB",
    "cardano": "ADA",
    "dogecoin": "DOGE"
}
PROCESSED_DATA_DIR = "processed_data"
MODELS_DIR = "models"
PLOTS_DIR = "plots"
N_SPLITS = 5  # Cross-validation folds

print("="*80)
print("LINEAR REGRESSION WITH CROSS-VALIDATION & HYPERPARAMETER TUNING")
print("="*80)
print(f"Training models for {len(COINS)} cryptocurrencies")
print(f"✓ Cross-Validation: {N_SPLITS}-Fold Time Series Split")
print(f"✓ Hyperparameter Tuning: GridSearchCV for Ridge/Lasso/ElasticNet")
print(f"✓ Visualization: Actual vs Predicted, Residuals, Feature Importance")
print("="*80)

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(PLOTS_DIR, exist_ok=True)

# ========== MIN-MAX SCALER (for unpickling) ==========
class MinMaxScaler:
    """MinMax Scaler - must match the one used in feature extraction"""
    def __init__(self):
        self.data_min_ = None
        self.data_max_ = None
        self.feature_range = (0, 1)
    
    def fit(self, X):
        X = np.array(X)
        self.data_min_ = np.min(X, axis=0)
        self.data_max_ = np.max(X, axis=0)
        return self
    
    def transform(self, X):
        X = np.array(X)
        X_std = (X - self.data_min_) / (self.data_max_ - self.data_min_ + 1e-8)
        return X_std * (self.feature_range[1] - self.feature_range[0]) + self.feature_range[0]
    
    def fit_transform(self, X):
        return self.fit(X).transform(X)
    
    def inverse_transform(self, X_scaled):
        X_scaled = np.array(X_scaled)
        return X_scaled * (self.data_max_ - self.data_min_) + self.data_min_

# ========== LOAD DATA ==========
def load_coin_data(coin_name):
    """Load processed data for a coin"""
    coin_dir = os.path.join(PROCESSED_DATA_DIR, coin_name)
    
    # Load CSV files
    X_train = pd.read_csv(os.path.join(coin_dir, "X_train.csv")).values
    X_test = pd.read_csv(os.path.join(coin_dir, "X_test.csv")).values
    y_train = pd.read_csv(os.path.join(coin_dir, "y_train.csv"))['target'].values
    y_test = pd.read_csv(os.path.join(coin_dir, "y_test.csv"))['target'].values
    
    # Load scaler
    with open(os.path.join(coin_dir, "scaler.pkl"), "rb") as f:
        scaler = pickle.load(f)
    
    # Load metadata
    with open(os.path.join(coin_dir, "metadata.json"), "r") as f:
        metadata = json.load(f)
    
    return X_train, y_train, X_test, y_test, scaler, metadata

# ========== INVERSE TRANSFORM TARGET ==========
def inverse_transform_target(scaler, y_scaled, num_features):
    """Properly inverse transform the target variable"""
    # Create dummy array with zeros for features and actual values for target
    dummy = np.zeros((len(y_scaled), num_features + 1))
    dummy[:, -1] = y_scaled  # Target is last column
    
    # Inverse transform
    dummy_original = scaler.inverse_transform(dummy)
    
    # Extract target column
    return dummy_original[:, -1]

# ========== GENERATE PLOTS ==========
def generate_plots(coin_symbol, y_test_original, y_pred_original, residuals, coin_dir):
    """Generate visualization plots"""
    
    # Plot 1: Actual vs Predicted
    plt.figure(figsize=(14, 6))
    
    plt.subplot(1, 2, 1)
    plt.scatter(y_test_original, y_pred_original, alpha=0.5, s=10)
    plt.plot([y_test_original.min(), y_test_original.max()], 
             [y_test_original.min(), y_test_original.max()], 
             'r--', lw=2, label='Perfect Prediction')
    plt.xlabel('Actual Price (₹)', fontsize=12)
    plt.ylabel('Predicted Price (₹)', fontsize=12)
    plt.title(f'{coin_symbol} - Actual vs Predicted', fontsize=14, fontweight='bold')
    plt.legend()
    plt.grid(True, alpha=0.3)
    
    # Plot 2: Residuals Distribution
    plt.subplot(1, 2, 2)
    plt.hist(residuals, bins=50, edgecolor='black', alpha=0.7)
    plt.xlabel('Residuals (₹)', fontsize=12)
    plt.ylabel('Frequency', fontsize=12)
    plt.title(f'{coin_symbol} - Residuals Distribution', fontsize=14, fontweight='bold')
    plt.axvline(x=0, color='r', linestyle='--', linewidth=2)
    plt.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(os.path.join(coin_dir, f'{coin_symbol}_predictions.png'), dpi=150, bbox_inches='tight')
    plt.close()
    
    # Plot 3: Time Series Prediction
    plt.figure(figsize=(14, 6))
    sample_size = min(500, len(y_test_original))
    indices = np.arange(sample_size)
    
    plt.plot(indices, y_test_original[:sample_size], label='Actual', linewidth=2, alpha=0.7)
    plt.plot(indices, y_pred_original[:sample_size], label='Predicted', linewidth=2, alpha=0.7)
    plt.xlabel('Time Steps', fontsize=12)
    plt.ylabel('Price (₹)', fontsize=12)
    plt.title(f'{coin_symbol} - Time Series Prediction (First {sample_size} samples)', fontsize=14, fontweight='bold')
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(os.path.join(coin_dir, f'{coin_symbol}_timeseries.png'), dpi=150, bbox_inches='tight')
    plt.close()
    
    # Plot 4: Residuals over Time
    plt.figure(figsize=(14, 6))
    plt.scatter(indices, residuals[:sample_size], alpha=0.5, s=10)
    plt.axhline(y=0, color='r', linestyle='--', linewidth=2)
    plt.xlabel('Time Steps', fontsize=12)
    plt.ylabel('Residuals (₹)', fontsize=12)
    plt.title(f'{coin_symbol} - Residuals Over Time', fontsize=14, fontweight='bold')
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(os.path.join(coin_dir, f'{coin_symbol}_residuals_time.png'), dpi=150, bbox_inches='tight')
    plt.close()

# ========== TRAIN MODEL ==========
def train_coin_model(coin_name, coin_symbol):
    """Train and evaluate model with cross-validation & hyperparameter tuning"""
    print(f"\nTraining {coin_symbol}...")
    
    # Load data
    X_train, y_train, X_test, y_test, scaler, metadata = load_coin_data(coin_name)
    num_features = X_train.shape[1]
    
    print(f"  Data: {X_train.shape[0]} train, {X_test.shape[0]} test samples")
    
    # Time Series Cross-Validation
    tscv = TimeSeriesSplit(n_splits=N_SPLITS)
    
    # ========== HYPERPARAMETER TUNING ==========
    print(f"  Running Cross-Validation & Hyperparameter Tuning...")
    
    models_to_try = {
        'Linear': (LinearRegression(), {}),
        'Ridge': (Ridge(), {'alpha': [0.001, 0.01, 0.1, 1.0, 10.0, 100.0, 1000.0]}),
        'Lasso': (Lasso(max_iter=10000), {'alpha': [0.0001, 0.001, 0.01, 0.1, 1.0, 10.0]}),
        'ElasticNet': (ElasticNet(max_iter=10000), {
            'alpha': [0.0001, 0.001, 0.01, 0.1, 1.0],
            'l1_ratio': [0.1, 0.3, 0.5, 0.7, 0.9]
        })
    }
    
    best_cv_score = -np.inf
    best_model = None
    best_name = None
    best_params = None
    
    for name, (model, param_grid) in models_to_try.items():
        if param_grid:
            # Hyperparameter tuning with GridSearchCV
            grid = GridSearchCV(
                model, param_grid, cv=tscv, scoring='r2', 
                n_jobs=-1, verbose=0
            )
            grid.fit(X_train, y_train)
            cv_score = grid.best_score_
            trained_model = grid.best_estimator_
            params = grid.best_params_
        else:
            # Simple cross-validation for Linear Regression
            trained_model = model.fit(X_train, y_train)
            cv_scores = cross_val_score(model, X_train, y_train, cv=tscv, scoring='r2')
            cv_score = cv_scores.mean()
            params = {}
        
        if cv_score > best_cv_score:
            best_cv_score = cv_score
            best_model = trained_model
            best_name = name
            best_params = params
    
    print(f"  ✓ Best Model: {best_name}")
    if best_params:
        print(f"  ✓ Best Params: {best_params}")
    print(f"  ✓ CV R² Score: {best_cv_score:.4f}")
    
    # ========== EVALUATE ON TEST SET ==========
    y_pred = best_model.predict(X_test)
    
    # Metrics on scaled data
    r2_scaled = r2_score(y_test, y_pred)
    
    # Inverse transform to original scale
    y_test_original = inverse_transform_target(scaler, y_test, num_features)
    y_pred_original = inverse_transform_target(scaler, y_pred, num_features)
    
    # Metrics on original scale (INR)
    r2 = r2_score(y_test_original, y_pred_original)
    mae = mean_absolute_error(y_test_original, y_pred_original)
    rmse = np.sqrt(mean_squared_error(y_test_original, y_pred_original))
    
    # Calculate MAPE (Mean Absolute Percentage Error) - scale-independent
    mape = np.mean(np.abs((y_test_original - y_pred_original) / (y_test_original + 1e-8))) * 100
    
    # Calculate residuals
    residuals = y_test_original - y_pred_original
    
    # ========== SAVE MODEL ==========
    coin_model_dir = os.path.join(MODELS_DIR, coin_name)
    os.makedirs(coin_model_dir, exist_ok=True)
    
    with open(os.path.join(coin_model_dir, "model.pkl"), "wb") as f:
        pickle.dump(best_model, f)
    
    # ========== GENERATE PLOTS ==========
    print(f"  Generating plots...")
    generate_plots(coin_symbol, y_test_original, y_pred_original, residuals, coin_model_dir)
    
    # ========== SAVE RESULTS ==========
    results = {
        'coin': coin_name,
        'symbol': coin_symbol,
        'model_type': best_name,
        'best_params': best_params,
        'cv_r2_score': float(best_cv_score),
        'test_r2_score': float(r2),
        'mae': float(mae),
        'rmse': float(rmse),
        'mape': float(mape),
        'train_samples': len(X_train),
        'test_samples': len(X_test),
        'num_features': num_features,
        'timestamp': datetime.now().isoformat()
    }
    
    with open(os.path.join(coin_model_dir, "results.json"), "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"  ✓ R² Score: {r2:.4f}")
    print(f"  ✓ MAE: ₹{mae:.4f}")
    print(f"  ✓ MAPE: {mape:.4f}%")
    print(f"  ✓ RMSE: ₹{rmse:.2f}")
    
    return results

# ========== TRAIN ALL COINS ==========
all_results = []
for coin_name, coin_symbol in COINS.items():
    try:
        result = train_coin_model(coin_name, coin_symbol)
        all_results.append(result)
    except Exception as e:
        print(f"  ❌ Error training {coin_symbol}: {str(e)}")
        import traceback
        traceback.print_exc()

# ========== DISPLAY RESULTS TABLE ==========
print("\n" + "="*80)
print("TRAINING RESULTS")
print("="*80)
print()
print(f"{'Coin':<10} {'Metric':<15} {'Value':<20}")
print("-" * 50)

for result in all_results:
    symbol = result['symbol']
    r2 = result['test_r2_score']
    mae = result['mae']
    rmse = result['rmse']
    mape = result['mape']
    
    # Calculate MSE from RMSE
    mse_inr = rmse ** 2
    
    # Convert to USD
    USD_TO_INR = 83.0
    mae_usd = mae / USD_TO_INR
    mse_usd = mse_inr / (USD_TO_INR ** 2)
    
    print(f"{symbol:<10} {'R2 Score':<15} {r2:.4f}")
    print(f"{'':<10} {'MAE ($)':<15} ${mae_usd:.2f}")
    print(f"{'':<10} {'MAE (₹)':<15} ₹{mae:.2f}")
    print(f"{'':<10} {'MSE ($)':<15} ${mse_usd:.2f}")
    print(f"{'':<10} {'MSE (₹)':<15} ₹{mse_inr:.2f}")
    print(f"{'':<10} {'MAPE (%)':<15} {mape:.4f}%")
    print()

print("="*80)

# Save summary
summary = {
    'training_date': datetime.now().isoformat(),
    'method': 'Cross-Validation + Hyperparameter Tuning',
    'cv_folds': N_SPLITS,
    'coins': all_results,
    'average_r2': np.mean([r['test_r2_score'] for r in all_results]),
    'average_mae': np.mean([r['mae'] for r in all_results]),
    'target_met': all([r['test_r2_score'] >= 0.95 for r in all_results])
}

with open(os.path.join(MODELS_DIR, "training_summary.json"), "w") as f:
    json.dump(summary, f, indent=2)

print(f"\n✓ Average R² Score: {summary['average_r2']:.4f}")
print(f"✓ Average MAE: ₹{summary['average_mae']:.4f}")
print(f"✓ Target (R² > 0.95): {'ACHIEVED ✓' if summary['target_met'] else 'NOT MET ✗'}")
print("\n" + "="*80)
print(f"Models saved to: {MODELS_DIR}/{{coin}}/")
print(f"Plots saved to: {MODELS_DIR}/{{coin}}/")
print("="*80 + "\n")
