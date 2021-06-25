from django.db import models
from django.utils import timezone
from tinymce.models import HTMLField
from django.contrib.auth.models import User
from django.db.models import Q

import numpy as np
from datetime import datetime
from jsonfield import JSONField

############################################
############## Enumeration #################
############################################

RELTYPE_GENERAL = (
    ('dependsOn', 'abhängen von'),
    ('contains', 'enthalten'),
    ('restricts', 'einschränken'),
    ('isCopyOf', 'eine Kopie von'), # changing children parameter is optional
    ('isReferenceOf', 'eine Referenz von'),
    ('extends', 'erweitern'), # changing children parameter is a must! Or change relation to copy of
    ('revise', 'überarbeiten'),
    ('hasChild', 'hat ein Kind'), #other better name?
    ('hasAttribute', 'hat ein Attribute')
    )

# Enum or as Model? can user define new sentence template?
SENTENCE_TEMPLATE = (
    ('F-R', 'Funktionale Anforderung'),
    ('NF-R', 'Nicht-funktionale Anforderung'),
    ('Task', 'Aufgabe')
)

REQ_TYPE = (
    ('F-R','Funktionale Anforderung'),
    ('NF-R','Nicht-funktionale Anforderung'),
    ('FB-R', 'Funktionale Anforderung mit Bedingung'),
    ('NFB-R', 'Nicht-funktionale Anforderung mit Bedingung'),
    ('unknown', 'unbekannt')
    )

# still needed?
REQ_CATEGORY = (
    ('business', 'Business'),
    ('norm_law', 'Normen und Gesetze'),
    ('product', 'Produkt'),
    ('plc', 'Produktlebenszyklus'),
    ('design', 'Gestalt Design')
    )

SRL = (
    ('refObject', 'Bezugsobjekt'),
    ('object', 'Objekt'),
    ('actor', 'Actor'),
    ('parent', 'Eltern'),
    ('priority', 'Priorität'),
    ('attribute', 'Attribut'),
    ('attValue', 'Attributwert'),
    ('processWord', 'Prozesswort'),
    ('precision', 'Präzision'),
    ('condition', 'Kondition'),
    ('comparisonObject', 'Vergleichsobjekt')
)

NER =  (
    ('none', 'nichts'),
    ('component', 'Komponente')
)

STATUS = (
    ('in_examination', 'in_prüfung'),
    ('approved', 'freigegeben')
)

TASK_STATUS = (
    ('open', 'offen'),
    ('in_processing', 'in_bearbeitung'),
    ('in_examination', 'in_prüfung'),
    ('completed', 'fertiggestellt')
)

TASK_PRIORITY = (
    ('must', 'muss'),
    ('should', 'sollte'),
    ('will', 'wird'),
    ('can', 'kann'),
)

PRIORITY = (
    ('must', 'muss'),
    ('should', 'sollte'),
    ('will', 'wird'),
    ('can', 'kann'),
    ('must_not', 'darf_nicht'),
    ('should_not', 'sollte_nicht'),
    ('can_not', 'kann_nicht'),
    ('will_not', 'wird_nicht')
)

STATEMENT_TYPE = (
    ('atomicValue', 'Atomwert'),
    ('statement', 'Aussage')
)


############################################
############### Data Model #################
############################################
class WebResults(models.Model):
    title = models.CharField(max_length=80, verbose_name="Title")
    link = models.CharField(max_length=80, verbose_name="Link")
    content =  JSONField()
    search_query = models.CharField(max_length=80, verbose_name="Search Query")
    added_on = models.DateTimeField(verbose_name="Timestamp", default=timezone.now)

    def publish(self, title, link, content, search_query):
        self.title = title
        self.link = link
        self.content = content
        self.search_query = search_query
        self.save()


class Sentence(models.Model):
    text = models.CharField(max_length=300, verbose_name="Text")
    
    def publish(self, text):
        self.text = text
        self.save()

    def getWords(self):
        return Word.objects.filter(sentence=self)
    
    def deleteWords(self):
        if self.words:
            for word in self.words:
                word.delete()

    words = property(getWords)


class Word(models.Model):
    text = models.CharField(max_length=80, verbose_name="Text")
    sentence = models.ForeignKey(Sentence, verbose_name="Sätze", related_name='sentence', on_delete=models.CASCADE)
    type = models.CharField(choices=SRL, verbose_name="Word-Typ", max_length=50)
    entityType = models.CharField(choices=NER, verbose_name="Entity-Typ", max_length=50, default="none")
    position = models.IntegerField(verbose_name="Position", default=0)

    def publish(self, text, type, sentence):
        self.text = text
        self.type = type
        self.sentence = sentence
        self.save()

    def publishWithPosition(self, text, type, sentence, position, entityType):
        self.text = text
        self.type = type
        self.sentence = sentence
        self.position = position
        self.entityType = entityType
        self.save()


