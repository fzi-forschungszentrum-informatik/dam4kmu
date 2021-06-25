from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Asset, Item, Requirement, Task, Sentence, Word, Project, Component, Relation
from .serializers import AssetSerializer, ItemSerializer, RequirementSerializer, TaskSerializer, SentenceSerializer, WordSerializer, ComponentSerializer, ProjectSerializer, RelationSerializer

class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    permission_classes = [
        permissions.AllowAny
    ]
    serializer_class = ItemSerializer

class AssetViewSet(viewsets.ModelViewSet):
    queryset = Asset.objects.all()
    permission_classes = [
        permissions.AllowAny
    ]
    serializer_class = AssetSerializer
    
    def list(self, request):
        queryset = Asset.objects.all()
        serializer = AssetSerializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class RequirementViewSet(viewsets.ModelViewSet):
    queryset = Requirement.objects.all()
    permission_classes = [
        permissions.AllowAny
    ]
    serializer_class = RequirementSerializer

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    permission_classes = [
        permissions.AllowAny
    ]
    serializer_class = TaskSerializer

class RelationViewSet(viewsets.ModelViewSet):
    queryset = Relation.objects.all()
    permission_classes = [
        permissions.AllowAny
    ]
    serializer_class = RelationSerializer

class ComponentViewSet(viewsets.ModelViewSet):
    queryset = Component.objects.all()
    permission_classes = [
        permissions.AllowAny
    ]
    serializer_class = ComponentSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    permission_classes = [
        permissions.AllowAny
    ]
    serializer_class = ProjectSerializer

class SentenceViewSet(viewsets.ModelViewSet):
    queryset = Sentence.objects.all()
    permission_classes = [
        permissions.AllowAny
    ]
    serializer_class = SentenceSerializer

class WordViewSet(viewsets.ModelViewSet):
    queryset = Word.objects.all()
    permission_classes = [
        permissions.AllowAny
    ]
    serializer_class = WordSerializer