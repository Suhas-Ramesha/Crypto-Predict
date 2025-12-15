# Deployment Guide

This guide describes how to deploy the **Crypto Price Forecasting Platform** using **Vercel** for the frontend and **Render** for the backend.

## Project Structure
The project is split into two main directories:
- `frontend/`: React + Vite application.
- `backend/`: FastAPI application.

---

## 1. Backend Deployment (Render)

We will deploy the `backend` folder as a Python Web Service.

### Prerequisites
- Create a [Render account](https://render.com/).
- Push your code to GitHub.

### Steps
1.  **New Web Service**:
    - Go to Render Dashboard -> New -> Web Service.
    - Connect your GitHub repository.

2.  **Configuration**:
    - **Name**: `crypto-forecast-api` (or similar).
    - **Root Directory**: `Milestone 3/backend` (This is critical).
    - **Environment**: Python 3.
    - **Build Command**: `pip install -r requirements.txt`.
    - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port 10000`.

3.  **Deploy**:
    - Click "Create Web Service".
    - Wait for the build to finish.
    - **Copy the Service URL** (e.g., `https://crypto-forecast-api.onrender.com`). You will need this for the frontend.

---

## 2. Frontend Deployment (Vercel)

We will deploy the `frontend` folder.

### Prerequisites
- Create a [Vercel account](https://vercel.com/).
- Install Vercel CLI (optional) or use the Dashboard.

### Steps (Dashboard Method)
1.  **New Project**:
    - Go to Vercel Dashboard -> Add New -> Project.
    - Import your GitHub repository.

2.  **Configuration**:
    - **Framework Preset**: Vite.
    - **Root Directory**: Click "Edit" and select `Milestone 3/frontend`.
    - **Environment Variables**:
        - Key: `VITE_API_URL`
        - Value: `<YOUR_RENDER_BACKEND_URL>` (e.g., `https://crypto-forecast-api.onrender.com`) - **No trailing slash**.

3.  **Deploy**:
    - Click "Deploy".
    - Vercel will build and deploy your site.

---

## 3. Local Development (Restructured)

If you want to run the app locally after moving files:

### Backend
```bash
cd "Milestone 3/backend"
# Activate virtual env if you have one
uvicorn main:app --reload
```

### Frontend
```bash
cd "Milestone 3/frontend"
npm install # if not already installed
npm run dev
```
