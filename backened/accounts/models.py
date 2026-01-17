from django.db import models

# Create your models here.

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.utils import timezone
import bcrypt

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractBaseUser):
    GENDER_CHOICES = [
        ('m', 'Male'),
        ('f', 'Female'),
        ('o', 'Other'),
    ]
    
    email = models.EmailField(unique=True, max_length=255)
    password = models.CharField(max_length=255)
    full_name = models.CharField(max_length=255, blank=True, default='')
    signup_type = models.CharField(max_length=1, default='e')
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True, null=True)
    mobile_no = models.CharField(max_length=20, unique=True)
    is_mobile_verified = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    firebase_uid = models.CharField(max_length=128, blank=True, null=True, unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = CustomUserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name', 'mobile_no']
    
    def set_password(self, raw_password):
        # Use Django's default password hashing instead of bcrypt
        # This integrates better with Django's authentication system
        super().set_password(raw_password)
    
    def check_password(self, raw_password):
        # Use Django's built-in password verification
        return super().check_password(raw_password)
    
    def __str__(self):
        return self.email