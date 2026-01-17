from django.shortcuts import render,HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

import logging
from django.db import transaction

from .serializers import (
    UserSerializer, LoginSerializer, 
    CompanyProfileSerializer, CompanyRegistrationSerializer
)
from accounts.models import CustomUser
from companies.models import CompanyProfile
from .services.firebase_service import create_firebase_user
from .services.cloudinary_service import upload_image

def home(request):
    return HttpResponse( "Backend is running!")




logger = logging.getLogger(__name__)
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
            print("\n� Step: Creating user (Firebase handled in serializer)...")
            # Create user - serializer handles Firebase with error recovery
            user = serializer.save()
            print(f"✅ Django user ID: {user.id}")
            print(f"✅ Firebase UID: {user.firebase_uid}")
            
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
                    'email': user.email
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
                
                print(f"\n🎫 Generating JWT tokens...")
                refresh = RefreshToken.for_user(user)
                print(f"✅ Tokens generated")
                
                print("\n✨ Login successful!")
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
            user_id = user.id
            user.delete()
            
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