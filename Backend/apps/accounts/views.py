from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import CustomUser
from .serializers import (
    UserSerializer,
    RegistrationSerializer,
    CustomTokenObtainPairSerializer,
    MacroPreferencesSerializer
)

class RegistrationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, format=None):
        serializer = RegistrationSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']

            if CustomUser.objects.filter(email=email).exists():
                return Response({"error": "User already exists."},
                                status=status.HTTP_400_BAD_REQUEST)
            
            # Create the user; use email as username.
            user = CustomUser(email=email, username=email)
            user.set_password(password)
            user.save()
            
            # Generate JWT tokens.
            refresh = RefreshToken.for_user(user)
            data = UserSerializer(user).data
            data.update({
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            })
            return Response(data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]
    serializer_class = CustomTokenObtainPairSerializer

class MacroPreferencesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        # Return the authenticated user's macro preferences.
        serializer = MacroPreferencesSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, format=None):
        # Update the authenticated user's macro preferences.
        serializer = MacroPreferencesSerializer(
            instance=request.user,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        # Return full user info
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)






