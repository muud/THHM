# Deployment Guide: THHM (TrueHealth Hospital Management)

This guide provides step-by-step instructions for deploying the unified THHM system (Django + React) to a production environment.

## 1. Prerequisites
- A **PostgreSQL** database (e.g., from Render, Supabase, or AWS RDS).
- A domain name or a provider-assigned URL.
- Gemini API Key (for AI features).

## 2. Recommended Database: Supabase
Supabase provides a powerful, managed PostgreSQL instance that is ideal for THHM.

### Step 1: Create a Supabase Project
1. Go to [Supabase](https://supabase.com) and create a new project.
2. Go to **Project Settings** -> **Database**.
3. Under **Connection String**, select **URI**.
4. Copy the connection string (it looks like `postgresql://postgres:[YOUR-PASSWORD]@db.[REF].supabase.co:5432/postgres`).

## 3. Recommended App Host: Render
Render is chosen for its simplicity in handling "Unified" builds.

### Step 1: Create a Web Service
- Connect your GitHub repository.
- **Runtime**: Python.
- **Build Command**:
  ```bash
  # 1. Build Frontend
  cd frontend && npm install && npm run build
  # 2. Build Backend
  cd ../truehealth_hms
  pip install -r requirements.txt
  python manage.py collectstatic --noinput
  python manage.py migrate
  ```
- **Start Command**:
  ```bash
  cd truehealth_hms && gunicorn config.wsgi
  ```

### Step 2: Environment Variables
Add the following in the Render "Environment" tab:
| Variable | Value |
| :--- | :--- |
| `SECRET_KEY` | (Generate a long random string) |
| `DEBUG` | `False` |
| `DATABASE_URL` | (Your **Supabase Connection URI** from step 2) |
| `ALLOWED_HOSTS` | `your-app-name.onrender.com,yourdomain.com` |
| `CORS_ALLOWED_ORIGINS` | `https://your-app-name.onrender.com` |
| `CSRF_TRUSTED_ORIGINS` | `https://your-app-name.onrender.com` |
| `GEMINI_API_KEY` | (Your Google AI API Key) |
| `DJANGO_SUPERUSER_USERNAME` | Master Username for Django Admin |
| `DJANGO_SUPERUSER_PASSWORD` | Master Password for Django Admin |
| `SERVER_ADMIN_USERNAME` | Master Username for Server Access |
| `SERVER_ADMIN_PASSWORD` | Master Password for Server Access |

## 4. Master Credentials
The system is configured to use environment variables for master administrative access. 

### Django Superuser
To create or update the master admin account, run:
```bash
python create_master_user.py
```
This script will use the `DJANGO_SUPERUSER_*` variables from your `.env` or environment to initialize the account.

### Server Access
Use the `SERVER_ADMIN_*` credentials for SSH, SFTP, or database-level administration if applicable to your hosting environment.


## 3. Database Migration Logic
This application uses `dj-database-url`. Simply providing the `DATABASE_URL` environment variable will automatically switch the app from SQLite to PostgreSQL.

## 4. Serving Static Files
The app is configured with **WhiteNoise**. This allows Django to serve the React frontend directly without needing a separate Nginx/Apache instance.

> [!TIP]
> **HTTPS**: Render provides automatic SSL certificates. The app is configured (`SECURE_SSL_REDIRECT`) to force all traffic to HTTPS in production for security.

## 5. Maintenance
To update the app, simply push to the `main` branch. Render will automatically re-run the build command (Vite build + Django collectstatic) and deploy the new version.
