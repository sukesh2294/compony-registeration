import email
from django.shortcuts import render,HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

import uuid  
import random 
from datetime import timedelta 
from django.utils import timezone  
from accounts.models import OTP  
from django.core.mail import send_mail
from django.conf import settings
from django.core.cache import cache
import json


import logging
from django.db import transaction

from .serializers import (
    UserSerializer, LoginSerializer, 
    CompanyProfileSerializer, CompanyRegistrationSerializer, VerifyOTPSerializer,
    SendRegistrationOTPSerializer, VerifyRegistrationOTPSerializer,
    ResendOTPSerializer,
)
from accounts.models import CustomUser
from companies.models import CompanyProfile
from .services.firebase_service import create_firebase_user
from .services.cloudinary_service import upload_image

def home(request):
    return HttpResponse("""
        <h1 style="text-align:center; margin-top:40px;">
            Backend is running!
        </h1>
        <p style="text-align:center;color:gray;">
            <a href="https://compony-registeration-frontend.vercel.app" target="_blank"
                        style="padding: 10px 20px; background:#007bff; color:white; border-radius: 8px; text-decoration:none;">
                        > Go to Frontend </a>
        </p>
    """)


logger = logging.getLogger(__name__)


def send_otp_email(user_email, otp_code, purpose="Login"):
    subject = f"Your OTP for {purpose}"
    message = f"""
    Your OTP for {purpose} is: {otp_code}
    
    This OTP is valid for 10 minutes.
    
    If you didn't request this OTP, please ignore this email.
    
    Best regards,
    Company Portal Team
    """
    
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_email],
            fail_silently=False,
        )
        print(f"✅ OTP email sent to {user_email}")
        return True
    except Exception as e:
        print(f"❌ Failed to send OTP email: {str(e)}")
        return False


