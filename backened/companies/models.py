from django.db import models

# Create your models here.

from django.conf import settings

class CompanyProfile(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='companies'
    )
    company_name = models.TextField()
    address = models.TextField()
    city = models.CharField(max_length=50)
    state = models.CharField(max_length=50)
    country = models.CharField(max_length=50)
    postal_code = models.CharField(max_length=20)
    website = models.URLField(blank=True, null=True)
    logo_url = models.URLField(blank=True, null=True)
    banner_url = models.URLField(blank=True, null=True)
    industry = models.TextField()
    founded_date = models.DateField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    social_links = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    logo = models.ImageField(upload_to="company_logos/", blank=True, null=True)
    banner = models.ImageField(upload_to="company_banners/", blank=True, null=True)
    
    def __str__(self):
        return self.company_name