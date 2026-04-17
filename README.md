# 🏥 THHM (TrueHealth Hospital Management)

> **Modern. Secure. Unified.** A role-based clinical workflow system designed for the next generation of digital healthcare.

![THHM Logo](file:///Users/ayrotv/TRUEHEALTHHM/truehealth_hms/static/frontend/welcome_hero.png)

## 🌟 Overview

THHM is a comprehensive hospital management platform that bridges the gap between patient experience and clinical efficiency. Built with a **Unified Mono-architecture**, it combines a high-performance Django REST backend with a reactive, modern Vite/React frontend to provide a seamless, real-time healthcare journey.

### 🎭 Role-Based Clinical Workflow
The system strictly enforces a standard medical flow:
- **Receptionist**: Patient arrivals, check-ins, and facility-wide billing.
- **Nurse**: Real-time vitals recording and symptom tracking.
- **Doctor**: AI-assisted consultations, automated lab requests, and digital prescriptions.
- **Lab Technician**: Technical result entry and automatic clinician notification.
- **Patient**: Personal health dashboard, appointment history, and billing records.

## 🚀 Key Features

- **🛡️ Secure By Design**: Implementation of granular Role-Based Access Control (RBAC) and immutable system developer accounts.
- **⚡ High-Performance Architecture**: Unified build pipeline using Vite/React served natively by Django for maximum speed.
- **📊 Real-Time Queue Management**: Dynamic staff dashboards that update as patients move through the facility.
- **💸 Automated Billing**: Integrated consultation and lab fee generation triggered by clinical actions.
- **🤖 AI-Ready**: Built-in hooks for MedGemma clinical decision support and radiology analysis.

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [Vite 8](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Backend**: [Django 4.2](https://www.djangoproject.com/), [Django REST Framework](https://www.django-rest-framework.org/)
- **Database**: PostgreSQL (Supabase ready), SQLite (Local)
- **Deployment**: [Render](https://render.com/), [Supabase](https://supabase.com/), [WhiteNoise](https://whitenoise.readthedocs.io/)

## 🏁 Quick Start

### 1. Clone & Setup
```bash
git clone https://github.com/muud/THHM.git
cd THHM
```

### 2. Backend Installation
```bash
cd truehealth_hms
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 3. Frontend Development
```bash
cd frontend
npm install
npm run dev
```

## 📜 License
This project is proprietary. All rights reserved.

---
*Built with ❤️ for TrueHealth by the Advanced Agentic Coding Team.*