class Item(models.Model):
    description = models.CharField(max_length=200, verbose_name="Beschreibung", blank=True, null=True)
    archieved = models.BooleanField(verbose_name="Veraltet", default=False)
    author = models.ManyToManyField('auth.User', related_name="author+", blank=True, verbose_name="Autor")
    creation_date = models.DateTimeField(verbose_name="Erstellungs_Datum", default=timezone.now)


class Asset(Item):
    name = models.CharField(max_length=100, verbose_name="Name")
    version = models.PositiveIntegerField(verbose_name="Version", default=0) 
    subversion = models.PositiveIntegerField(verbose_name="Subversion", default=0) 
    reviewer = models.ManyToManyField('auth.User', related_name="reviewer+", blank=True, verbose_name="Reviewer")

    def getAllRelations(self):
        return Relation.objects.filter(Q(first_asset=self) | Q(second_asset=self))

    def getRelationsWithRelType(self, relType, firstPos):
        if firstPos:
            return Relation.objects.filter(Q(first_asset=self), Q(type=relType))
        else:
            return Relation.objects.filter(Q(second_asset=self), Q(type=relType))
    
    def deleteRelationsWithRelType(self, relType, firstPos):
        relations = self.getRelationsWithRelType(relType, firstPos)
        for relation in relations:
            relation.delete()

    def get_child_asset(self):
        if hasattr(self, 'project'):
            return "Project"
        
        elif hasattr(self, 'assettext'):
            assetText = AssetText.objects.get(id=self.id)
            if hasattr(assetText, 'requirement'):
                return "Req"
            elif hasattr(assetText, 'task'):
                return "Task"
           
        elif hasattr(self, 'assetitem'):
            assetItem = AssetItem.objects.get(id=self.id)
            if hasattr(assetItem, 'component'):
                return "Comp"
            else:
                return "unknown"

    allRelations = property(getAllRelations)
    classType = property(get_child_asset)
    
    def getAllRelatedAssets(self):
        assets = set()
        for relation in self.allRelations:
            assets.add(relation.first_asset)
            assets.add(relation.second_asset)

        return assets

    allRelatedAssets = property(getAllRelatedAssets)        
    
class Relation(Item):
    first_asset = models.ForeignKey(Asset, verbose_name="Erstes Asset", related_name="first_asset", on_delete=models.CASCADE)
    second_asset = models.ForeignKey(Asset, verbose_name="Zweites Asset", related_name="second_asset", on_delete=models.CASCADE)
    type = models.CharField(choices=RELTYPE_GENERAL, max_length=50)

    def publish(self, first_asset, second_asset, type):
        self.first_asset = first_asset
        self.second_asset = second_asset
        self.type = type
        self.save()


class Project(Asset):
    start_date = models.DateTimeField(verbose_name="Startterimin", default=timezone.now)
    end_date = models.DateTimeField(verbose_name="Zieltermin", blank=True, null=True)
    customer = models.ManyToManyField('auth.User', related_name="customer+", blank=True, verbose_name="Kunden")
    budget = models.FloatField(verbose_name="Budget", default=0)
    manpower = models.FloatField(verbose_name="Verfügbares Personal", default=0)
    
    # Better solution for this attribute to be defined in User model 
    cost_per_hour = models.FloatField(verbose_name="Kosten pro Stunde", default=10)

    def get_total_days(self):
        return np.busday_count(self.start_date.date(), self.end_date.date())
    
    def get_elapsed_days(self):
        today_date = datetime.now(timezone.utc)
        # d2 = datetime.strptime(self.start_date, "%Y-%m-%d")
        return np.busday_count(self.start_date.date(), today_date.date())

    def getAllRelatedTaskID(self):
        related_tasks_id = []
        related_assets= self.allRelatedAssets
        for related_asset in related_assets:
            if related_asset.classType == "Task":
                related_tasks_id.append(related_asset.id)
        return related_tasks_id

    def getAllRelatedComponentsID(self):
        related_components_id = []
        related_assets = self.allRelatedAssets
        for related_asset in related_assets:
            if related_asset.classType == "Comp":
                related_components_id.append(related_asset.id)
        return related_components_id

    tasksID = property(getAllRelatedTaskID)
    componentsID = property(getAllRelatedComponentsID)
    totalDays = property(get_total_days)
    elapsedDays = property(get_elapsed_days)

    def getProjectEffortDict(self):
        effort_dict = {
            "remaining": 0,
            "completed": 0,
            "total": self.manpower * 8 * self.totalDays,
            "elapsed": self.manpower * 8 * self.elapsedDays
        }

        remaining = 0
        completed = 0

        for task_id in self.tasksID:
            task = Task.objects.get(id=task_id)
            remaining += task.remaining_effort
            completed += task.completed_effort

        effort_dict["remaining"] = remaining
        effort_dict["completed"] = completed

        return effort_dict
    
    project_effort = property(getProjectEffortDict)

    def getProjectCostDict(self):
        cost_dict = {
            "remaining": 0,
            "completed": 0,
            "comp_cost": 0,
            "cost_per_hour": self.cost_per_hour,
            "total": self.budget
        }

        remaining = 0
        completed = 0
        comp_cost = 0

        for component_id in self.componentsID:
            comp = Component.objects.get(id=component_id)
            comp_cost += comp.cost
        
        remaining = self.project_effort["remaining"] * self.cost_per_hour
        completed = self.project_effort["completed"] * self.cost_per_hour

        cost_dict["remaining"] = remaining
        cost_dict["completed"] = completed
        cost_dict["comp_cost"] = comp_cost

        return cost_dict

    project_cost = property(getProjectCostDict)

