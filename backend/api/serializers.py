from django.core.cache import cache
import re
from rest_framework import serializers
from accounts.models import CustomUser, OTP
from companies.models import CompanyProfile
from rest_framework_simplejwt.tokens import RefreshToken
from .services.firebase_service import create_firebase_user
import logging
import uuid

logger = logging.getLogger(__name__)

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    firebase_uid = serializers.CharField(max_length=128, required=False, allow_blank=True, default='')
    
    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'password', 'full_name', 'signup_type', 'gender', 
            'mobile_no', 'is_mobile_verified', 'is_email_verified', 'firebase_uid',
            'created_at'
        ]
        read_only_fields = ['id', 'firebase_uid', 'is_mobile_verified', 'is_email_verified', 'created_at']
        extra_kwargs = {
            'email': {'required': True},
            'password': {'write_only': True},
            'full_name': {'required': False, 'allow_blank': True},
            # CustomUser.signup_type is a 1-char flag (e.g. 'e')
            'signup_type': {'required': False, 'default': 'e'},
            'gender': {'required': False, 'allow_null': True},
        }
    
    def validate_email(self, value):
        value = value.lower()
        if CustomUser.objects.filter(email__iexact=value, is_active=True).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value

    def validate_mobile_no(self, value):
        if value:
            # Check if mobile already registered (active users only)
            if CustomUser.objects.filter(mobile_no=value, is_active=True).exists():
                raise serializers.ValidationError("This mobile number is already registered.")
            
            # Basic mobile format validation
            if not re.match(r'^\+?1?\d{9,15}$', value):
                raise serializers.ValidationError("Enter a valid mobile number.")
        
        return value

    
    def create(self, validated_data):
        password = validated_data.pop('password')
        
        if not validated_data.get('firebase_uid'):
            email = validated_data['email']
            phone_number = validated_data.get('mobile_no')
            try:
                firebase_uid = create_firebase_user(email, password, phone_number)
                validated_data['firebase_uid'] = firebase_uid
            except Exception as e:
                print(f"⚠️ Firebase error (continuing without it): {str(e)}")
                # Generate a temporary UID if Firebase fails (for testing)
                validated_data['firebase_uid'] = f"temp_{uuid.uuid4().hex[:20]}"
                logger.warning(f"Firebase creation failed for {email}: {str(e)}")
        
        validated_data.setdefault('signup_type', 'e')
        validated_data.setdefault('is_mobile_verified', False)
        validated_data.setdefault('is_email_verified', False)
        
        # Create Django user
        user = CustomUser(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, min_length=6)
    temp_token = serializers.UUIDField()
    
    def validate(self, data):
        email = data.get('email')
        otp_code = data.get('otp')
        temp_token = data.get('temp_token')
        
        try:
            user = CustomUser.objects.get(email__iexact=email)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("User not found")
        
        try:
            otp_instance = OTP.objects.get(
                user=user,
                token=temp_token,
                otp_code=otp_code,
                purpose='login',
                is_used=False
            )
        except OTP.DoesNotExist:
            raise serializers.ValidationError("Invalid OTP or token")
        
        if not otp_instance.is_valid():
            raise serializers.ValidationError("OTP has expired")
        
        data['otp_instance'] = otp_instance
        return data

