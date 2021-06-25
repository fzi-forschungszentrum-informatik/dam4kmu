from django.contrib import admin
from django.urls import include, path
from django.conf.urls import url
from . import ajax

urlpatterns = [
    path('admin/', admin.site.urls),
    path("", include("frontend.urls")),
    path("", include("backend.urls")),
    path("tinymce/", include("tinymce.urls")),

    # axios or ajax
    url(r'^axios/extractText/$', ajax.extractText, name='extractText'),
    url(r'^axios/getRelatedComponentsFromProject/$', ajax.getRelatedComponentsFromProject, name='getRelatedComponentsFromProject'),
    url(r'^axios/getRelatedComponentsFromDownshift/$', ajax.getRelatedComponentsFromDownshift, name='getRelatedComponentsFromDownshift'),
    url(r'^axios/getFilteredComponentsAutocompleteSuggestion/$', ajax.getFilteredComponentsAutocompleteSuggestion, name='getFilteredComponentsAutocompleteSuggestion'),
    url(r'^axios/saveButtonComponentWizard/$', ajax.saveButtonComponentWizard, name='saveButtonComponentWizard'),
    url(r'^axios/submitRequirement/$', ajax.submitRequirement, name='submitRequirement'),
    url(r'^axios/submitTask/$', ajax.submitTask, name='submitTask'),
    url(r'^axios/editWordInSentence/$', ajax.editWordInSentence, name='editWordInSentence'),
    url(r'^axios/editReqPriorityAfterEffect/$', ajax.editReqPriorityAfterEffect, name='editReqPriorityAfterEffect'),
    url(r'^axios/editComponentAfterEffect/$', ajax.editComponentAfterEffect, name='editComponentAfterEffect'),
    url(r'^axios/getProjectEffortAndCost/$', ajax.getProjectEffortAndCost, name='getProjectEffortAndCost'),
    url(r'^axios/getComponentsCostById/$', ajax.getComponentsCostById, name='getComponentsCostById'),
    url(r'^axios/getAllRelatedAssets/$', ajax.getAllRelatedAssets, name='getAllRelatedAssets'),
    url(r'^axios/getRelatedAssetFromProject/$', ajax.getRelatedAssetFromProject, name='getRelatedAssetFromProject'),
    url(r'^axios/getAssetTextWithNoRelatedProject/$', ajax.getAssetTextWithNoRelatedProject, name='getAssetTextWithNoRelatedProject'),
    url(r'^axios/getOpenTasks/$', ajax.getOpenTasks, name='getOpenTasks'),
    url(r'^axios/getExistingComponentsWithSameName/$', ajax.getExistingComponentsWithSameName, name='getExistingComponentsWithSameName'),
    url(r'^axios/getWebInformation/$', ajax.getWebInformation, name='getWebInformation'),
    url(r'^axios/getNLIResults/$', ajax.getNLIResults, name='getNLIResults')
]
