# Troubleshooting Guide

## Network Error: ERR_CONNECTION_REFUSED

### Problem
Frontend cannot connect to backend at `http://localhost:8000`

### Solution

#### 1. Start the Backend Server

**Option A: Using the startup script**
```bash
cd "/Users/noorcode/Downloads/ZoctorAI-main 2"
./start_backend.sh
```

**Option B: Manual start**
```bash
cd "/Users/noorcode/Downloads/ZoctorAI-main 2/zoctor_ai"
source ../venv/bin/activate
python manage.py runserver 0.0.0.0:8000
```

#### 2. Verify Server is Running

Open a new terminal and test:
```bash
curl http://localhost:8000
```

You should see a Django response (likely a 404 page, which is normal).

#### 3. Check Frontend Configuration

The frontend is configured to use:
- **Local:** `http://localhost:8000` (when running on localhost)
- **Production:** `https://zaidi123.pythonanywhere.com`

Make sure:
1. Backend is running on port 8000
2. No firewall blocking port 8000
3. No other service using port 8000

#### 4. CORS Configuration

The backend has CORS enabled for all origins. If you still see CORS errors:
- Check browser console for specific CORS error messages
- Verify `CORS_ALLOW_ALL_ORIGINS = True` in `settings.py`

#### 5. Environment Variables

Make sure you have a `.env` file in the backend root if needed:
```bash
cd "/Users/noorcode/Downloads/ZoctorAI-main 2/zoctor_ai"
# Create .env file if needed
```

---

## Common Issues

### Port Already in Use

If port 8000 is already in use:
```bash
# Find process using port 8000
lsof -ti:8000

# Kill it (replace PID with actual process ID)
kill -9 <PID>

# Or use a different port
python manage.py runserver 0.0.0.0:8001
# Then update frontend API_BASE_URL to use port 8001
```

### Virtual Environment Not Activated

Make sure you activate the virtual environment:
```bash
source venv/bin/activate
```

### Database Migrations Not Run

If you see database errors:
```bash
cd "/Users/noorcode/Downloads/ZoctorAI-main 2/zoctor_ai"
source ../venv/bin/activate
python manage.py migrate
```

### Missing Dependencies

If you see import errors:
```bash
cd "/Users/noorcode/Downloads/ZoctorAI-main 2"
source venv/bin/activate
pip install -r zoctor_ai/requirements.txt
```

---

## Quick Health Check

Run this to verify everything is working:

```bash
# 1. Check if server is running
curl http://localhost:8000/api/users/auth/signup -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","confirm_password":"test123"}'

# Should return a response (even if 400 for invalid data, that means server is up)
```

---

## Next Steps

1. ✅ Start backend server using the script above
2. ✅ Verify it's accessible at http://localhost:8000
3. ✅ Try the signup form again
4. ✅ Check browser console for any new errors

