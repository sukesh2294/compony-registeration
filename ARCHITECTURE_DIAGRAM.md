# System Architecture & Data Flow Diagram

## 🏗️ Frontend-Backend Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + Vite)                         │
│                         http://localhost:5173                           │
└─────────────────────────────────────────────────────────────────────────┘
         │                                                  │
         │                    AXIOS                         │
         │          (with JWT Token Interceptors)           │
         │                                                  │
         ├──────────────────────────────────────────────────┤
         │                                                  │
    ┌────▼──────┐                                    ┌──────▼───┐
    │ LoginForm │                                    │Register  │
    │Component  │                                    │Form      │
    └────┬──────┘                                    └──────┬───┘
         │                                                  │
         │  POST /api/auth/login/                         │
         │  POST /api/auth/register/                      │
         │                                                  │
         └──────────────────────────┬─────────────────────┘
                                    │
                          ┌─────────▼─────────┐
                          │ authService.js    │
                          │ API Service Layer │
                          └─────────┬─────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         │                          │                          │
         │              CORS Enabled and Configured            │
         │         (All ports 5173, 3000, 8000 allowed)        │
         │                          │                          │
    ┌────▼──────────────────────────▼──────────────────────────▼────┐
    │                                                                │
    │          BACKEND (Django REST Framework)                      │
    │          http://127.0.0.1:8000                               │
    │                                                                │
    └────────────────────────────────────────────────────────────────┘
         │                    │                    │
         │                    │                    │
    ┌────▼──────┐        ┌────▼──────┐       ┌────▼──────┐
    │ API URLs  │        │ Views     │       │Serializers│
    │ /api/auth/│        │(APIView)  │       │           │
    │  register/│        │LoginView  │       │UserSerializer│
    │  login/   │        │RegisterView│      │Company    │
    │ /api/     │        │Company    │       │Serializers│
    │ company/  │        │Views      │       │           │
    └────┬──────┘        └────┬──────┘       └────┬──────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │  Models           │
                    │  CustomUser       │
                    │  CompanyProfile   │
                    └─────────┬─────────┘
                              │
                    ┌─────────▼─────────┐
                    │  PostgreSQL DB    │
                    │  company_db       │
                    └───────────────────┘
```

---

## 📡 API Request-Response Flow

### User Registration Flow

```
┌────────────────────────────────────────────────────────────────────┐
│                    USER REGISTRATION FLOW                          │
└────────────────────────────────────────────────────────────────────┘

FRONTEND (RegisterForm)
         │
         ├─ Collect user data
         │  ├─ email: "user@example.com"
         │  ├─ password: "SecurePass123"
         │  ├─ full_name: "John Doe"
         │  ├─ mobile_no: "9876543210"
         │  └─ gender: "m"
         │
         └─ POST /api/auth/register/
            │
            ▼
BACKEND (RegisterView)
         │
         ├─ Validate data with UserSerializer
         │  ├─ Check email doesn't exist ✓
         │  ├─ Check mobile doesn't exist ✓
         │  ├─ Validate password strength ✓
         │  └─ Validate phone format ✓
         │
         ├─ Create user
         │  ├─ Hash password with Django's PBKDF2
         │  ├─ Generate Firebase UID (or temp ID)
         │  └─ Save to database
         │
         ├─ Generate JWT Tokens
         │  ├─ access_token (90-day expiry)
         │  └─ refresh_token (90-day expiry)
         │
         └─ Response: 201 Created
            {
              "success": true,
              "message": "Registration complete!",
              "data": {
                "user_id": 1,
                "email": "user@example.com",
                "firebase_uid": "...",
                "access_token": "eyJ0eXAi...",
                "refresh_token": "eyJ0eXAi...",
                "full_name": "John Doe"
              }
            }
            │
            ▼
FRONTEND (authService)
         │
         ├─ Store tokens in localStorage
         │  ├─ access_token
         │  └─ refresh_token
         │
         ├─ Store user data in localStorage
         │
         ├─ Dispatch Redux action setUser()
         │
         └─ Redirect to /company-registration
```

### User Login Flow

```
┌────────────────────────────────────────────────────────────────────┐
│                        USER LOGIN FLOW                             │
└────────────────────────────────────────────────────────────────────┘

FRONTEND (LoginForm)
         │
         ├─ Collect credentials
         │  ├─ email: "user@example.com"
         │  └─ password: "SecurePass123"
         │
         └─ POST /api/auth/login/
            │
            ▼
