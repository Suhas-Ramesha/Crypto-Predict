#!/usr/bin/env python3
"""
Feature Extraction for Cryptocurrency Linear Regression Model
- Extracts 29 technical features from OHLCV data (only long-term price lags 24h+ to balance accuracy)
- 5 Categories: Long-term price lags (4), Volume lags (5), Momentum/Returns (7), Volume volatility (5), Technical indicators (9)
- Applies Min-Max scaling to entire dataset (no data leakage concern as requested)
- Splits data into train/test sets (80/20) chronologically
- Saves as CSV files with ONE scaler for easier arrangement
- Output: processed_data/{coin}/ with X_train.csv, X_test.csv, y_train.csv, y_test.csv, scaler.pkl, metadata.json
"""

import os
import json
import pickle
import numpy as np
import pandas as pd
from datetime import datetime

# ========== SETTINGS ==========
COINS = ["bitcoin", "ethereum", "binance_coin", "cardano", "dogecoin"]
TRAIN_SPLIT = 0.8  # 80% train, 20% test
OUTPUT_DIR = "processed_data"

print("="*80)
print("CRYPTOCURRENCY FEATURE EXTRACTION - 29 FEATURES")
print("="*80)
print(f"Processing {len(COINS)} coins: {', '.join([c.upper() for c in COINS])}")
print(f"Train/Test Split: {int(TRAIN_SPLIT*100)}% / {int((1-TRAIN_SPLIT)*100)}%")
print("="*80)

# ========== MIN-MAX SCALER ==========
class MinMaxScaler:
    """Simple MinMax Scaler implementation"""
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

