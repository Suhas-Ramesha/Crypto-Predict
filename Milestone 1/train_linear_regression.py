"""
Linear Regression Model Training with Cross-Validation and Hyperparameter Tuning
- Trains multiple regression models: Linear, Ridge, Lasso, ElasticNet
- Performs k-fold cross-validation
- Hyperparameter tuning using GridSearchCV
- Evaluates on test set with MSE, MAE, R² metrics
- Target: R² > 95%, Low MSE/MAE
- Saves best model for each coin
"""

import os
import json
import pickle
import numpy as np
import pandas as pd
import warnings
from datetime import datetime
from sklearn.linear_model import LinearRegression, Ridge, Lasso, ElasticNet
from sklearn.model_selection import GridSearchCV, TimeSeriesSplit
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import matplotlib.pyplot as plt
warnings.filterwarnings('ignore')

# ========== SETTINGS ==========
COINS = ["bitcoin", "ethereum", "binance_coin", "cardano", "dogecoin"]
PROCESSED_DATA_DIR = "processed_data"
MODELS_DIR = "models"
N_SPLITS = 5  # Number of folds for cross-validation
RANDOM_STATE = 42

print("="*80)
print("LINEAR REGRESSION MODEL TRAINING WITH HYPERPARAMETER TUNING")
print("="*80)
print(f"Processing {len(COINS)} coins: {', '.join([c.upper() for c in COINS])}")
print(f"Cross-Validation: {N_SPLITS}-Fold Time Series Split")
print(f"Target Metrics: R² > 95%, Low MSE/MAE")
print("="*80)

# Create models directory
os.makedirs(MODELS_DIR, exist_ok=True)

# ========== MIN-MAX SCALER (needed for unpickling) ==========
class MinMaxScaler:
    """Simple MinMax Scaler implementation - must match the one used in feature extraction"""
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

def load_processed_data(coin_name):
    """Load processed data for a coin"""
    coin_dir = os.path.join(PROCESSED_DATA_DIR, coin_name)
    
    X_train = np.load(os.path.join(coin_dir, "X_train.npy"))
    y_train = np.load(os.path.join(coin_dir, "y_train.npy"))
    X_test = np.load(os.path.join(coin_dir, "X_test.npy"))
    y_test = np.load(os.path.join(coin_dir, "y_test.npy"))
    
    with open(os.path.join(coin_dir, "scaler.pkl"), "rb") as f:
        scaler = pickle.load(f)
    
    with open(os.path.join(coin_dir, "metadata.json"), "r") as f:
        metadata = json.load(f)
    
    return X_train, y_train, X_test, y_test, scaler, metadata

def evaluate_model(model, X_train, y_train, X_test, y_test, model_name):
    """Evaluate model and return metrics"""
    # Train predictions
    y_train_pred = model.predict(X_train)
    train_mse = mean_squared_error(y_train, y_train_pred)
    train_mae = mean_absolute_error(y_train, y_train_pred)
    train_r2 = r2_score(y_train, y_train_pred)
    
    # Test predictions
    y_test_pred = model.predict(X_test)
    test_mse = mean_squared_error(y_test, y_test_pred)
    test_mae = mean_absolute_error(y_test, y_test_pred)
    test_r2 = r2_score(y_test, y_test_pred)
    
    return {
        'model_name': model_name,
        'train_mse': train_mse,
        'train_mae': train_mae,
        'train_r2': train_r2,
        'test_mse': test_mse,
        'test_mae': test_mae,
        'test_r2': test_r2,
        'predictions': y_test_pred
    }

