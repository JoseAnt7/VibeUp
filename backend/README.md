Flask backend for authentication

Setup (Windows):

1. Create a virtual environment and activate it:

```
python -m venv venv
venv\Scripts\Activate.ps1  # PowerShell
venv\Scripts\activate.bat   # cmd
```

2. Install dependencies:

```
pip install -r requirements.txt
```

3. (Optional) Set environment variables in `.env` or system env:

```
JWT_SECRET_KEY=super-secret
DATABASE_URL=mysql+pymysql://user:pass@host/dbname
```

4. Run the app:

```
python app.py
```

The API will run on port 5000 by default.
