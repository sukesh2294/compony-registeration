from rest_framework import serializers
from accounts.models import CustomUser
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
        extra_kwargs = {
            'password': {'write_only': True},
            'full_name': {'required': False, 'allow_blank': True},
            'signup_type': {'required': False, 'default': 'email'},
            'gender': {'required': False, 'allow_null': True},
            'is_mobile_verified': {'required': False, 'default': False},
            'is_email_verified': {'required': False, 'default': False},
        }
    
    def validate(self, data):

        mobile_no = data.get('mobile_no')
        if mobile_no and CustomUser.objects.filter(mobile_no=mobile_no).exists():
            raise serializers.ValidationError({
                'mobile_no': 'This mobile number is already registered'
            })
        
        email = data.get('email')
        if email and CustomUser.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError({"email": "This email is already in use."})
    
        return data
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        
        # Only create Firebase user if firebase_uid not already provided
        if not validated_data.get('firebase_uid'):
            # Firebase user creation (SKIP IF FIREBASE NOT CONFIGURED)
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
        
        validated_data.setdefault('signup_type', 'email')
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