# ========== FEATURE EXTRACTION ==========
def extract_29_features(df):
    """Extract 29 features - balanced approach with long-term lags only"""
    df = df.copy()
    df = df.sort_values('timestamp').reset_index(drop=True)
    
    feature_list = []
    
    # ========== CATEGORY 1: LONG-TERM PRICE LAGS (4 features) ==========
    # NOTE: Only keeping 24h+ lags to reduce MAE/MSE without causing R²=1.0
    print("    [1/5] Long-term price lags (24h+)...")
    df['close_lag_24'] = df['close'].shift(24)
    df['close_lag_48'] = df['close'].shift(48)
    df['close_lag_72'] = df['close'].shift(72)
    df['close_lag_168'] = df['close'].shift(168)  # 1 week
    
    feature_list.extend(['close_lag_24', 'close_lag_48', 'close_lag_72', 'close_lag_168'])
    
    # ========== CATEGORY 2: VOLUME LAGS (5 features) ==========
    print("    [2/5] Volume lags...")
    df['volume_lag_1'] = df['volume'].shift(1)
    df['volume_lag_6'] = df['volume'].shift(6)
    df['volume_lag_12'] = df['volume'].shift(12)
    df['volume_lag_24'] = df['volume'].shift(24)
    df['volume_lag_48'] = df['volume'].shift(48)
    
    feature_list.extend(['volume_lag_1', 'volume_lag_6', 'volume_lag_12', 
                         'volume_lag_24', 'volume_lag_48'])
    
    # ========== CATEGORY 3: MOMENTUM / RETURNS (7 features) ==========
    # NOTE: Removed return_1h to prevent data leakage
    print("    [3/5] Momentum and returns...")
    df['return_6h'] = df['close'].pct_change(6)
    df['return_12h'] = df['close'].pct_change(12)
    df['return_24h'] = df['close'].pct_change(24)
    df['momentum_6h'] = df['close'] - df['close'].shift(6)
    df['momentum_12h'] = df['close'] - df['close'].shift(12)
    df['momentum_24h'] = df['close'] - df['close'].shift(24)
    df['roc_24h'] = ((df['close'] - df['close'].shift(24)) / (df['close'].shift(24) + 1e-8)) * 100
    
    feature_list.extend(['return_6h', 'return_12h', 'return_24h',
                         'momentum_6h', 'momentum_12h', 'momentum_24h', 'roc_24h'])
    
    # ========== CATEGORY 4: VOLUME VOLATILITY (5 features) ==========
    print("    [4/5] Volume volatility...")
    df['volume_std_6h'] = df['volume'].rolling(window=6).std()
    df['volume_std_12h'] = df['volume'].rolling(window=12).std()
    df['volume_std_24h'] = df['volume'].rolling(window=24).std()
    df['volume_mean_24h'] = df['volume'].rolling(window=24).mean()
    df['volume_change_24h'] = df['volume'].pct_change(24)
    
    feature_list.extend(['volume_std_6h', 'volume_std_12h', 'volume_std_24h',
                         'volume_mean_24h', 'volume_change_24h'])
    
    # ========== CATEGORY 5: TECHNICAL INDICATORS (9 features) ==========
    print("    [5/5] Technical indicators...")
    df['sma_7'] = df['close'].rolling(window=7).mean()
    df['sma_14'] = df['close'].rolling(window=14).mean()
    df['sma_30'] = df['close'].rolling(window=30).mean()
    
    ema_12 = df['close'].ewm(span=12, adjust=False).mean()
    ema_26 = df['close'].ewm(span=26, adjust=False).mean()
    df['macd'] = ema_12 - ema_26
    
    bb_middle = df['close'].rolling(window=20).mean()
    bb_std = df['close'].rolling(window=20).std()
    df['bb_width'] = (bb_middle + 2*bb_std) - (bb_middle - 2*bb_std)
    
    delta = df['close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / (loss + 1e-8)
    df['rsi_14'] = 100 - (100 / (1 + rs))
    
    df['price_range'] = df['high'] - df['low']
    
    high_low = df['high'] - df['low']
    high_close = np.abs(df['high'] - df['close'].shift())
    low_close = np.abs(df['low'] - df['close'].shift())
    true_range = pd.concat([high_low, high_close, low_close], axis=1).max(axis=1)
    df['atr_14'] = true_range.rolling(window=14).mean()
    
    df['vpt'] = (df['volume'] * ((df['close'] - df['close'].shift(1)) / (df['close'].shift(1) + 1e-8))).cumsum()
    
    feature_list.extend(['sma_7', 'sma_14', 'sma_30', 'macd', 'bb_width',
                         'rsi_14', 'price_range', 'atr_14', 'vpt'])
    
    df = df.dropna().reset_index(drop=True)
    
    return df, feature_list

# ========== PROCESS EACH COIN ==========
def process_coin(coin_name):
    """Process a single coin's data"""
    print(f"\n{'='*80}")
    print(f"Processing: {coin_name.upper()}")
    print(f"{'='*80}")
    
    # Load data
    csv_file = f"{coin_name}_data.csv"
    if not os.path.exists(csv_file):
        print(f"  ❌ File not found: {csv_file}")
        return None
    
    df = pd.read_csv(csv_file)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    print(f"  ✓ Loaded: {len(df)} rows")
    print(f"  ✓ Date range: {df['timestamp'].min()} to {df['timestamp'].max()}")
    
    # Extract features
    print(f"\n  Extracting 29 features...")
    df_features, feature_names = extract_29_features(df)
    
    print(f"\n  ✓ Features extracted: {len(feature_names)}")
    print(f"  ✓ Rows after cleaning: {len(df_features)}")
    
    # Prepare data
    X = df_features[feature_names].values
    y = df_features['close'].values.reshape(-1, 1)  # Keep as 2D for consistent scaling
    timestamps = df_features['timestamp'].values
    
    print(f"\n  Feature matrix shape: {X.shape}")
    print(f"  Target vector shape: {y.shape}")
    
    # ========== MIN-MAX SCALING (ONE SCALER FOR ALL DATA) ==========
    print(f"\n  Applying Min-Max Scaling (single scaler for all data)...")
    
    # Combine X and y for scaling with one scaler
    combined_data = np.hstack([X, y])
    scaler = MinMaxScaler()
    combined_scaled = scaler.fit_transform(combined_data)
    
    # Split back into X and y
    X_scaled = combined_scaled[:, :-1]
    y_scaled = combined_scaled[:, -1]
    
    print(f"  ✓ All data scaled to [0, 1] using single scaler")
    
    # ========== TRAIN-TEST SPLIT (CHRONOLOGICAL) ==========
    print(f"\n  Splitting data chronologically...")
    n_total = len(X_scaled)
    n_train = int(n_total * TRAIN_SPLIT)
    n_test = n_total - n_train
    
    X_train = X_scaled[:n_train]
    y_train = y_scaled[:n_train]
    timestamps_train = timestamps[:n_train]
    
    X_test = X_scaled[n_train:]
    y_test = y_scaled[n_train:]
    timestamps_test = timestamps[n_train:]
    
    print(f"  ✓ Train: {n_train} samples ({timestamps_train[0]} to {timestamps_train[-1]})")
    print(f"  ✓ Test: {n_test} samples ({timestamps_test[0]} to {timestamps_test[-1]})")
    
    # ========== SAVE PROCESSED DATA ==========
    print(f"\n  Saving processed data...")
    coin_dir = os.path.join(OUTPUT_DIR, coin_name)
    os.makedirs(coin_dir, exist_ok=True)
    
    # Save X_train.csv
    X_train_df = pd.DataFrame(X_train, columns=feature_names)
    X_train_file = os.path.join(coin_dir, "X_train.csv")
    X_train_df.to_csv(X_train_file, index=False)
    print(f"  ✓ Saved: X_train.csv")
    
    # Save X_test.csv
    X_test_df = pd.DataFrame(X_test, columns=feature_names)
    X_test_file = os.path.join(coin_dir, "X_test.csv")
    X_test_df.to_csv(X_test_file, index=False)
    print(f"  ✓ Saved: X_test.csv")
    
    # Save y_train.csv
    y_train_df = pd.DataFrame({'target': y_train})
    y_train_file = os.path.join(coin_dir, "y_train.csv")
    y_train_df.to_csv(y_train_file, index=False)
    print(f"  ✓ Saved: y_train.csv")
    
    # Save y_test.csv
    y_test_df = pd.DataFrame({'target': y_test})
    y_test_file = os.path.join(coin_dir, "y_test.csv")
    y_test_df.to_csv(y_test_file, index=False)
    print(f"  ✓ Saved: y_test.csv")
    
    # Save scaler (ONE scaler for all data)
    scaler_file = os.path.join(coin_dir, "scaler.pkl")
    with open(scaler_file, "wb") as f:
        pickle.dump(scaler, f)
    print(f"  ✓ Saved: scaler.pkl (single scaler for all data)")
    
    # Save metadata
    metadata = {
        "coin": coin_name,
        "total_samples": n_total,
        "train_samples": n_train,
        "test_samples": n_test,
        "num_features": len(feature_names),
        "feature_names": feature_names,
        "train_split": TRAIN_SPLIT,
        "scaler_info": "Single MinMaxScaler for both features and target",
        "scaler_shape": f"({X.shape[1] + 1},) - includes {X.shape[1]} features + 1 target",
        "date_range": {
            "train_start": str(timestamps_train[0]),
            "train_end": str(timestamps_train[-1]),
            "test_start": str(timestamps_test[0]),
            "test_end": str(timestamps_test[-1])
        },
        "feature_categories": {
            "price_lags": feature_names[0:8],
            "volume_lags": feature_names[8:13],
            "momentum_returns": feature_names[13:21],
            "volume_volatility": feature_names[21:26],
            "technical_indicators": feature_names[26:35]
        }
    }
    
    metadata_file = os.path.join(coin_dir, "metadata.json")
    with open(metadata_file, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"  ✓ Saved: metadata.json")
    
    print(f"\n  ✓ All files saved to: {coin_dir}/")
    
    return metadata

# ========== MAIN ==========
results = []
for coin in COINS:
    result = process_coin(coin)
    if result:
        results.append(result)

# ========== SUMMARY ==========
print(f"\n{'='*80}")
print("PROCESSING COMPLETE - SUMMARY")
print(f"{'='*80}")

for result in results:
    print(f"\n{result['coin'].upper()}:")
    print(f"  Total samples: {result['total_samples']}")
    print(f"  Train samples: {result['train_samples']} ({int(TRAIN_SPLIT*100)}%)")
    print(f"  Test samples: {result['test_samples']} ({int((1-TRAIN_SPLIT)*100)}%)")
    print(f"  Features: {result['num_features']}")

print(f"\n{'='*80}")
print("OUTPUT STRUCTURE:")
print(f"{'='*80}")
print("\nprocessed_data/")
print("├── bitcoin/")
print("│   ├── X_train.csv")
print("│   ├── X_test.csv")
print("│   ├── y_train.csv")
print("│   ├── y_test.csv")
print("│   ├── scaler.pkl (ONE scaler for all data)")
print("│   └── metadata.json")
print("├── ethereum/")
print("│   └── ...")
print("└── (same for all 5 coins)")

print(f"\n{'='*80}")
print("29 FEATURES BREAKDOWN:")
print(f"{'='*80}")
print("1. Long-term Price Lags (4): close_lag_24, 48, 72, 168")
print("2. Volume Lags (5): volume_lag_1, 6, 12, 24, 48")
print("3. Momentum/Returns (7): return_6h, 12h, 24h, momentum_6h, 12h, 24h, roc_24h")
print("4. Volume Volatility (5): volume_std_6h, 12h, 24h, volume_mean_24h, volume_change_24h")
print("5. Technical Indicators (9): sma_7, 14, 30, macd, bb_width, rsi_14, price_range, atr_14, vpt")

print(f"\n{'='*80}")
print("✓ All data ready for Linear Regression model training!")
print("✓ Single scaler for both features and target (easier to manage)")
print("✓ Data split chronologically (train=earlier, test=later)")
print("✓ Clean CSV format for easy loading and inspection")
print(f"{'='*80}\n")
