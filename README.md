# SV Trading Employee Attendance System

This is a full-stack web application designed for tracking employee attendance. It features a React frontend and a Django REST Framework backend with integrated live webcam capture functionality and advanced Excel reporting.

## Key Features
- **Public Employee Portal:** Live snapshot of employee status (Present, Absent, Leave).
- **Webcam Check-In/Out:** Employees securely clock in by taking a live webcam photo.
- **Admin Dashboard:** Access detailed metrics, manage leave requests, and resolve shift mismatches.
- **Advanced Exporting:** Export custom-range Calendar Matrix reports directly to Excel.

## Local Development Setup

### 1. Backend (Django)
Navigate to the `backend` folder and run the server:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py runserver 8000
```
> **Note**: Locally, the app uses SQLite and local file storage. 

### 2. Frontend (React)
Navigate to the `frontend` folder and start the Vite dev server:
```bash
cd frontend
npm install
npm run dev
```

---

## Production Deployment Guide (Free Tier)

This repository is completely automated and ready to deploy to the Cloud for free with **Render**, **Vercel**, and **Cloudinary**. When deployed, Django automatically switches to a production-ready PostgreSQL database and Cloudinary storage.

### 1. Cloudinary Setup (For Media Storage)
Since cloud hosts like Render clear their disk space after every restart, employee webcam photos must be saved on a true cloud bucket.
- Create a free account on [Cloudinary](https://cloudinary.com/).
- In your Dashboard, copy the **Cloud Name**, **API Key**, and **API Secret**.

### 2. Deploy Backend (Render.com)
1. Go to [Render](https://render.com/) and create a free **PostgreSQL** database. Copy the "Internal Database URL".
2. Create a new **Web Service** and connect this entire GitHub repository.
3. Configure the Web Service:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt && python manage.py migrate`
   - **Start Command**: `gunicorn core.wsgi:application`
4. Expand **Advanced Settings** and enter these Environment Variables:
   - `DATABASE_URL`: *(Your Render PostgreSQL Internal URL)*
   - `CLOUDINARY_CLOUD_NAME`: *(Your Cloudinary Name)*
   - `CLOUDINARY_API_KEY`: *(Your Cloudinary Key)*
   - `CLOUDINARY_API_SECRET`: *(Your Cloudinary Secret)*
5. Click **Deploy**. Once successfully deployed, copy your Render server URL (e.g. `https://my-backend.onrender.com`).

### 3. Deploy Frontend (Vercel)
1. Go to [Vercel](https://vercel.com/) and import this GitHub repository.
2. Change the **Root Directory** to `frontend`.
3. In the **Environment Variables** section, add your Render API URL so React knows how to connect to the cloud server:
   - Key: `VITE_API_URL` 
   - Value: `https://YOUR_BACKEND_URL.onrender.com/api`
4. Click **Deploy**!

Your attendance system is now live, secure, and ready to use anywhere in the world!