BACKEND (LoginView)
         │
         ├─ Validate input with LoginSerializer
         │  ├─ email format valid ✓
         │  └─ password provided ✓
         │
         ├─ Find user by email
         │  ├─ Query CustomUser table
         │  └─ Check user exists
         │
         ├─ Verify password
         │  ├─ Hash provided password
         │  ├─ Compare with stored hash
         │  └─ If match: continue
         │
         ├─ Generate JWT Tokens
         │  ├─ access_token
         │  └─ refresh_token
         │
         ├─ Serialize user data
         │
         └─ Response: 200 OK
            {
              "success": true,
              "message": "Login successful",
              "data": {
                "access_token": "eyJ0eXAi...",
                "refresh_token": "eyJ0eXAi...",
                "user": {
                  "id": 1,
                  "email": "user@example.com",
                  "full_name": "John Doe",
                  "created_at": "2026-01-17T12:31:00Z"
                }
              }
            }
            │
            ▼
FRONTEND (authService)
         │
         ├─ Store tokens and user data
         │
         ├─ Add Authorization header to future requests:
         │  Bearer <access_token>
         │
         ├─ Dispatch Redux action setUser()
         │
         └─ Redirect to /dashboard
```

### Protected Endpoint Request (Company Registration)

```
┌────────────────────────────────────────────────────────────────────┐
│                    PROTECTED ENDPOINT FLOW                         │
└────────────────────────────────────────────────────────────────────┘

FRONTEND (CompanyForm)
         │
         ├─ Get access_token from localStorage
         │
         ├─ POST /api/company/register/
         │  Header: Authorization: Bearer <access_token>
         │  Body: {
         │    "company_name": "Acme Corp",
         │    "address": "123 Main St",
         │    "city": "New York",
         │    ...
         │  }
         │
         ▼
BACKEND MIDDLEWARE (JWTAuthentication)
         │
         ├─ Extract token from Authorization header
         │
         ├─ Verify token signature
         │
         ├─ Check token expiry
         │  ├─ If expired: return 401
         │  ├─ If valid: continue
         │  └─ Set request.user
         │
         ▼
BACKEND (CompanyRegisterView)
         │
         ├─ Check IsAuthenticated permission
         │  └─ request.user is set ✓
         │
         ├─ Validate data with CompanyRegistrationSerializer
         │
         ├─ Create CompanyProfile
         │  ├─ owner = request.user (authenticated user)
         │  ├─ Set all company fields
         │  └─ Save to database
         │
         └─ Response: 201 Created
            {
              "success": true,
              "message": "Company registered successfully",
              "data": {
                "id": 1,
                "company_name": "Acme Corp",
                "owner": 1,
                "created_at": "2026-01-17T12:45:00Z"
              }
            }
            │
            ▼
FRONTEND (companyService)
         │
         ├─ Parse response
         │
         ├─ Update Redux store
         │
         └─ Redirect to dashboard
```

---

## 🔄 Token Refresh Flow

```
┌────────────────────────────────────────────────────────────────────┐
│                    TOKEN REFRESH FLOW (Auto)                       │
└────────────────────────────────────────────────────────────────────┘

FRONTEND
   │
   ├─ Request protected endpoint
   │  Header: Authorization: Bearer <expired_access_token>
   │
   ▼
BACKEND
   │
   └─ Returns 401 Unauthorized
      (Token expired)
   │
   ▼
FRONTEND (Axios Response Interceptor)
   │
   ├─ Detect 401 error
   │
   ├─ Check if retry already attempted
   │  └─ If not, continue; if yes, redirect to login
   │
   ├─ Prepare refresh request:
   │  POST /api/token/refresh/
   │  Body: { "refresh": <refresh_token> }
   │
   ▼
BACKEND (TokenRefreshView)
   │
   ├─ Verify refresh token
   │
   ├─ Generate new access token
   │
   └─ Response: 200 OK
      {
        "access": "new_access_token",
        "refresh": "new_refresh_token"
      }
   │
   ▼
FRONTEND
   │
   ├─ Update tokens in localStorage
   │
   ├─ Update Authorization header
   │
   ├─ Retry original request with new token
   │
   └─ Resume normal flow