class AssetText(Asset):
    sentence = models.OneToOneField(Sentence, verbose_name="Satz", on_delete=models.CASCADE, primary_key=True)
    def getHasRelatedProject(self):
        isRelated = False
        for related_asset in self.allRelatedAssets:
            if related_asset.classType == "Project":
                isRelated = True
                break
        
        return isRelated
    
    hasRelatedProject = property(getHasRelatedProject)

class Requirement(AssetText):
    type = models.CharField(choices=REQ_TYPE, verbose_name="Anforderungs-Typ", max_length=50)
    category = models.CharField(choices=REQ_CATEGORY, verbose_name="Anforderungs-Kategorie", max_length=20)
    status = models.CharField(choices=STATUS, verbose_name="Status", max_length=15, default=STATUS[0][0])
    priority = models.CharField(choices=PRIORITY, verbose_name="Priorität", max_length=15, default=PRIORITY[0][0])

    def publish(self, sentence, name, type, category, priority):
        self.sentence = sentence
        self.name = name
        self.type = type
        self.category = category
        self.priority = priority
        self.save()

class Task(AssetText):
    start_date = models.DateTimeField(verbose_name="Startterimin", default=timezone.now)
    end_date = models.DateTimeField(verbose_name="Zieltermin", blank=True, null=True)
    
    effort = models.FloatField(verbose_name="Aufwand", default=0)
    status = models.CharField(choices=TASK_STATUS, verbose_name="Status", max_length=15, default=TASK_STATUS[0][0])
    priority = models.CharField(choices=TASK_PRIORITY, verbose_name="Priorität", max_length=15, default=TASK_PRIORITY[0][0])

    def getStatusAsNumber(self):
        if self.status == "open":
            return 0.25
        elif self.status == "in_processing":
            return 0.5
        elif self.status == "in_examination":
            return 0.75
        else:
            return 1
    
    status_num = property(getStatusAsNumber)

    def getRemainingEffort(self):
        remaining_effort = (1 - self.status_num) * self.effort
        return remaining_effort

    remaining_effort = property(getRemainingEffort)

    def getCompletedEffort(self):
        completed_effort = self.status_num * self.effort
        return completed_effort

    completed_effort = property(getCompletedEffort)

    def publish(self, sentence, start_date, end_date, name, priority, status, effort):
        self.sentence = sentence
        self.start_date = start_date
        self.end_date = end_date
        self.name = name
        self.priority = priority
        self.status = status
        self.effort = effort
        self.save()

class AssetItem(Asset):
    pass

class Component(AssetItem):
    cost = models.FloatField(verbose_name="Kosten", default=0)

    def publish(self, text):
        self.name = text
        self.save()

    def publishWithCost(self, text, cost):
        self.name = text
        self.cost = cost
        self.save()

    def getAllReferencesComponent(self):
        components = []
        for relation in self.allRelations:
            if relation.type == "isReferenceOf":
                refComp = Component.objects.get(id=relation.second_asset.id)
                if refComp.id != self.id:
                    components.append(refComp)
        return components

    allReferencesComponent = property(getAllReferencesComponent)

    def updateAllReferencesComponent(self):
        if self.allReferencesComponent:
            for refComp in self.allReferencesComponent:
                refComp.name = self.name
                refComp.cost = self.cost
                refComp.save()