from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Project,Travel
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class UserTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        return token

    def validate(self, attrs):
        data = super(UserTokenObtainPairSerializer, self).validate(attrs)
        user = self.user
        user.save()
        data.update({"id":self.user.pk,'first_name':self.user.first_name,"last_name":self.user.last_name,"is_staff":user.is_staff})
        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'date_joined', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password')  
        user = User(**validated_data)  
        user.set_password(password)
        user.save()  
        return user

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'


class TravelSerializer(serializers.ModelSerializer):
    project_name = serializers.ReadOnlyField(source="project.name")  
    user_name=serializers.ReadOnlyField(source="user.username")
    class Meta:
        model = Travel
        exclude=["user"]
