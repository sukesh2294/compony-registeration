# Company Registration App - Vercel Deployment Guide

## Overview
Full-stack company registration application with React frontend and Node.js/Express backend.

## Project Structure
```
company-registration-app/
├── backend/              # Express.js API server
│   ├── src/
│   │   ├── controllers/  # Route handlers
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Auth & validation
│   │   ├── config/       # Database config
│   │   └── utils/        # Helpers
│   ├── package.json
│   ├── server.js
│   └── .env.example
├── frontend/             # React + Vite app
│   ├── src/
│   │   ├── pages/        # Page components
│   │   ├── components/   # Reusable components
│   │   ├── services/     # API calls
│   │   ├── store/        # Redux state
│   │   └── utils/        # Helpers
│   ├── package.json
│   └── .env.example
├── database/
│   └── schema.sql        # PostgreSQL schema
└── vercel.json           # Vercel deployment config
```

## Prerequisites
- Node.js 18+
- PostgreSQL database
- Cloudinary account (optional, for image uploads)
- GitHub account
- Vercel account

## Local Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev  # Runs on http://localhost:5001
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
# VITE_API_URL=http://localhost:5001/api
npm run dev  # Runs on http://localhost:5173
```

## Database Setup

### Create PostgreSQL Database
```sql
-- As superuser (postgres)
CREATE DATABASE company_registration;
CREATE USER company_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE company_registration TO company_user;

-- Connect to company_registration database
\c company_registration

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO company_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO company_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO company_user;

-- Run schema
\i database/schema.sql
```

### Environment Variables Needed
```
DB_HOST=your_postgres_host
DB_PORT=5432
DB_NAME=company_registration
DB_USER=company_user
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
```

## Deployment to Vercel

### Step 1: Prepare GitHub Repository
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### Step 2: Create Vercel Project
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository: `abhinandanjain001/compony-registeration-website`
4. Vercel will auto-detect monorepo structure

### Step 3: Configure Environment Variables
In Vercel Dashboard → Settings → Environment Variables:

**Backend Variables:**
```
DB_HOST=your_postgresql_host
DB_PORT=5432
DB_NAME=company_registration
DB_USER=company_user
DB_PASSWORD=your_secure_password
JWT_SECRET=your_random_secret_key_min_32_chars
JWT_EXPIRE=7d
NODE_ENV=production
CLOUDINARY_NAME=your_cloudinary_name (optional)
CLOUDINARY_API_KEY=your_key (optional)
CLOUDINARY_API_SECRET=your_secret (optional)
```

**Frontend Variables:**
```
VITE_API_URL=https://your-domain.vercel.app/api
```

### Step 4: Database Configuration
Use a managed PostgreSQL service:
- **Recommended:** Railway.app, Heroku Postgres, or AWS RDS
- Connection string: `postgres://user:password@host:port/database`

### Step 5: Deploy
1. Click "Deploy" in Vercel Dashboard
2. Wait for build to complete
3. Your app is live at `https://your-domain.vercel.app`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-mobile` - Verify phone
- `GET /api/auth/verify-email/:token` - Verify email

### Company
- `POST /api/company/register` - Create company profile
- `GET /api/company/profile` - Get company profile
- `PUT /api/company/profile` - Update company profile
- `POST /api/company/upload-logo` - Upload company logo
- `POST /api/company/upload-banner` - Upload company banner

## Features
✅ User Registration & Authentication (JWT)
✅ Multi-step Company Registration Form
✅ Form Validation (Yup)
✅ Image Upload (Cloudinary)
✅ Redux State Management
✅ Dashboard with Charts (Recharts)
✅ Real-time Data Integration
✅ Dark Mode Support
✅ Responsive UI (Tailwind CSS, MUI)

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running and accessible
- Check connection string in .env
- Ensure `company_user` has proper permissions

### Image Upload Fails
- Configure Cloudinary credentials in .env
- Verify API keys are correct

### Frontend API Calls Fail
- Check VITE_API_URL environment variable
- Verify backend is running on correct port
- Check CORS configuration in backend

### Build Fails on Vercel
- Clear cache: Vercel Dashboard → Settings → Reset
- Check Node.js version (18+ required)
- Verify all environment variables are set

## Production Checklist
- [ ] Database backed up and tested
- [ ] Environment variables set in Vercel
- [ ] JWT_SECRET is strong and unique
- [ ] Cloudinary configured (if using image uploads)
- [ ] CORS origins properly configured
- [ ] Rate limiting enabled
- [ ] Security headers set (Helmet)
- [ ] Error logging configured
- [ ] Database replicas/backup enabled

## Support & Documentation
- [Express.js Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [Vercel Docs](https://vercel.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

## License
MIT

## Author
Abhinandan Jain (abhinandanjain001)
