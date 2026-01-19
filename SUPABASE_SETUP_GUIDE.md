# Supabase Setup Guide

After creating a new Supabase project, you need to update the following files with your new project credentials.

## Step 1: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your new project
3. Go to **Settings** → **API**
4. Copy the following:
   - **Project URL** (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (the `anon` key under "Project API keys")
   - **Project Reference ID** (found in the URL or project settings)

## Step 2: Update Environment Files

### File 1: `.env` (Root directory)
Update these three values:
```env
VITE_SUPABASE_PROJECT_ID="your-new-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-new-anon-key"
VITE_SUPABASE_URL="https://your-new-project-id.supabase.co"
```

### File 2: `Milestone 3/frontend/.env`
Update the same three values:
```env
VITE_SUPABASE_PROJECT_ID="your-new-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-new-anon-key"
VITE_SUPABASE_URL="https://your-new-project-id.supabase.co"
VITE_API_URL="http://localhost:8000"
# VITE_API_URL="https://crypto-predict-25lf.onrender.com"
```

## Step 3: Update Supabase Config Files

### File 3: `supabase/config.toml`
Update the project_id:
```toml
project_id = "your-new-project-id"
```

### File 4: `Milestone 3/frontend/supabase/config.toml`
Update the project_id:
```toml
project_id = "your-new-project-id"
```

## Step 4: Run Database Migrations

After updating the config files, you need to run the database migrations in your new Supabase project:

### Option A: Using Supabase CLI (Recommended)
```bash
# If you have Supabase CLI installed
supabase db push
```

### Option B: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the migration files in order:
   - First: `supabase/migrations/20251212075610_a4edcfe0-a9a0-40ae-908b-1c3054b2c5c3.sql`
   - Second: `supabase/migrations/20251212075803_2b501573-46b7-46ec-b676-e2b4afce3e65.sql`

### Option C: Manual SQL Execution
Copy and paste the contents of both migration files into the SQL Editor and execute them.

## Step 5: Verify Setup

1. Restart your development server
2. Check the browser console - you should no longer see `ERR_NAME_NOT_RESOLVED` errors
3. Try signing up/logging in to verify authentication works

## Important Notes

- The **Project ID** is the part of the URL between `https://` and `.supabase.co`
- The **anon key** is safe to use in frontend code (it's public)
- Never commit your `.env` files to version control
- Make sure Row Level Security (RLS) is enabled on your tables (the migrations handle this)

## Troubleshooting

If you still see errors:
1. Clear your browser cache and localStorage
2. Restart your dev server
3. Verify all environment variables are set correctly
4. Check that migrations ran successfully in Supabase dashboard
