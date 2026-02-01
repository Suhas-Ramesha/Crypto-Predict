# Fly.io Quick Start Guide

## Prerequisites

1. Create account at [fly.io](https://fly.io)
2. Install Fly CLI:
   ```bash
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   
   # Mac/Linux
   curl -L https://fly.io/install.sh | sh
   ```

## Deployment Steps

### 1. Login to Fly.io
```bash
fly auth login
```

### 2. Navigate to Backend Directory
```bash
cd Milestone 3/backend
```

### 3. Launch Your App
```bash
fly launch
```

This will:
- Ask for app name (or use existing `fly.toml` config)
- Ask for region (choose closest to you)
- Deploy your app

**Note**: If `fly.toml` already exists, it will use those settings.

### 4. Deploy
```bash
fly deploy
```

### 5. Get Your URL
After deployment, you'll get a URL like:
```
https://crypto-predict-api.fly.dev
```

### 6. Update Frontend

Update `Milestone 3/frontend/.env`:
```env
VITE_API_URL="https://your-app-name.fly.dev"
```

### 7. Update CORS

Add your Fly.io URL to `Milestone 3/backend/main.py`:
```python
cors_origins = [
    # ... existing origins ...
    "https://your-app-name.fly.dev",  # Add this
]
```

Then redeploy:
```bash
cd Milestone 3/backend
fly deploy
```

## Useful Commands

### View Logs
```bash
fly logs
```

### Check Status
```bash
fly status
```

### View Metrics
```bash
fly metrics
```

### SSH into Machine
```bash
fly ssh console
```

### Open App in Browser
```bash
fly open
```

## Testing

1. Health check: `https://your-app-name.fly.dev/api/health`
2. API docs: `https://your-app-name.fly.dev/docs`
3. Test from frontend

## Troubleshooting

### Build Fails
- Check `Dockerfile` is correct
- Verify `requirements.txt` exists
- Check logs: `fly logs`

### App Won't Start
- Check logs: `fly logs`
- Verify port is 8000 in `fly.toml`
- Check health endpoint works

### CORS Errors
- Add Fly.io domain to CORS in `main.py`
- Add frontend domain to CORS
- Redeploy after changes

## Free Tier Limits

- ✅ 3 VMs (256MB RAM each)
- ✅ 160GB outbound data/month
- ✅ 3GB persistent storage

**You'll stay well within these limits!**