class SendRegistrationOTPSerializer(serializers.Serializer):
    """Serializer for sending OTP during registration - store data in cache"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    full_name = serializers.CharField(required=False, allow_blank=True)
    mobile_no = serializers.CharField(required=False, allow_blank=True)
    gender = serializers.CharField(required=False, allow_blank=True)
    # CustomUser.signup_type is 1-char (e.g. 'e')
    signup_type = serializers.CharField(required=False, default='e')
    
    def validate_email(self, value):
        """Check if email is already registered and active"""
        value = value.lower()
        if CustomUser.objects.filter(email__iexact=value, is_active=True).exists():
            raise serializers.ValidationError("This email is already registered. Please use a different email or login.")
        return value
    
    def validate_mobile_no(self, value):
        """Validate mobile number if provided"""
        if value:
            # Check if mobile already registered (active users only)
            if CustomUser.objects.filter(mobile_no=value, is_active=True).exists():
                raise serializers.ValidationError("This mobile number is already registered.")
            
            # Basic mobile format validation
            if not re.match(r'^\+?1?\d{9,15}$', value):
                raise serializers.ValidationError("Enter a valid mobile number.")
        
        return value
    def validate(self, data):
        return data
        

class VerifyRegistrationOTPSerializer(serializers.Serializer):
    """Serializer for verifying OTP during registration check cache"""
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, min_length=6)
    temp_token = serializers.UUIDField()
    
    def validate(self, data):
        email = (data.get('email') or '').lower()
        otp_code = data.get('otp')
        temp_token = data.get('temp_token')
        
        email_cache_key = f"reg_email_{email}"
        cached_temp_token = cache.get(email_cache_key)
        if not cached_temp_token:
            raise serializers.ValidationError({
                'general': 'Registration session expired. Please start registration again.'
            })
        if str(cached_temp_token) != str(temp_token):
            raise serializers.ValidationError({
                'general': 'Invalid or outdated registration session. Please request a new OTP.'
            })
        cache_key = f"registration_data_{temp_token}"
        registration_data = cache.get(cache_key)
        if not registration_data:
            raise serializers.ValidationError({
                'general': 'OTP verification session expired. Please request a new OTP.'
            })
        if registration_data.get('email', '').lower() != email.lower():
            raise serializers.ValidationError({
                'general': 'Email does not match registration session.'
            })
        try:
            otp_instance = OTP.objects.get(
                purpose='registration',
                token=temp_token,
                otp_code=otp_code,
                is_used=False
            )
        except OTP.DoesNotExist:
            raise serializers.ValidationError("Invalid OTP or token")
        
        if not otp_instance.is_valid():
            raise serializers.ValidationError("OTP has expired")
        
        data['registration_data'] = registration_data
        data['otp_instance'] = otp_instance
        data['temp_token'] = temp_token
            
        return data
            
class FinalRegistrationSerializer(serializers.Serializer):
    """Serializer for final registration after email verification"""
    verification_token = serializers.UUIDField(required=True)
    accept_terms = serializers.BooleanField(required=True)
    
    def validate_accept_terms(self, value):
        if not value:
            raise serializers.ValidationError("You must accept the terms and conditions.")
        return value
    
    def validate(self, data):
        verification_token = data.get('verification_token')
        
        # Get verified data from cache
        verification_key = f"verified_{verification_token}"
        verified_data = cache.get(verification_key)
        
        if not verified_data:
            raise serializers.ValidationError({
                'verification_token': 'Verification expired or invalid. Please verify email again.'
            })
        
        registration_data = verified_data.get('registration_data', {})
        
        # Validate required fields
        required_fields = ['email', 'password']
        for field in required_fields:
            if not registration_data.get(field):
                raise serializers.ValidationError({
                    'general': f'Missing {field} in registration data.'
                })
        
        # Check if user already exists
        email = registration_data.get('email')
        if CustomUser.objects.filter(email__iexact=email, is_active=True).exists():
            raise serializers.ValidationError({
                'email': 'User already registered with this email.'
            })
        
        # Check mobile number uniqueness
        mobile_no = registration_data.get('mobile_no')
        if mobile_no and CustomUser.objects.filter(mobile_no=mobile_no, is_active=True).exists():
            raise serializers.ValidationError({
                'mobile_no': 'Mobile number already registered.'
            })
        
        data['verified_data'] = verified_data
        data['registration_data'] = registration_data
        return data
class ResendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    temp_token = serializers.UUIDField(required=False)
    
    def validate(self, data):
        email = data.get('email')
        
        try:
            user = CustomUser.objects.get(email__iexact=email)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("User not found")
        
        data['user'] = user
        return data
    
class CompanyProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyProfile
        fields = '__all__'
        read_only_fields = ['owner', 'created_at', 'updated_at']

class CompanyRegistrationSerializer(serializers.Serializer):
    company_name = serializers.CharField(max_length=255)
    address = serializers.CharField()
    city = serializers.CharField(max_length=50)
    state = serializers.CharField(max_length=50)
    country = serializers.CharField(max_length=50)
    postal_code = serializers.CharField(max_length=20)
    website = serializers.URLField(required=False, allow_blank=True)
    industry = serializers.CharField()
    founded_date = serializers.DateField(required=False)
    description = serializers.CharField(required=False, allow_blank=True)
    social_links = serializers.JSONField(required=False)