def train_models_with_cv(coin_name):
    """Train and evaluate multiple regression models with cross-validation"""
    print(f"\n{'='*80}")
    print(f"Training Models: {coin_name.upper()}")
    print(f"{'='*80}")
    
    # Load data
    X_train, y_train, X_test, y_test, scaler, metadata = load_processed_data(coin_name)
    
    # Get number of features from metadata or calculate it
    num_features = metadata.get('num_features', len(metadata.get('feature_names', [])))
    if num_features == 0:
        num_features = X_train.shape[1]
    
    print(f"  ✓ Loaded data:")
    print(f"    Train: {X_train.shape}, Test: {X_test.shape}")
    print(f"    Features: {num_features}")
    
    # Time Series Cross-Validation
    tscv = TimeSeriesSplit(n_splits=N_SPLITS)
    
    results = []
    
    # ========== MODEL 1: LINEAR REGRESSION (BASELINE) ==========
    print(f"\n  [1/4] Training Linear Regression (Baseline)...")
    lr = LinearRegression()
    lr.fit(X_train, y_train)
    lr_results = evaluate_model(lr, X_train, y_train, X_test, y_test, "Linear Regression")
    results.append(lr_results)
    print(f"    Train R²: {lr_results['train_r2']:.4f}, Test R²: {lr_results['test_r2']:.4f}")
    print(f"    Test MSE: {lr_results['test_mse']:.6f}, Test MAE: {lr_results['test_mae']:.6f}")
    
    # ========== MODEL 2: RIDGE REGRESSION (L2 REGULARIZATION) ==========
    print(f"\n  [2/4] Training Ridge Regression with GridSearchCV...")
    ridge_params = {
        'alpha': [0.001, 0.01, 0.1, 1.0, 10.0, 100.0, 1000.0],
        'solver': ['auto', 'svd', 'cholesky', 'lsqr']
    }
    ridge = Ridge(random_state=RANDOM_STATE)
    ridge_grid = GridSearchCV(
        ridge, ridge_params, cv=tscv, scoring='r2', 
        n_jobs=-1, verbose=0
    )
    ridge_grid.fit(X_train, y_train)
    print(f"    Best params: {ridge_grid.best_params_}")
    print(f"    Best CV R²: {ridge_grid.best_score_:.4f}")
    
    ridge_results = evaluate_model(ridge_grid.best_estimator_, X_train, y_train, X_test, y_test, "Ridge Regression")
    results.append(ridge_results)
    print(f"    Train R²: {ridge_results['train_r2']:.4f}, Test R²: {ridge_results['test_r2']:.4f}")
    print(f"    Test MSE: {ridge_results['test_mse']:.6f}, Test MAE: {ridge_results['test_mae']:.6f}")
    
    # ========== MODEL 3: LASSO REGRESSION (L1 REGULARIZATION) ==========
    print(f"\n  [3/4] Training Lasso Regression with GridSearchCV...")
    lasso_params = {
        'alpha': [0.0001, 0.001, 0.01, 0.1, 1.0, 10.0],
        'max_iter': [10000, 50000]
    }
    lasso = Lasso(random_state=RANDOM_STATE)
    lasso_grid = GridSearchCV(
        lasso, lasso_params, cv=tscv, scoring='r2',
        n_jobs=-1, verbose=0
    )
    lasso_grid.fit(X_train, y_train)
    print(f"    Best params: {lasso_grid.best_params_}")
    print(f"    Best CV R²: {lasso_grid.best_score_:.4f}")
    
    lasso_results = evaluate_model(lasso_grid.best_estimator_, X_train, y_train, X_test, y_test, "Lasso Regression")
    results.append(lasso_results)
    print(f"    Train R²: {lasso_results['train_r2']:.4f}, Test R²: {lasso_results['test_r2']:.4f}")
    print(f"    Test MSE: {lasso_results['test_mse']:.6f}, Test MAE: {lasso_results['test_mae']:.6f}")
    
    # ========== MODEL 4: ELASTICNET (L1 + L2 REGULARIZATION) ==========
    print(f"\n  [4/4] Training ElasticNet with GridSearchCV...")
    elastic_params = {
        'alpha': [0.0001, 0.001, 0.01, 0.1, 1.0],
        'l1_ratio': [0.1, 0.3, 0.5, 0.7, 0.9],
        'max_iter': [10000, 50000]
    }
    elastic = ElasticNet(random_state=RANDOM_STATE)
    elastic_grid = GridSearchCV(
        elastic, elastic_params, cv=tscv, scoring='r2',
        n_jobs=-1, verbose=0
    )
    elastic_grid.fit(X_train, y_train)
    print(f"    Best params: {elastic_grid.best_params_}")
    print(f"    Best CV R²: {elastic_grid.best_score_:.4f}")
    
    elastic_results = evaluate_model(elastic_grid.best_estimator_, X_train, y_train, X_test, y_test, "ElasticNet")
    results.append(elastic_results)
    print(f"    Train R²: {elastic_results['train_r2']:.4f}, Test R²: {elastic_results['test_r2']:.4f}")
    print(f"    Test MSE: {elastic_results['test_mse']:.6f}, Test MAE: {elastic_results['test_mae']:.6f}")
    
    # ========== SELECT BEST MODEL ==========
    print(f"\n  Selecting best model based on Test R²...")
    best_result = max(results, key=lambda x: x['test_r2'])
    print(f"  ✓ Best Model: {best_result['model_name']}")
    print(f"    Test R²: {best_result['test_r2']:.4f}")
    print(f"    Test MSE: {best_result['test_mse']:.6f}")
    print(f"    Test MAE: {best_result['test_mae']:.6f}")
    
    # Get best model
    if best_result['model_name'] == "Linear Regression":
        best_model = lr
    elif best_result['model_name'] == "Ridge Regression":
        best_model = ridge_grid.best_estimator_
    elif best_result['model_name'] == "Lasso Regression":
        best_model = lasso_grid.best_estimator_
    else:
        best_model = elastic_grid.best_estimator_
    
    # ========== SAVE BEST MODEL ==========
    print(f"\n  Saving best model...")
    coin_model_dir = os.path.join(MODELS_DIR, coin_name)
    os.makedirs(coin_model_dir, exist_ok=True)
    
    # Save model
    model_file = os.path.join(coin_model_dir, "best_model.pkl")
    with open(model_file, "wb") as f:
        pickle.dump(best_model, f)
    
    # Save all results
    results_file = os.path.join(coin_model_dir, "training_results.json")
    results_data = {
        'coin': coin_name,
        'best_model': best_result['model_name'],
        'models': [
            {
                'name': r['model_name'],
                'train_r2': float(r['train_r2']),
                'train_mse': float(r['train_mse']),
                'train_mae': float(r['train_mae']),
                'test_r2': float(r['test_r2']),
                'test_mse': float(r['test_mse']),
                'test_mae': float(r['test_mae'])
            }
            for r in results
        ],
        'timestamp': datetime.now().isoformat()
    }
    
    with open(results_file, "w") as f:
        json.dump(results_data, f, indent=2)
    
    # Save predictions
    predictions_file = os.path.join(coin_model_dir, "predictions.npy")
    np.save(predictions_file, best_result['predictions'])
    
    print(f"  ✓ Saved to: {coin_model_dir}/")
    print(f"    - best_model.pkl")
    print(f"    - training_results.json")
    print(f"    - predictions.npy")
    
    return results_data