class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        print("\n" + "="*60)
        print("=== REGISTER VIEW DEBUG ===")
        print(f"RAW DATA: {request.data}")
        print("="*60)
        
        serializer = UserSerializer(data=request.data)
        print(f"\n📋 Serializer IS_VALID: {serializer.is_valid()}")
        
        if not serializer.is_valid():
            print(f"❌ Serializer Errors: {dict(serializer.errors)}")
            return Response({
                'success': False,
                'errors': dict(serializer.errors)
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            email = serializer.validated_data.get('email')
            email_lower = (email or "").lower()

            # Enforce email verification for email/password registrations
            # (Your frontend verifies OTP before proceeding to final submit)
            if not cache.get(f"reg_verified_{email_lower}"):
                return Response({
                    'success': False,
                    'message': 'Please verify your email with OTP before completing registration.',
                    'errors': {'email': ['Email verification required']}
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if user already exists (from SendRegistrationOTP step)
            existing_user = CustomUser.objects.filter(email__iexact=email).first()
            
            if existing_user:
                # User exists from OTP step - update with remaining data
                print(f"✅ User already exists (ID: {existing_user.id}) - updating with remaining data")
                
                # Check if email was verified via OTP
                verified_otp = OTP.objects.filter(
                    user=existing_user,
                    purpose='registration',
                    is_used=True
                ).order_by('-created_at').first()

                if verified_otp:
                    print(f"✅ Email {email} was verified via OTP")
                    existing_user.is_email_verified = True
                
                # Update user with remaining registration data
                for field in ['full_name', 'gender', 'signup_type']:
                    if field in serializer.validated_data:
                        setattr(existing_user, field, serializer.validated_data[field])
                
                # Handle mobile_no separately to check uniqueness
                if 'mobile_no' in serializer.validated_data:
                    mobile_no = serializer.validated_data['mobile_no']
                    if mobile_no and mobile_no != existing_user.mobile_no:
                        # Check if mobile_no is already taken by another user
                        if CustomUser.objects.filter(mobile_no=mobile_no).exclude(id=existing_user.id).exists():
                            return Response({
                                'success': False,
                                'errors': {'mobile_no': ['This mobile number is already registered']}
                            }, status=status.HTTP_400_BAD_REQUEST)
                        existing_user.mobile_no = mobile_no
                
                # Update password if provided
                if 'password' in serializer.validated_data:
                    existing_user.set_password(serializer.validated_data['password'])
                
                # Create Firebase user if not already exists (handle Firebase with error recovery)
                if not existing_user.firebase_uid:
                    try:
                        firebase_uid = create_firebase_user(
                            existing_user.email, 
                            serializer.validated_data.get('password', ''),
                            existing_user.mobile_no
                        )
                        existing_user.firebase_uid = firebase_uid
                    except Exception as e:
                        print(f"⚠️ Firebase error (continuing without it): {str(e)}")
                        # Generate a temporary UID if Firebase fails
                        existing_user.firebase_uid = f"temp_{uuid.uuid4().hex[:20]}"
                        logger.warning(f"Firebase creation failed for {email}: {str(e)}")
                
                existing_user.save()
                user = existing_user
            else:
                # New user - create normally using serializer
                print("\n💾 Step: Creating user (Firebase handled in serializer)...")
                user = serializer.save()
            
            # Mark as verified (OTP verified in previous step)
            user.is_email_verified = True
            user.save(update_fields=['is_email_verified', 'updated_at'])
            cache.delete(f"reg_verified_{email_lower}")
            
            print(f"✅ Django user ID: {user.id}")
            print(f"✅ Firebase UID: {user.firebase_uid}")
            print(f"✅ Email verified: {user.is_email_verified}")
            
            print("\n🎫 Step: Generating JWT tokens...")
            # JWT
            refresh = RefreshToken.for_user(user)
            print(f"✅ Tokens generated")
            
            print("\n✨ Registration successful!")
            print("="*60 + "\n")
            
            return Response({
                'success': True,
                'message': 'Registration complete!',
                'data': {
                    'user_id': user.id,
                    'firebase_uid': user.firebase_uid,
                    'access_token': str(refresh.access_token),
                    'refresh_token': str(refresh),
                    'email': user.email,
                    'user': UserSerializer(user).data
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"\n❌ ERROR: {type(e).__name__}")
            print(f"❌ ERROR MESSAGE: {str(e)}")
            import traceback
            traceback.print_exc()
            print("="*60 + "\n")
            
            return Response({
                'success': False,
                'message': str(e),
                'error_type': type(e).__name__
            }, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        print("\n" + "="*60)
        print("=== LOGIN VIEW DEBUG ===")
        print(f"RAW DATA: {request.data}")
        print("="*60)
        
        serializer = LoginSerializer(data=request.data)
        print(f"\n📋 Serializer IS_VALID: {serializer.is_valid()}")
        
        if not serializer.is_valid():
            print(f"❌ Serializer Errors: {dict(serializer.errors)}")
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            
            print(f"\n🔍 Looking for user with email: {email}")
            user = CustomUser.objects.get(email__iexact=email)
            print(f"✅ User found: ID={user.id}")
            
            print(f"\n🔑 Checking password...")
            if user.check_password(password):
                print(f"✅ Password correct")
                otp_code = str(random.randint(100000, 999999))
                temp_token = uuid.uuid4()
                print(f"\n🎫 Generating JWT tokens...")
                refresh = RefreshToken.for_user(user)
                # print(f"✅ Tokens generated")
    
                otp_instance = OTP.objects.create(
                    user=user,
                    purpose='login',
                    otp_code=otp_code,
                    token=temp_token,
                    expires_at=timezone.now() + timedelta(minutes=10)
                )

                # TODO: Send OTP via email or SMS
                # For now, just log it
                send_otp_email(email, otp_code, "Login Verification")
                print(f"📧 OTP sent to {email}: {otp_code}")

                print("\n📬 OTP generated and sent!")
                print("="*60 + "\n")

                print("\n✨ Login successful!")
                print("="*60 + "\n")
                
                return Response({
                    'success': True,
                    'message': 'OTP sent to your registered email/phone',
                    'data': {
                        'requiresOtp': True,
                        'email': email,
                        'user_id': user.id,
                        'temp_token': str(temp_token),
                        'access_token': str(refresh.access_token),
                        'refresh_token': str(refresh),
                        'user': UserSerializer(user).data
                    }
                }, status=status.HTTP_200_OK)
            else:
                print(f"❌ Password incorrect")
                return Response({
                    'success': False,
                    'message': 'Invalid credentials'
                }, status=status.HTTP_401_UNAUTHORIZED)
                
        except CustomUser.DoesNotExist:
            print(f"❌ User not found: {email}")
            return Response({
                'success': False,
                'message': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"\n❌ ERROR: {type(e).__name__}")
            print(f"❌ ERROR MESSAGE: {str(e)}")
            import traceback
            traceback.print_exc()
            print("="*60 + "\n")
            
            return Response({
                'success': False,
                'message': str(e),
                'error_type': type(e).__name__
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VerifyOTPView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        print("\n" + "="*60)
        print("=== VERIFY LOGIN OTP VIEW DEBUG ===")
        print(f"RAW DATA: {request.data}")
        print("="*60)
        
        serializer = VerifyOTPSerializer(data=request.data)
        print(f"\n📋 Serializer IS_VALID: {serializer.is_valid()}")
        
        if not serializer.is_valid():
            print(f"❌ Serializer Errors: {dict(serializer.errors)}")
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            email = serializer.validated_data['email']
            otp_code = serializer.validated_data['otp']
            temp_token = serializer.validated_data['temp_token']
            
            print(f"\n🔍 Looking for OTP: email={email}, otp={otp_code}, token={temp_token}")
            
            # Get user
            user = CustomUser.objects.get(email__iexact=email)
            
            # Get OTP instance
            from accounts.models import OTP
            otp_instance = OTP.objects.get(
                user=user,
                token=temp_token,
                otp_code=otp_code,
                purpose='login',
                is_used=False
            )
            
            # Check if OTP is valid
            if not otp_instance.is_valid():
                return Response({
                    'success': False,
                    'message': 'OTP has expired'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Mark OTP as used
            otp_instance.is_used = True
            otp_instance.save()
            
            print(f"\n✅ OTP verified successfully!")
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            print(f"✅ Tokens generated")
            
            print("\n✨ OTP verified and login successful!")
            print("="*60 + "\n")
            
            return Response({
                'success': True,
                'message': 'Login successful',
                'data': {
                    'access_token': str(refresh.access_token),
                    'refresh_token': str(refresh),
                    'user': UserSerializer(user).data
                }
            }, status=status.HTTP_200_OK)
            
        except CustomUser.DoesNotExist:
            return Response({
                'success': False,
                'message': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except OTP.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Invalid OTP or token'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"\n❌ ERROR: {type(e).__name__}")
            print(f"❌ ERROR MESSAGE: {str(e)}")
            import traceback
            traceback.print_exc()
            
            return Response({
                'success': False,
                'message': str(e),
                'error_type': type(e).__name__
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SendRegistrationOTPView(APIView):
    """Send OTP for email verification during registration """
    permission_classes = [AllowAny]
    
    def post(self, request):
        print("\n" + "="*60)
        print("=== SEND REGISTRATION OTP VIEW DEBUG ===")
        print(f"RAW DATA: {request.data}")
        print("="*60)
        
        serializer = SendRegistrationOTPSerializer(data=request.data)
        print(f"\n📋 Serializer IS_VALID: {serializer.is_valid()}")
        
        if not serializer.is_valid():
            print(f"❌ Serializer Errors: {dict(serializer.errors)}")
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            email = serializer.validated_data['email'].lower()
            password = serializer.validated_data['password']
            full_name = serializer.validated_data.get('full_name', '')
            mobile_no = serializer.validated_data.get('mobile_no', '')
            gender = serializer.validated_data.get('gender', '')
            signup_type = serializer.validated_data.get('signup_type', 'e')

            existing_user = CustomUser.objects.filter(email__iexact=email).first()
            if existing_user:
                return Response({
                    'success': False,
                    'message': 'User already exists'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Generate new OTP
            otp_code = str(random.randint(100000, 999999))
            temp_token = uuid.uuid4()
            
            registration_data={
                'email': email,
                'password': password,
                'full_name': full_name,
                'mobile_no': mobile_no,
                'gender': gender,
                'signup_type': signup_type,
                'temp_token': str(temp_token),
                'created_at': str(timezone.now())
            }

            cache_key = f"registration_data_{temp_token}"
            email_cache_key = f"reg_email_{email}"
            cache.set(cache_key, registration_data, timeout=600)
            cache.set(email_cache_key, str(temp_token), timeout=600)

            otp_instance = OTP.objects.create(
                purpose='registration',
                otp_code=otp_code,
                token=temp_token,
                expires_at=timezone.now() + timedelta(minutes=10)
            )

            # TODO: Send OTP via email or SMS
            send_otp_email(email, otp_code, "Registration Verification")
            print(f"📧 Registration OTP sent to {email}: {otp_code}")
            print(f"🎫 Temp token: {temp_token}")
            
            print("\n✨ Registration OTP sent successfully!")
            print("="*60 + "\n")
            
            return Response({
                'success': True,
                'message': 'OTP sent to your email',
                'data': {
                    'temp_token': str(temp_token),
                    'email': email,
                    'otp_required': True
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"\n❌ ERROR: {type(e).__name__}")
            print(f"❌ ERROR MESSAGE: {str(e)}")
            import traceback
            traceback.print_exc()
            
            return Response({
                'success': False,
                'message': str(e),
                'error_type': type(e).__name__
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VerifyRegistrationOTPView(APIView):
    """Verify OTP for registration"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        print("\n" + "="*60)
        print("=== VERIFY REGISTRATION OTP VIEW DEBUG ===")
        print(f"RAW DATA: {request.data}")
        print("="*60)
        
        serializer = VerifyRegistrationOTPSerializer(data=request.data)
        print(f"\n📋 Serializer IS_VALID: {serializer.is_valid()}")
        
        if not serializer.is_valid():
            print(f"❌ Serializer Errors: {dict(serializer.errors)}")
            return Response({
                'success': False,
                'message': 'OTP verification failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            email = serializer.validated_data['email']
            otp_code = serializer.validated_data['otp']
            temp_token = serializer.validated_data['temp_token']
            otp_instance = serializer.validated_data['otp_instance']

            # Mark OTP as used
            otp_instance.is_used = True
            otp_instance.save()
            
            # Mark email as verified for the final /auth/register/ step (30 min window)
            cache.set(f"reg_verified_{email.lower()}", True, timeout=1800)
            
            print(f"\n✅ OTP verified successfully!")
            
            # Cleanup sensitive cached registration data
            cache.delete(f"registration_data_{temp_token}")
            cache.delete(f"reg_email_{email.lower()}")

            verification_token = uuid.uuid4()
            print("\n✨ Registration OTP verified successfully!")
            print("="*60 + "\n")
            
            return Response({
                'success': True,
                'message': 'Email verified successfully.Please complete registration.',
                'data': {
                    'email': email,
                    'verification_token': str(verification_token),
                    'is_email_verified': True,
                    'requires_registration': True
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"\n❌ ERROR: {type(e).__name__}")
            print(f"❌ ERROR MESSAGE: {str(e)}")
            import traceback
            traceback.print_exc()
            
            return Response({
                'success': False,
                'message': str(e),
                'error_type': type(e).__name__
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ResendOTPView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        print("\n" + "="*60)
        print("=== RESEND LOGIN OTP VIEW DEBUG ===")
        print(f"RAW DATA: {request.data}")
        print("="*60)
        
        serializer = ResendOTPSerializer(data=request.data)
        print(f"\n📋 Serializer IS_VALID: {serializer.is_valid()}")
        
        if not serializer.is_valid():
            print(f"❌ Serializer Errors: {dict(serializer.errors)}")
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            email = serializer.validated_data['email']
            temp_token = request.data.get('temp_token')
            
            print(f"\n🔍 Looking for user with email: {email}")
            user = CustomUser.objects.get(email__iexact=email)
            
            # If temp_token provided, invalidate old OTPs
            if temp_token:
                from accounts.models import OTP
                OTP.objects.filter(
                    user=user,
                    token=temp_token,
                    purpose='login',
                    is_used=False
                ).update(is_used=True)
            
            # Generate new OTP
            otp_code = str(random.randint(100000, 999999))
            new_temp_token = uuid.uuid4()
            
            # Create new OTP instance
            otp_instance = OTP.objects.create(
                user=user,
                purpose='login',
                otp_code=otp_code,
                token=new_temp_token,
                expires_at=timezone.now() + timedelta(minutes=10)
            )
            
            # TODO: Send OTP via email or SMS
            send_otp_email(email, otp_code, "Login Verification")
            print(f"📧 New OTP sent to {email}: {otp_code}")
            
            return Response({
                'success': True,
                'message': 'New OTP sent successfully',
                'data': {
                    'temp_token': str(new_temp_token),
                    'email': email
                }
            }, status=status.HTTP_200_OK)
            
        except CustomUser.DoesNotExist:
            return Response({
                'success': False,
                'message': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"\n❌ ERROR: {type(e).__name__}")
            print(f"❌ ERROR MESSAGE: {str(e)}")
            import traceback
            traceback.print_exc()
            
            return Response({
                'success': False,
                'message': str(e),
                'error_type': type(e).__name__
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CompanyRegisterView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        print("\n" + "="*60)
        print("=== COMPANY REGISTER VIEW DEBUG ===")
        print(f"USER: {request.user.id} - {request.user.email}")
        print(f"RAW DATA: {request.data}")
        print("="*60)
        
        serializer = CompanyRegistrationSerializer(data=request.data)
        print(f"\n📋 Serializer IS_VALID: {serializer.is_valid()}")
        
        if not serializer.is_valid():
            print(f"❌ Serializer Errors: {dict(serializer.errors)}")
            return Response({
                'success': False,
                'errors': dict(serializer.errors)
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            print("\n💾 Step: Creating company profile...")
            company_data = serializer.validated_data
            company_data['owner'] = request.user
            
            company = CompanyProfile.objects.create(**company_data)
            print(f"✅ Company ID: {company.id}")
            
            print("\n✨ Company registration successful!")
            print("="*60 + "\n")
            
            return Response({
                'success': True,
                'message': 'Company registered successfully',
                'data': CompanyProfileSerializer(company).data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"\n❌ ERROR: {type(e).__name__}")
            print(f"❌ ERROR MESSAGE: {str(e)}")
            import traceback
            traceback.print_exc()
            print("="*60 + "\n")
            
            return Response({
                'success': False,
                'message': str(e),
                'error_type': type(e).__name__
            }, status=status.HTTP_400_BAD_REQUEST)

class CompanyProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            company = CompanyProfile.objects.get(owner=request.user)
            serializer = CompanyProfileSerializer(company)
            return Response({
                'success': True,
                'data': serializer.data
            })
        except CompanyProfile.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Company profile not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    def put(self, request):
        try:
            company = CompanyProfile.objects.get(owner=request.user)
            serializer = CompanyProfileSerializer(company, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'success': True,
                    'message': 'Company profile updated successfully',
                    'data': serializer.data
                })
            
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except CompanyProfile.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Company profile not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    def patch(self, request):
        try:
            company = CompanyProfile.objects.get(owner=request.user)
            serializer = CompanyProfileSerializer(company, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'success': True,
                    'message': 'Company profile updated successfully',
                    'data': serializer.data
                })
            
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except CompanyProfile.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Company profile not found'
            }, status=status.HTTP_404_NOT_FOUND)

class UploadLogoView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        if 'logo' not in request.FILES:
            return Response({
                'success': False,
                'message': 'No logo file provided'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            logo_file = request.FILES['logo']
            logo_url = upload_image(logo_file, folder='company_logos')
            
            company = CompanyProfile.objects.get(owner=request.user)
            company.logo_url = logo_url
            company.save()
            
            return Response({
                'success': True,
                'message': 'Logo uploaded successfully',
                'data': {'logo_url': logo_url}
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UploadBannerView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        if 'banner' not in request.FILES:
            return Response({
                'success': False,
                'message': 'No banner file provided'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            banner_file = request.FILES['banner']
            banner_url = upload_image(banner_file, folder='company_banners')
            
            company = CompanyProfile.objects.get(owner=request.user)
            company.banner_url = banner_url
            company.save()
            
            return Response({
                'success': True,
                'message': 'Banner uploaded successfully',
                'data': {'banner_url': banner_url}
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def patch(self, request):
        try:
            user = request.user
            
            # Update allowed fields
            if 'email' in request.data:
                # Check if email already exists
                if CustomUser.objects.filter(email__iexact=request.data['email']).exclude(id=user.id).exists():
                    return Response({
                        'success': False,
                        'message': 'Email already in use'
                    }, status=status.HTTP_400_BAD_REQUEST)
                user.email = request.data['email']
            
            if 'mobile_no' in request.data:
                # Check if mobile already exists
                if CustomUser.objects.filter(mobile_no=request.data['mobile_no']).exclude(id=user.id).exists():
                    return Response({
                        'success': False,
                        'message': 'Mobile number already in use'
                    }, status=status.HTTP_400_BAD_REQUEST)
                user.mobile_no = request.data['mobile_no']
            
            if 'full_name' in request.data:
                user.full_name = request.data['full_name']
            
            user.save()
            
            return Response({
                'success': True,
                'message': 'Profile updated successfully',
                'data': UserSerializer(user).data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            user = request.user
            current_password = request.data.get('current_password')
            new_password = request.data.get('new_password')
            
            if not current_password or not new_password:
                return Response({
                    'success': False,
                    'message': 'Current password and new password are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Verify current password
            if not user.check_password(current_password):
                return Response({
                    'success': False,
                    'message': 'Current password is incorrect'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Validate new password
            if len(new_password) < 6:
                return Response({
                    'success': False,
                    'message': 'New password must be at least 6 characters long'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Set new password
            user.set_password(new_password)
            user.save()
            
            return Response({
                'success': True,
                'message': 'Password changed successfully'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DeleteAccountView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            user = request.user
            password = request.data.get('password')
            
            if not password:
                return Response({
                    'success': False,
                    'message': 'Password is required to delete account'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Verify password
            if not user.check_password(password):
                return Response({
                    'success': False,
                    'message': 'Password is incorrect'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Delete associated company profile first
            try:
                company = CompanyProfile.objects.get(owner=user)
                company.delete()
            except CompanyProfile.DoesNotExist:
                pass
            
            # Delete user account
            request.user.delete()
            
            return Response({
                'success': True,
                'message': 'Account deleted successfully'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        




class InquiriesView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response({
            'success': True,
            'message': 'Inquiries endpoint - to be implemented'
        })
    
class AnalyticsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response({
            'success': True,
            'message': 'Analytics endpoint - to be implemented'
        })