from django.urls import path
from .views import (
    AnalyticsView, InquiriesView, RegisterView, LoginView, 
    CompanyRegisterView, CompanyProfileView,
    UploadLogoView, UploadBannerView,
    UpdateProfileView, ChangePasswordView, DeleteAccountView
)
from rest_framework_simplejwt.views import TokenRefreshView


from django.http import JsonResponse


urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/profile/', UpdateProfileView.as_view(), name='update-profile'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('auth/delete-account/', DeleteAccountView.as_view(), name='delete-account'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('company/register/', CompanyRegisterView.as_view(), name='company-register'),
    path('company/profile/', CompanyProfileView.as_view(), name='company-profile'),
    path('company/upload-logo/', UploadLogoView.as_view(), name='upload-logo'),
    path('company/upload-banner/', UploadBannerView.as_view(), name='upload-banner'),
    path('company/inquiries/', InquiriesView.as_view(), name='company-inquiries'),
    path('company/analytics/', AnalyticsView.as_view(), name='company-analytics'),

]