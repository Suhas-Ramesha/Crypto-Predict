"""
Download Cryptocurrency Hourly Data from Binance
- Downloads past 5 years of hourly OHLCV data
- Cleans data: removes outliers, NaN, duplicates, zero values
- Converts USD to INR (Rupees)
- Saves only Open, High, Low, Close, Volume columns
- For 5 coins: Bitcoin, Ethereum, Binance Coin, Cardano, Dogecoin
"""

from binance.client import Client
import pandas as pd
import numpy as np
import time
import os
from datetime import datetime, timedelta

# ---- SETTINGS ----
# NOTE: Replace with your own Binance API keys
API_KEY = "UXQKVUcbIWBp7fwWvOxJ2u6Je41bFYe3hjyId3g07Lz4F6lxqJJAH5taxETUahc0"
API_SECRET = "fb4zTmvpkTewDjIrR3CvDMcE88xM2VcBMhAXJAXgoAkuHdvhGW2EF2XChVJ3riwq"

# List of symbols to download (5 coins)
SYMBOLS = {
    "BTCUSDT": "bitcoin",
    "ETHUSDT": "ethereum",
    "BNBUSDT": "binance_coin",
    "ADAUSDT": "cardano",
    "DOGEUSDT": "dogecoin"
}

INTERVAL = Client.KLINE_INTERVAL_1HOUR  # Hourly data
# Past 5 years of data
END_DATE = datetime.now().strftime("%Y-%m-%d")
START_DATE = (datetime.now() - timedelta(days=5*365)).strftime("%Y-%m-%d")
LIMIT_PER_REQUEST = 1000  # Binance API limit

# USD to INR conversion rates (approximate historical rates)
def get_usd_to_inr_rate(date):
    """Get USD to INR exchange rate for a given date"""
    year = date.year
    if year <= 2020:
        return 74.0
    elif year == 2021:
        return 74.0
    elif year == 2022:
        return 79.0
    elif year == 2023:
        return 82.5
    elif year >= 2024:
        return 83.5
    else:
        return 75.0

print("="*60)
print("CRYPTOCURRENCY DATA DOWNLOADER")
print("="*60)
print(f"Downloading hourly data for past 5 years")
print(f"Date range: {START_DATE} to {END_DATE}")
print(f"Coins: {', '.join(SYMBOLS.values())}")
print("="*60)

# ---- CLIENT ----
client = Client(api_key=API_KEY, api_secret=API_SECRET)

