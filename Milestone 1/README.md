# Cryptocurrency Price Prediction - Linear Regression

## Project Setup

### Step 1: Download Data
Run the download script to get hourly OHLCV data for past 5 years:

```bash
python download_binance_data.py
```

This will download data for:
- Bitcoin
- Ethereum
- Binance Coin
- Cardano
- Dogecoin

**Output:** CSV files with only OHLCV columns (Open, High, Low, Close, Volume)
- `bitcoin_data.csv`
- `ethereum_data.csv`
- `binance_coin_data.csv`
- `cardano_data.csv`
- `dogecoin_data.csv`

### Step 2: Data Preprocessing
(To be implemented - will clean data, handle missing values, create features)

### Step 3: Train Linear Regression Model
(To be implemented - will train linear regression model for price prediction)

## Requirements
- python-binance
- pandas
- numpy

Install with:
```bash
pip install python-binance pandas numpy
```
