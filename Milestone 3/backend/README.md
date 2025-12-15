# Backend API for CryptoForecast

This FastAPI backend loads the actual trained ML models and provides prediction endpoints.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/models` - List all available models
- `GET /api/model-info/{coin}` - Get model information (bitcoin, ethereum, binance_coin, cardano, dogecoin)
- `POST /api/predict/{coin}` - Make predictions

## API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Example Request

```bash
curl -X POST "http://localhost:8000/api/predict/bitcoin" \
  -H "Content-Type: application/json" \
  -d '{
    "historical_data": [...],
    "forecast_days": 7
  }'
```
