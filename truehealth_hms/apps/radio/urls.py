from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'orders', views.XRayOrderViewSet)

urlpatterns = [
    path('', views.index, name='radio_index'),
    path('dashboard/', views.dashboard, name='radio_dashboard'),
    path('api/', include(router.urls)),
]
