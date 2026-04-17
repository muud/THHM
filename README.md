# TrueHealth Hospital Management System (THHM)

## Setup (no Docker required)

1. Clone the repo  
   `git clone https://github.com/your-username/THHM.git`

2. Create virtual environment  
   `python -m venv venv`  
   `source venv/bin/activate` (Mac/Linux) or `venv\Scripts\activate` (Windows)

3. Install dependencies  
   `pip install -r requirements.txt`

4. Run migrations  
   `python manage.py migrate`

5. Start server  
   `python manage.py runserver`