# ---- DOWNLOAD FOR EACH SYMBOL ----
for symbol, coin_name in SYMBOLS.items():
    print(f"\n{'='*60}")
    print(f"Downloading {coin_name.upper()} ({symbol})...")
    print(f"{'='*60}")
    
    try:
        all_klines = []
        current_start = START_DATE
        end_date_obj = datetime.strptime(END_DATE, "%Y-%m-%d")
        
        while True:
            # Download chunk
            klines = client.get_historical_klines(
                symbol=symbol,
                interval=INTERVAL,
                start_str=current_start,
                end_str=END_DATE,
                limit=LIMIT_PER_REQUEST
            )
            
            if not klines:
                break
            
            all_klines.extend(klines)
            
            # Get the last timestamp from this chunk
            last_timestamp = klines[-1][0]  # open_time is first element
            last_date = datetime.fromtimestamp(last_timestamp / 1000)
            
            print(f"  Downloaded chunk: {len(klines)} rows (up to {last_date.strftime('%Y-%m-%d %H:%M:%S')})")
            
            # If we got less than the limit, we've reached the end
            if len(klines) < LIMIT_PER_REQUEST:
                break
            
            # If we've reached or passed the end date, stop
            if last_date >= end_date_obj:
                break
            
            # Set next start date to 1 hour after the last timestamp
            current_start = (last_date + timedelta(hours=1)).strftime("%Y-%m-%d %H:%M:%S")
            
            # Small delay to avoid rate limiting
            time.sleep(0.2)
        
        if not all_klines:
            print(f"  ⚠ No data found for {coin_name} ({symbol})")
            continue
        
        # ---- CONVERT TO DATAFRAME ----
        df = pd.DataFrame(all_klines, columns=[
            "open_time","open","high","low","close","volume",
            "close_time","quote_asset_volume","number_of_trades",
            "taker_buy_base_volume","taker_buy_quote_volume","ignore"
        ])
        
        # Convert timestamps
        df["open_time"] = pd.to_datetime(df["open_time"], unit="ms")
        
        # Remove duplicates (in case of overlap)
        initial_len = len(df)
        df = df.drop_duplicates(subset=['open_time']).sort_values('open_time').reset_index(drop=True)
        duplicates_removed = initial_len - len(df)
        if duplicates_removed > 0:
            print(f"  Removed {duplicates_removed} duplicate rows")
        
        # Filter to ensure we only have data within the date range
        start_date_obj = datetime.strptime(START_DATE, "%Y-%m-%d")
        end_date_obj = datetime.strptime(END_DATE, "%Y-%m-%d")
        df = df[(df["open_time"] >= start_date_obj) & (df["open_time"] <= end_date_obj)]
        
        # Convert price columns to numeric
        price_cols = ["open", "high", "low", "close", "volume"]
        for col in price_cols:
            df[col] = pd.to_numeric(df[col], errors='coerce')
        
        # Step 1: Remove rows with NaN/null values
        initial_len = len(df)
        df = df.dropna()
        nan_removed = initial_len - len(df)
        if nan_removed > 0:
            print(f"  Removed {nan_removed} rows with NaN/null values")
        
        # Step 2: Remove rows with zero values (0.00)
        initial_len = len(df)
        zero_mask = (
            (df["open"] == 0.0) | (df["open"] <= 1e-10) |
            (df["high"] == 0.0) | (df["high"] <= 1e-10) |
            (df["low"] == 0.0) | (df["low"] <= 1e-10) |
            (df["close"] == 0.0) | (df["close"] <= 1e-10) |
            (df["volume"] == 0.0) | (df["volume"] <= 1e-10)
        )
        df = df[~zero_mask]
        zero_removed = initial_len - len(df)
        if zero_removed > 0:
            print(f"  Removed {zero_removed} rows with zero values")
        
        # Step 3: Remove outliers using IQR method
        initial_len = len(df)
        outliers_clipped = 0
        for col in ["open", "high", "low", "close"]:
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 3 * IQR
            upper_bound = Q3 + 3 * IQR
            
            # Clip outliers instead of removing (more conservative)
            col_outliers = ((df[col] < lower_bound) | (df[col] > upper_bound)).sum()
            if col_outliers > 0:
                df[col] = df[col].clip(lower=lower_bound, upper=upper_bound)
                outliers_clipped += col_outliers
                print(f"  Clipped {col_outliers} outliers in {col}")
        
        # Step 4: Convert USD to INR (Rupees)
        print(f"  Converting USD to INR (Rupees)...")
        df['usd_inr_rate'] = df['open_time'].apply(get_usd_to_inr_rate)
        
        # Convert price columns to INR
        for col in ["open", "high", "low", "close"]:
            df[f'{col}_inr'] = df[col] * df['usd_inr_rate']
        
        # Keep volume as is (volume is in base currency units, not USD)
        # If you want volume in INR equivalent, uncomment the line below:
        # df['volume_inr'] = df['volume'] * df['close_inr']
        
        # Drop USD columns but keep timestamp
        df = df.drop(columns=["open", "high", "low", "close", "usd_inr_rate"])
        
        # Rename INR columns back to original names
        df = df.rename(columns={
            'open_inr': 'open',
            'high_inr': 'high',
            'low_inr': 'low',
            'close_inr': 'close',
            'open_time': 'timestamp'  # Rename to timestamp
        })
        
        # Final check: remove any remaining NaN after conversion
        df = df.dropna()
        
        # Sort by timestamp to ensure chronological order (important for time series)
        df = df.sort_values('timestamp').reset_index(drop=True)
        
        # Ensure columns are in correct order: timestamp, open, high, low, close, volume
        df = df[["timestamp", "open", "high", "low", "close", "volume"]]
        
        # Verify chronological order
        if not df['timestamp'].is_monotonic_increasing:
            print(f"  ⚠ Warning: Data is not in chronological order, sorting...")
            df = df.sort_values('timestamp').reset_index(drop=True)
        
        # ---- SAVE ----
        save_as = f"{coin_name}_data.csv"
        df.to_csv(save_as, index=False)
        
        print(f"  ✓ Total downloaded: {len(df)} rows")
        print(f"  ✓ Date range: {df['timestamp'].min()} to {df['timestamp'].max()}")
        print(f"  ✓ Saved to: {save_as}")
        print(f"  ✓ Columns: {', '.join(df.columns.tolist())}")
        print(f"  ✓ All price values in INR/Rupees")
        print(f"  ✓ Data sorted chronologically (ready for time series forecasting)")
        
        # Small delay to avoid rate limiting between symbols
        time.sleep(1)
        
    except Exception as e:
        print(f"  ❌ Error downloading {coin_name} ({symbol}): {str(e)}")
        import traceback
        traceback.print_exc()
        continue

print("\n" + "="*60)
print("ALL DOWNLOADS COMPLETED!")
print("="*60)
print("\nDownloaded CSV files (Timestamp + OHLCV, values in INR/Rupees):")
for coin_name in SYMBOLS.values():
    filename = f"{coin_name}_data.csv"
    if os.path.exists(filename):
        df = pd.read_csv(filename)
        print(f"  ✓ {filename}: {len(df)} rows, {len(df.columns)} columns")
        print(f"    Columns: {', '.join(df.columns)}")
        if 'timestamp' in df.columns:
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            print(f"    Date range: {df['timestamp'].min()} to {df['timestamp'].max()}")
print("="*60)
print("\n✓ All CSV files are ready for time series forecasting!")
print("  - Data is sorted chronologically")
print("  - Contains timestamp for time-based analysis")
print("  - All price values converted to INR (Rupees)")
print("  - Cleaned: no duplicates, NaN, zeros, or outliers")
print("="*60)