```

---

## 🗂️ Database Schema

```
┌─────────────────────────────────────────────────────────────┐
│                    CustomUser Table                          │
├─────────────────────────────────────────────────────────────┤
│ PK │ id                 (Integer)                            │
│    │ email              (String, UNIQUE) ✓                  │
│    │ password           (String - hashed with PBKDF2)       │
│    │ full_name          (String, Optional)                  │
│    │ mobile_no          (String, UNIQUE)                    │
│    │ gender             (Char(1), Optional: m/f/o)          │
│    │ firebase_uid       (String, UNIQUE, Optional)          │
│    │ is_mobile_verified (Boolean, default: False)           │
│    │ is_email_verified  (Boolean, default: False)           │
│    │ is_active          (Boolean, default: True)            │
│    │ is_staff           (Boolean, default: False)           │
│    │ created_at         (DateTime, auto_now_add)            │
│    │ updated_at         (DateTime, auto_now)                │
└─────────────────────────────────────────────────────────────┘
         │ FK (1 to many)
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                CompanyProfile Table                          │
├─────────────────────────────────────────────────────────────┤
│ PK │ id                 (Integer)                            │
│ FK │ owner_id           (ForeignKey to CustomUser)           │
│    │ company_name       (Text)                              │
│    │ address            (Text)                              │
│    │ city               (String)                            │
│    │ state              (String)                            │
│    │ country            (String)                            │
│    │ postal_code        (String)                            │
│    │ website            (URL, Optional)                     │
│    │ industry           (Text)                              │
│    │ founded_date       (Date, Optional)                    │
│    │ description        (Text, Optional)                    │
│    │ logo_url           (URL, Optional)                     │
│    │ banner_url         (URL, Optional)                     │
│    │ logo               (ImageField, Optional)              │
│    │ banner             (ImageField, Optional)              │
│    │ social_links       (JSON, Optional)                    │
│    │ created_at         (DateTime, auto_now_add)            │
│    │ updated_at         (DateTime, auto_now)                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow Summary

```
┌──────────────────────────────────────────────────────────────┐
│                   AUTHENTICATION LAYERS                       │
└──────────────────────────────────────────────────────────────┘

Layer 1: FRONTEND
   ├─ React Components (LoginForm, RegisterForm)
   └─ Redux Store (authSlice)
        └─ Token & User Storage in localStorage

Layer 2: AXIOS INTERCEPTORS
   ├─ Request Interceptor
   │  └─ Add Authorization: Bearer <access_token>
   │
   └─ Response Interceptor
      ├─ Detect 401 errors
      ├─ Refresh token if needed
      └─ Retry request

Layer 3: BACKEND MIDDLEWARE
   ├─ CorsMiddleware (CORS handling)
   ├─ SessionMiddleware
   ├─ AuthenticationMiddleware
   └─ Custom JWT Authentication
      └─ rest_framework_simplejwt.authentication.JWTAuthentication

Layer 4: VIEWS & PERMISSIONS
   ├─ RegisterView (AllowAny)
   ├─ LoginView (AllowAny)
   └─ Protected Views (IsAuthenticated)
      ├─ CompanyRegisterView
      ├─ CompanyProfileView
      ├─ UploadLogoView
      └─ UploadBannerView

Layer 5: DATABASE
   └─ CustomUser with PBKDF2 hashed passwords
```

---

## 📊 Data Validation Flow

```
┌────────────────────────────────────────────────────────────────┐
│                   VALIDATION PIPELINE                          │
└────────────────────────────────────────────────────────────────┘

FRONTEND VALIDATION (React)
   │
   ├─ Email format check
   │  └─ /^[^\s@]+@[^\s@]+\.[^\s@]+$/
   │
   ├─ Password strength
   │  ├─ Min 6 characters
   │  ├─ Confirm password match
   │  └─ Visual feedback
   │
   ├─ Phone number format
   │  └─ 10 digits
   │
   ├─ Full name required
   │
   └─ Gender selection
        │
        ▼
   └─ PASS → Send to Backend
        │
        ▼

BACKEND VALIDATION (Django Serializers)
   │
   ├─ UserSerializer.validate()
   │  ├─ Check email unique (case-insensitive)
   │  ├─ Check mobile unique
   │  └─ Field-level validation
   │
   ├─ create() method
   │  ├─ Hash password
   │  ├─ Create Firebase user (with fallback)
   │  └─ Save to database
   │
   ├─ CompanyRegistrationSerializer.validate()
   │  ├─ Check required fields
   │  └─ Validate field formats
   │
   └─ PASS → Create resource & respond
```


