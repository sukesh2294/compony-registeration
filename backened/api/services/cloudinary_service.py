import cloudinary
import cloudinary.uploader
import cloudinary.api
from django.conf import settings

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

def upload_image(file, folder='company_images'):
    """Upload image to Cloudinary"""
    try:
        result = cloudinary.uploader.upload(
            file,
            folder=folder,
            resource_type="auto"
        )
        return result['secure_url']
    except Exception as e:
        raise Exception(f"Cloudinary upload failed: {str(e)}")