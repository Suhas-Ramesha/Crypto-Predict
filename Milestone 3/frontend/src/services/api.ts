/**
 * API Client for CryptoForecast Backend
 * Handles all communication with the FastAPI backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface PricePoint {
    timestamp: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface PredictionRequest {
    historical_data: PricePoint[];
    forecast_days: number;
}

export interface Prediction {
    timestamp: string;
    predicted_price: number;
    confidence_interval: {
        lower: number;
        upper: number;
    };
}

export interface ModelInfo {
    algorithm: string;
    accuracy: number;
    r2_score: number;
    mae: number;
    mse: number;
}

export interface PredictionResponse {
    coin: string;
    symbol: string;
    predictions: Prediction[];
    model_info: ModelInfo;
}

export interface ModelMetadata {
    coin: string;
    symbol: string;
    algorithm: string;
    accuracy: number;
    r2_score: number;
    mae: number;
    trained_at: string;
}

export interface ModelsListResponse {
    models: ModelMetadata[];
}

/**
 * API Client Class
 */
class CryptoForecastAPI {
    private baseUrl: string;

    constructor(baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    /**
     * Health check endpoint
     */
    async healthCheck(): Promise<{ status: string; timestamp: string }> {
        const response = await fetch(`${this.baseUrl}/api/health`);
        if (!response.ok) {
            throw new Error('Health check failed');
        }
        return response.json();
    }

    /**
     * Get list of all available models
     */
    async getModels(): Promise<ModelsListResponse> {
        const response = await fetch(`${this.baseUrl}/api/models`);
        if (!response.ok) {
            throw new Error('Failed to fetch models');
        }
        return response.json();
    }

    /**
     * Get detailed information about a specific model
     */
    async getModelInfo(coin: string): Promise<ModelInfo & {
        coin: string;
        symbol: string;
        trained_at: string;
        train_samples: number;
        test_samples: number;
        num_features: number;
    }> {
        const response = await fetch(`${this.baseUrl}/api/model-info/${coin}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch model info for ${coin}`);
        }
        return response.json();
    }

    /**
     * Make price predictions for a specific coin
     */
    async makePrediction(
        coin: string,
        request: PredictionRequest
    ): Promise<PredictionResponse> {
        const response = await fetch(`${this.baseUrl}/api/predict/${coin}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Prediction failed');
        }

        return response.json();
    }
}

// Export singleton instance
export const apiClient = new CryptoForecastAPI();

// Export class for testing
export default CryptoForecastAPI;
