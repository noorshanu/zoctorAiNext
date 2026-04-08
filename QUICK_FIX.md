# Quick Fix: Network Error (ERR_CONNECTION_REFUSED)

## The Problem
Your frontend is trying to connect to `http://localhost:8000` but the backend server is not running.

## The Solution

### Step 1: Start the Backend Server

Open a **new terminal window** and run:

```bash
cd "/Users/noorcode/Downloads/ZoctorAI-main 2/zoctor_ai"
source ../venv/bin/activate
python manage.py runserver 0.0.0.0:8000
```

You should see output like:
```
Starting development server at http://0.0.0.0:8000/
Quit the server with CONTROL-C.
```

### Step 2: Verify Server is Running

In another terminal, test the connection:
```bash
curl http://localhost:8000
```

You should get a response (even if it's a 404 page, that means the server is up).

### Step 3: Try Signup Again

Go back to your frontend and try the signup form again. It should now work!

---

## Alternative: Use the Startup Script

I've created a startup script for you:

```bash
cd "/Users/noorcode/Downloads/ZoctorAI-main 2"
./start_backend.sh
```

---

## If Port 8000 is Already in Use

If you get an error that port 8000 is in use:

1. **Find what's using it:**
   ```bash
   lsof -ti:8000
   ```

2. **Kill the process:**
   ```bash
   kill -9 $(lsof -ti:8000)
   ```

3. **Or use a different port:**
   ```bash
   python manage.py runserver 0.0.0.0:8001
   ```
   
   Then update your frontend `.env` file:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8001
   ```

---

## Keep the Server Running

**Important:** Keep the terminal with the Django server running while you test the frontend. The server needs to stay active to handle API requests.

To stop the server, press `Ctrl+C` in the terminal where it's running.

---

## Still Having Issues?

1. Check that the virtual environment is activated (you should see `(venv)` in your terminal prompt)
2. Verify all dependencies are installed: `pip install -r zoctor_ai/requirements.txt`
3. Check for any error messages in the Django server terminal
4. Make sure no firewall is blocking port 8000