# ========== TRAIN ALL COINS ==========
all_results = []
for coin in COINS:
    try:
        result = train_models_with_cv(coin)
        all_results.append(result)
    except Exception as e:
        print(f"\n  ❌ Error processing {coin}: {str(e)}")
        import traceback
        traceback.print_exc()

# ========== FINAL SUMMARY ==========
print(f"\n{'='*80}")
print("TRAINING COMPLETE - FINAL SUMMARY")
print(f"{'='*80}")

summary_table = []
for result in all_results:
    best_model = next(m for m in result['models'] if m['name'] == result['best_model'])
    summary_table.append({
        'Coin': result['coin'].upper(),
        'Best Model': result['best_model'],
        'Test R²': f"{best_model['test_r2']:.4f}",
        'Test MSE': f"{best_model['test_mse']:.6f}",
        'Test MAE': f"{best_model['test_mae']:.6f}",
        'Target Met': '✓' if best_model['test_r2'] >= 0.95 else '✗'
    })

# Print summary table
print(f"\n{'Coin':<15} {'Best Model':<20} {'Test R²':<10} {'Test MSE':<15} {'Test MAE':<15} {'R²>95%':<10}")
print("-"*95)
for row in summary_table:
    print(f"{row['Coin']:<15} {row['Best Model']:<20} {row['Test R²']:<10} {row['Test MSE']:<15} {row['Test MAE']:<15} {row['Target Met']:<10}")

print(f"\n{'='*80}")
print("OUTPUT DIRECTORY: " + MODELS_DIR)
print(f"{'='*80}")
print("\nFor each coin, you'll find:")
print("  - best_model.pkl (trained model)")
print("  - training_results.json (all metrics)")
print("  - predictions.npy (test predictions)")

# Check if target met
coins_meeting_target = sum(1 for row in summary_table if row['Target Met'] == '✓')
print(f"\n{'='*80}")
if coins_meeting_target == len(COINS):
    print("✓ SUCCESS! All coins achieved R² > 95%")
else:
    print(f"⚠ {coins_meeting_target}/{len(COINS)} coins achieved R² > 95%")
    print("\nSuggestions to improve R²:")
    print("  1. Add more features (technical indicators)")
    print("  2. Try polynomial features")
    print("  3. Use ensemble methods (Random Forest, XGBoost)")
    print("  4. Feature selection to remove noise")
print(f"{'='*80}\n")
