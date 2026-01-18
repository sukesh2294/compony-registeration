# Company Registration & Management Platform

A full-stack web application for secure company registration, management and dashboard analytics with comprehensive settings page.

**Documentation:** See [ARCHITECTURE_DIAGRAM](./ARCHITECTURE_DIAGRAM.md) for complete technical analysis  
**🚀Quick Start:** - [**Live Demo:**](https://compony-registeration-frontend.vercel.app) &nbsp;&nbsp;&nbsp;  [**Demo Video:🎥**](https://drive.google.com/file/d/1jq_LOo2RH_b-4tvCgBXOWd67UsR3rreu/view)

## ✨ Key Features

### 🔐 Authentication & Security
- JWT-based user authentication with token refresh
- Secure password hashing (Django's `set_password()`)
- Email and phone number verification
- Role-based access control
- CORS protection

### 📝 Company Management
- Multi-step company registration form
- Complete company profile management
- Logo and banner image uploads (Cloudinary integration)
- Social media links management (JSON storage)
- Company information (name, description, industry, founding date)
- Address and location management

### 📊 Dashboard
- Real-time analytics with metrics
- Interactive charts (Recharts)
- Company activity tracking
- Inquiry management
- Responsive grid layout

### ⚙️ Settings Page (Full-Featured)
- **Company Info Tab** - Edit company name, description
- **Founding Info Tab** - Edit industry, team size, founding date, website, vision
- **Social Media Tab** - Manage multiple social media links
- **Account Settings Tab** - Update email, phone, password management
- Image upload with preview (logo & banner)
- Real-time form validation
- Error/success notifications with auto-dismiss
- Dark mode support throughout

### 🎨 User Interface
- Modern React 18 with Vite
- Tailwind CSS + Material-UI components
- Lucide React icons
- Dark/light mode toggle
- Fully responsive (mobile-first design)
- Smooth animations and transitions

### 🌐 API Integration
- RESTful API with Django REST Framework
- Axios with JWT interceptors
- Automatic token refresh
- Comprehensive error handling
- Request/response logging

## 🛠 Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool (lightning fast)
- **Redux Toolkit** - State management
- **Tailwind CSS** - Utility-first CSS
- **Material-UI** - Component library
- **Lucide React** - Icon library
- **Axios** - HTTP client with interceptors
- **React Router** - Client-side routing
- **Recharts** - Data visualization

### Backend
- **Django 4.x** - Web framework
- **Django REST Framework** - REST API
- **PostgreSQL** - Database (SQLite for dev)
- **django-cors-headers** - CORS support
- **djangorestframework-simplejwt** - JWT authentication
- **Cloudinary** - Image storage and transformation
- **Firebase** - storing password & Email

### Infrastructure
- **Vercel** - Frontend hosting 
- **Render** - Backend & Database hosting
- **Cloudinary** - Image CDN
- **Firebase** - to store email & password hashing 

## 📁 Project Structure

```
company-registration/
├── frontend/                   
│   ├── public/                 
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/          
│   │   │   ├── company/       
│   │   │   └── common/         
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── CompanyRegistrationPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   └── SettingsPage.jsx  
│   │   ├── services/
│   │   │   ├── api.js          
│   │   │   ├── authService.js  
│   │   │   └── companyService.js 
│   │   ├── store/
│   │   │   ├── authSlice.js    
│   │   │   ├── store.js        
│   │   │   └── slices/
│   │   │       └── companySlice.js 
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   └── validations.js
│   │   └── App.jsx             
│   ├── .env.example
│   ├── vite.config.js
│   └── package.json
│
<<<<<<< HEAD
├── backend/                    # Django application
│   ├── accounts/               # User authentication
│   │   ├── models.py          # CustomUser model                    
│   │   ├── views.py
│   │   ├── serializers.py
│   │   └── migrations/
│   ├── companies/              
│   │   ├── models.py         
│   │   ├── views.py
│   │   ├── serializers.py
│   │   └── migrations/
│   ├── api/                   
│   │   ├── views.py          
│   │   ├── urls.py           
│   │   ├── serializers.py
│   │   └── services/
│   │       ├── cloudinary_service.py
│   │       └── firebase_service.py             
│   ├── backened/              
│   │   ├── settings.py     # Django settings
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   └── wsgi.py
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example
│   └── env/                  
│
├── ARCHITECTURE_DIAGRAM.md                 
├── DEPLOYMENT.md                   
├── vercel.json                    
└── README.md                      
```

## 🚀 Quick Start

### Backend Setup (Django)

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv env

# Activate virtual environment
# Windows:
env\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Configure database in .env:
# DATABASE_URL=postgresql://user:password@localhost:5432/company_reg

# Run migrations
python manage.py migrate

# Create superuser (optional, for admin panel)
python manage.py createsuperuser

# Start development server
python manage.py runserver

# Backend runs at http://127.0.0.1:8000
```

### Frontend Setup (React)

```bash
# In a new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure API URL in .env:
# VITE_API_URL=http://127.0.0.1:8000/api

# Start development server
npm run dev

# Frontend runs at http://localhost:5173
```

### Access the Application

```
Frontend:    http://localhost:5173
Backend API: http://127.0.0.1:8000/api/
Admin Panel: http://127.0.0.1:8000/admin/
```

## 📝 API Endpoints

### Authentication Endpoints
```
POST   /api/auth/register/             - Register new user
POST   /api/auth/login/                - User login
PATCH  /api/auth/profile/              - Update user email/phone ⭐ NEW
POST   /api/auth/change-password/      - Change password ⭐ NEW
POST   /api/auth/delete-account/       - Delete account ⭐ NEW
POST   /api/token/refresh/             - Refresh JWT token
```

### Company Endpoints
```
POST   /api/company/register/          - Create company profile
GET    /api/company/profile/           - Get user's company profile
PUT    /api/company/profile/           - Update company profile (full)
PATCH  /api/company/profile/           - Update company profile (partial) ⭐ NEW
POST   /api/company/upload-logo/       - Upload company logo
POST   /api/company/upload-banner/     - Upload company banner
```

## 🗄️ Database Models

### CustomUser Model
```python
- email (unique, required)
- password (hashed)
- full_name
- mobile_no (unique)
- gender
- firebase_uid (optional)
- is_email_verified
- is_mobile_verified
- created_at, updated_at
```

### CompanyProfile Model
```python
- owner (ForeignKey to CustomUser)
- company_name
- description
- organization_type
- industry
- team_size
- founded_date
- website
- social_links (JSONField - stores array of social media)
- logo_url (from Cloudinary)
- banner_url (from Cloudinary)
- address fields (address, city, state, country, postal_code)
- created_at, updated_at
```

## 🔐 Authentication Flow

```
User Login
    ↓
Credentials sent to POST /api/auth/login/
    ↓
Backend validates & returns JWT tokens:
    - access_token (short-lived, ~5 min)
    - refresh_token (long-lived, ~7 days)
    ↓
Frontend stores tokens in localStorage:
    - localStorage.setItem('access_token', token)
    - localStorage.setItem('refresh_token', token)
    ↓
All subsequent requests include Authorization header:
    Authorization: Bearer <access_token>
    ↓
Backend verifies token & sets request.user
    ↓
Token expires? → Auto-refresh with refresh_token
Token invalid? → Redirect to login
```


## 🧪 Testing the Integration

### Test 1: Company Profile Update
1. Go to Settings → Company Info tab
2. Change company name
3. Click "Save Changes"
4. See green success notification
5. Reload page → Data persists ✅

### Test 2: Image Upload
1. Go to Settings → Company Info tab
2. Upload logo image
3. See preview display immediately
4. Green success notification appears
5. URL stored in database ✅

### Test 3: Password Change
1. Go to Settings → Account Settings tab
2. Enter current password
3. Enter new password (min 6 chars)
4. Confirm new password
5. Click "Change Password"
6. Login with old password → Fails ✅
7. Login with new password → Works ✅

### Test 4: Delete Account
1. Go to Settings → Account Settings tab
2. Click "Delete Account"
3. Confirm in dialog
4. Enter password
5. Account deleted → Redirected to login ✅
6. CompanyProfile also deleted ✅

## 📦 Dependencies

### Frontend (package.json)
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.x",
    "redux": "^4.x",
    "react-redux": "^8.x",
    "@reduxjs/toolkit": "^1.x",
    "axios": "^1.x",
    "tailwindcss": "^3.x",
    "@mui/material": "^5.x",
    "lucide-react": "latest",
    "recharts": "^2.x"
  }
}
```

### Backend (requirements.txt)
```
Django==4.2.x
djangorestframework==3.14.x
django-cors-headers==4.x
djangorestframework-simplejwt==5.x
cloudinary==1.x
Pillow==10.x  # Image processing
python-decouple==3.x
psycopg2-binary==2.9.x  # PostgreSQL adapter
```

## 🚀 Deployment

### Deploy Frontend to Vercel

**Backend: Onrender.app**

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 📚 Documentation

- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)**
  - Quick start guide
  - Integration map table
  - Debugging tips

- **[DEPLOYMENT.md](./DEPLOYMENT.md)**
  - Vercel deployment guide
  - Database setup
  - Environment configuration

## ✅ Completed Features

- [x] User registration with email/phone validation
- [x] JWT authentication with token refresh
- [x] Company profile creation and management
- [x] Settings page with 4 tabs (Company Info, Founding Info, Social Media, Account Settings)
- [x] Logo/banner image upload with Cloudinary
- [x] Social media links management (JSON storage)
- [x] Password change with verification
- [x] Account deletion with cascade delete
- [x] Dashboard with real-time metrics and charts
- [x] Dark mode support throughout app
- [x] Error/success notifications with auto-dismiss
- [x] Responsive mobile design
- [x] Redux state management
- [x] Form validation (frontend + backend)
- [x] JWT interceptors for automatic token handling
- [x] Comprehensive documentation

## 👤 Author

Created by Sukesh Kumar  
GitHub: https://github.com/sukesh2294

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check documentation files in project root
- Review [BACKEND_FRONTEND_INTEGRATION.md](./BACKEND_FRONTEND_INTEGRATION.md) for technical details

---

**Status:** ✅ Production Ready  
**Last Updated:** January 17, 2026  
**Version:** 1.0.0
