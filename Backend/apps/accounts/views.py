import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

from .models import CustomUser
from .serializers import UserSerializer, GoogleOAuthSerializer

class GoogleOAuthLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, format=None):
        serializer = GoogleOAuthSerializer(data=request.data)
        if serializer.is_valid():
            token = serializer.validated_data.get("token")
            # Verify the token with Google's tokeninfo endpoint.
            verification_url = "https://www.googleapis.com/oauth2/v3/tokeninfo"
            response = requests.get(verification_url, params={"id_token": token})
            if response.status_code != 200:
                return Response({"error": "Invalid Google token."}, status=status.HTTP_400_BAD_REQUEST)
            
            data = response.json()
            email = data.get("email")
            first_name = data.get("given_name", "")
            last_name = data.get("family_name", "")
            if not email:
                return Response({"error": "Email not provided by Google."}, status=status.HTTP_400_BAD_REQUEST)
            
            # Get or create the user. Password is not set as we use OAuth.
            user, created = CustomUser.objects.get_or_create(email=email, defaults={
                "username": email,  # Use email as username
                "first_name": first_name,
                "last_name": last_name,
            })
            # Serialize and return user data.
            user_serializer = UserSerializer(user)
            return Response(user_serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
