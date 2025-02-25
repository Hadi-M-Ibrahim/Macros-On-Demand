# apps/accounts/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth import authenticate

from .models import CustomUser
from .serializers import UserSerializer, RegistrationSerializer, LoginSerializer

class RegistrationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, format=None):
        serializer = RegistrationSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']

            # Check if the user already exists.
            if CustomUser.objects.filter(email=email).exists():
                return Response({"error": "User already exists."}, status=status.HTTP_400_BAD_REQUEST)
            
            # Create the user (using email as username).
            user = CustomUser(email=email, username=email)
            user.set_password(password)
            user.save()
            
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, format=None):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            user = authenticate(request, username=email, password=password)
            if user is not None:
                return Response(UserSerializer(user).data, status=status.HTTP_200_OK)
            return Response({"error": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

