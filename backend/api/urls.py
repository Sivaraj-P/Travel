from django.urls import path,include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView
)
from .views import UserViewset,ProjectViewSet,TravelViewSet
from rest_framework.routers import DefaultRouter
urlpatterns = [
    path('token', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/blacklist', TokenBlacklistView.as_view(), name='token_refresh'),

]


router = DefaultRouter()
router.register(r'users',UserViewset,basename="users")
router.register(r'projects', ProjectViewSet,basename="projects")
router.register(r'travel', TravelViewSet,basename="travel")


urlpatterns+=[
    path("",include(router.urls))
]