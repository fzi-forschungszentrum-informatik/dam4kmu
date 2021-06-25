from django.urls import re_path, path
from . import views

urlpatterns = [
    path('', views.index),
    re_path('assetTextHome', views.index),
    re_path('reqTextHome', views.index),
    re_path('genInfoTextHome', views.index),
    re_path('taskTextHome', views.index),
    re_path('reqWizard', views.index),
    re_path('taskWizard', views.index),
    re_path('assetsTab', views.index),
    re_path('diagram', views.index),
    re_path('componentWizard', views.index),
    re_path('relationsTab', views.index),
    re_path('componentsTab', views.index),
    re_path('requirementsTab', views.index),
    re_path('sentencesTab', views.index),
    re_path('wordsTab', views.index),
    re_path('tasksTab', views.index),
    re_path('projectsTab', views.index)
]
