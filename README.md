# ML-Driven Web Platform for Cryptocurrency Price Forecasting

### 🚀 **Live Demo:** [https://www.crypto-predict.me/](https://www.crypto-predict.me/)

This project is a comprehensive Machine Learning solution designed to forecast cryptocurrency prices. It evolves through three key milestones, starting from raw data acquisition to a fully deployed, interactive web application.

---

## 📅 Project Milestones

### **Milestone 1: Data Acquisition & Preprocessing**
*   **Data Source:** Integrated with **Binance API** to fetch real-time and historical market data.
*   **Scope:** Collected granular data (Open, High, Low, Close, Volume) for top cryptocurrencies: **Bitcoin (BTC), Ethereum (ETH), Binance Coin (BNB), Cardano (ADA), and Dogecoin (DOGE)**.
*   **Feature Engineering:** Developed robust scripts (`extract_features_clean.py`) to generate technical indicators and clean the dataset for modeling.

### **Milestone 2: Predictive Modeling**
*   **Model Probotyping:** Experimented with various algorithms to find the best fit for time-series forecasting.
*   **Training:** Successfully trained **Linear Regression** models optimized for short-term price direction.
*   **Evaluation:** Validated models using metrics like MSE (Mean Squared Error) and R² Score.
*   **Artifacts:** Serialized trained models using `pickle` for efficient inference in the backend.

### **Milestone 3: Full-Stack Application & Deployment**
The final phase transformed the models into a user-friendly product.

#### **Backend (FastAPI)**
*   Built a high-performance REST API using **FastAPI**.
*   Endpoints for real-time inference, model metadata, and health checks.
*   **Self-Contained Deployment:** Restructured to run independently on **Render**.

#### **Frontend (React + Vite)**
*   **Modern UI/UX:** Developed a responsive dashboard using **React**, **TypeScript**, and **Tailwind CSS**.
*   **Interactive Charts:** Implemented dynamic price charts with **Recharts**, supporting zooming and tooltips.
*   **Features:**
    *   **Custom Date Ranges:** Users can analyze custom timeframes.
    *   **Technical Indicators:** Visualizations for SMA, EMA, RSI, MACD with educational tooltips.
    *   **Aesthetics:** Parallax background effects, glassmorphism design, and crypto-themed assets.
    *   **Currency Support:** Auto-conversion to INR for localized context.
*   **Deployment:** Optimized production build deployed on **Vercel**.

---

## 🛠️ Tech Stack
*   **Languages:** Python, TypeScript, SQL
*   **Frontend:** React, Vite, Tailwind CSS, Shadcn UI, Framer Motion
*   **Backend:** FastAPI, Scikit-learn, Pandas, NumPy
*   **Deployment:** Render (Backend), Vercel (Frontend), Supabase (Auth/Database)

---

## 💻 Local Development

1.  **Clone the repository**
2.  **Backend:**
    ```bash
    cd "Milestone 3/backend"
    pip install -r requirements.txt
    uvicorn main:app --reload
    ```
3.  **Frontend:**
    ```bash
    cd "Milestone 3/frontend"
    npm install
    npm run dev
    ```

---
*Developed by [Suhas Ramesha](https://www.linkedin.com/in/suhas-ramesha/)*
