from rest_framework.generics import RetrieveUpdateDestroyAPIView
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny,IsAuthenticated
from django.contrib.auth.models import User
from .serializers import UserSerializer,ProjectSerializer,UserProjectsSerializer,TravelSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import Project,UserProjects,Travel
from .error_handler import serializer_error_handler
from rest_framework.views import APIView

class UserViewset(viewsets.ModelViewSet):
    queryset=User.objects.exclude(is_staff=True)
    serializer_class=UserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer_error_handler(serializer.errors,"detail"),status=status.HTTP_400_BAD_REQUEST)



class ProjectViewSet(viewsets.ModelViewSet):
    permission_classes=[IsAuthenticated]
    authentication_classes=[JWTAuthentication]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Project.objects.all() 
        return Project.objects.filter(is_active=True)
    serializer_class = ProjectSerializer



class TravelViewSet(viewsets.ModelViewSet):
    permission_classes=[IsAuthenticated]
    serializer_class = TravelSerializer
    authentication_classes=[JWTAuthentication]
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Travel.objects.all()
        return Travel.objects.filter(user=user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)