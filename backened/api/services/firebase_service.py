import requests
from django.conf import settings
from typing import Optional, Dict, Any
import json
import logging

logger = logging.getLogger(__name__)

def create_firebase_user(email: str, password: str, phone_number: Optional[str] = None) -> str:
    """
    Create user in Firebase Auth using REST API.
    Returns Firebase UID (localId).
    """
    api_key = getattr(settings, 'FIREBASE_API_KEY', '')
    
    if not api_key:
        raise ValueError("FIREBASE_API_KEY not configured in settings")
    
    print(f"🔥 Firebase API Key (first 20 chars): {api_key[:20]}...")
    
    url = f"https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={api_key}"
    
    payload = {
        "email": email,
        "password": password,
        "returnSecureToken": True
    }
    
    if phone_number:
        payload["phoneNumber"] = phone_number
    
    print(f"🔥 Firebase URL: {url[:80]}...")
    print(f"🔥 Firebase Payload: {json.dumps({**payload, 'password': '***'})}")
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        print(f"🔥 Firebase Response Status: {response.status_code}")
        print(f"🔥 Firebase Response: {response.text[:200]}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Firebase UID created: {data.get('localId')}")
            return data['localId']  # Firebase UID
        
        error_data = response.json()
        error_msg = error_data.get('error', {}).get('message', 'Unknown error')
        error_code = error_data.get('error', {}).get('code', 'N/A')
        print(f"❌ Firebase Error Code: {error_code}")
        print(f"❌ Firebase Error Message: {error_msg}")
        raise Exception(f"Firebase signup failed ({error_code}): {error_msg}")
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Firebase Request Error: {str(e)}")
        raise Exception(f"Firebase connection failed: {str(e)}")


def verify_firebase_token(token: str) -> Dict[str, Any]:
    """
    Verify Firebase ID token using REST API.
    Returns user data dict.
    """
    api_key = getattr(settings, 'FIREBASE_API_KEY', '')
    
    if not api_key:
        raise ValueError("FIREBASE_API_KEY not configured in settings")
    
    url = f"https://identitytoolkit.googleapis.com/v1/accounts:lookup?key={api_key}"
    
    payload = {"idToken": token}
    
    response = requests.post(url, json=payload)
    
    if response.status_code == 200:
        data = response.json()
        users = data.get('users', [])
        if users:
            return users[0]
        raise Exception("No user found in token")
    
    error_data = response.json()
    error_msg = error_data.get('error', {}).get('message', 'Token verification failed')
    raise Exception(error_msg)
