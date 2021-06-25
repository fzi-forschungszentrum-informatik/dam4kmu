from rest_framework import routers
from django.urls import path, include

from backend import views
from .api import AssetViewSet, ItemViewSet, RequirementViewSet, TaskViewSet, SentenceViewSet, WordViewSet, RelationViewSet, ProjectViewSet, ComponentViewSet

# register from api.py
router = routers.DefaultRouter()
router.register('api/assets', AssetViewSet, 'assets')
router.register('api/items', ItemViewSet, 'items')
router.register('api/requirements', RequirementViewSet, 'requirements')
router.register('api/tasks', TaskViewSet, 'tasks')
router.register('api/sentences', SentenceViewSet, 'sentences')
router.register('api/words', WordViewSet, 'words')
router.register('api/relations', RelationViewSet, 'relations')
router.register('api/projects', ProjectViewSet, 'projects')
router.register('api/components', ComponentViewSet, 'components')

urlpatterns = [
    path("home", views.home, name="home"),
    path("backend/<name>", views.requirement, name="requirement"),
    path("", include(router.urls)),
]