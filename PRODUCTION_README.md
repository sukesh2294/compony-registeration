# Production Deployment Guide

## 🚨 CRITICAL: Fix Database Migration Issue

**Current Issue:** Database tables are missing in production (`relation "accounts_customuser" does not exist`)

**Solution:** Run migrations during build/deploy process

---

## 📋 Backend Deployment (Render)

### Step 1: Configure Render Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your backend service
3. Go to **Settings** → **Build & Deploy**

### Step 2: Update Build Command

Set build command to:
```bash
bash build.sh
```

Or manually set:
```bash
pip install -r requirements.txt && python manage.py collectstatic --no-input && python manage.py migrate --no-input
```

### Step 3: Update Start Command

Set start command to:
```bash
gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT --timeout 120 --workers 2
```

### Step 4: Environment Variables (CRITICAL)

Ensure these are set in Render Dashboard → Environment:

**Required:**
```
DJANGO_SECRET_KEY=<your-secret-key-min-32-chars>
DEBUG=False
DB_NAME=compony_registeration_db
DB_USER=compony_registeration_db_user
DB_PASSWORD=<your-database-password>
DB_HOST=<your-database-host>
DB_PORT=5432
ALLOWED_HOSTS=compony-registeration-backend.onrender.com,compony-registeration-frontend.vercel.app
CORS_ALLOWED_ORIGINS=https://compony-registeration-frontend.vercel.app,http://localhost:5173
```

**Optional:**
```
CLOUDINARY_CLOUD_NAME=<your-cloudinary-name>
CLOUDINARY_API_KEY=<your-key>
CLOUDINARY_API_SECRET=<your-secret>
FIREBASE_API_KEY=<your-firebase-key>
FIREBASE_AUTH_DOMAIN=<your-firebase-domain>
```

### Step 5: Deploy

1. Click **Manual Deploy** → **Deploy latest commit**
2. Monitor build logs
3. Verify migrations ran: Look for `Running migrations...` in build logs
4. Check logs: Should see tables created

---

## 📋 Frontend Deployment (Vercel)

### Environment Variables

**Required:**
```
VITE_API_URL_PROD=https://compony-registeration-backend.onrender.com
```

**Note:** No trailing slash! Paths already include `/api`

---

## ✅ Verification Checklist

### Backend Verification:
- [ ] Build command includes `python manage.py migrate`
- [ ] Start command uses gunicorn
- [ ] All environment variables set
- [ ] DEBUG=False in production
- [ ] Build logs show migrations ran
- [ ] API responds (not 500 errors)
- [ ] Database tables exist (check via admin or logs)

### Frontend Verification:
- [ ] VITE_API_URL_PROD set correctly
- [ ] No localhost URLs in production build
- [ ] Login/Register working
- [ ] Network requests go to backend URL

### Database Verification:
```sql
-- Connect to your database and run:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Should see:
-- accounts_customuser
-- companies_companyprofile
-- django_migrations
-- auth_group
-- etc.
```

---

## 🔧 Troubleshooting

### Issue: `relation "accounts_customuser" does not exist`

**Cause:** Migrations not run in production

**Fix:**
1. Ensure `build.sh` includes `python manage.py migrate`
2. Re-deploy backend service
3. Check build logs for migration output
4. Manually run migrations via Render shell if needed:
   ```bash
   python manage.py migrate
   ```

### Issue: 500 Internal Server Error

**Possible Causes:**
1. Missing environment variables
2. Database connection failed
3. Migrations not run
4. Missing dependencies

**Debug Steps:**
1. Check Render logs for exact error
2. Verify all environment variables set
3. Test database connection
4. Check build logs for errors

### Issue: CORS Errors

**Fix:**
- Add frontend URL to `CORS_ALLOWED_ORIGINS` in backend settings
- Ensure `CORS_ALLOW_CREDENTIALS = True`

### Issue: Frontend can't connect to backend

**Fix:**
- Verify `VITE_API_URL_PROD` is set
- Check backend URL is accessible
- Verify CORS settings
- Check browser console for exact error

---

## 📊 Production Checklist

### Security:
- [ ] DEBUG=False
- [ ] SECRET_KEY is strong and unique
- [ ] Database password is secure
- [ ] SSL/HTTPS enabled (Render handles this)
- [ ] CORS properly configured
- [ ] No hardcoded credentials in code

### Performance:
- [ ] Static files collected
- [ ] Gunicorn workers configured (2-4 workers)
- [ ] Database connection pooling
- [ ] CDN for static files (optional)

### Monitoring:
- [ ] Error logging enabled
- [ ] Health check endpoint
- [ ] Database backups enabled
- [ ] Application monitoring (optional)

---

## 🚀 Quick Deploy Commands

### Backend (Manual):
```bash
# In Render Dashboard → Shell
python manage.py migrate
python manage.py collectstatic --no-input
```

### Test API:
```bash
curl https://compony-registeration-backend.onrender.com/
# Should return: "Backend is running!"
```

---

## 📞 Support

If issues persist:
1. Check Render build/deploy logs
2. Check Render runtime logs
3. Verify all environment variables
4. Test database connection
5. Review Django error logs

---

**Last Updated:** January 2026
