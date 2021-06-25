import logging
logging.getLogger("googleapiclient").setLevel(logging.WARNING)
logging.getLogger("urllib3").setLevel(logging.WARNING)
logging.getLogger("chardet").setLevel(logging.WARNING)

import time
import numpy as np
import torch
from torch.utils.data import TensorDataset, DataLoader
from transformers import AutoTokenizer, AutoModelForSequenceClassification

import json
from django.http import JsonResponse
from django.forms.models import model_to_dict
from django.views.decorators.csrf import csrf_exempt

from backend.nlp_backend.openIE import openIE
from backend.nlp_backend.spacyParser import SpacyParser
from backend.models import Relation, Component, Project, Asset, Requirement, Sentence, Word, Task, AssetText

from DAM4KMU.settings import api_key, cse_id

#===================================================
#===================================================
#=                 Initialization                  =
#===================================================
#===================================================

sp = SpacyParser()
oie = openIE(sp.nlp, api_key, cse_id)


print("\nInitializing Natural Language Interference Module...")
print("Loading XLM-RoBERTa for Natural Language Interference")
start_time = time.time()
xlmr_tokenizer = AutoTokenizer.from_pretrained("joeddav/xlm-roberta-large-xnli")
xlmr_model = AutoModelForSequenceClassification.from_pretrained("joeddav/xlm-roberta-large-xnli")
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
xlmr_model.to(device)
print(f"Natural Language Interference Module is now ready, Initialization took {time.time()-start_time:<.2f}s.")

#===================================================
#===================================================
#=                   Spacy Parser                  =
#===================================================
#===================================================

hasArticle = ["der", "die", "das", "den", "des", "dem"]

def useSpacyNLP(text):
    data = []

    # empty case
    if text == "" or text is None:
        return JsonResponse(data, safe=False)
    
    # srl
    wordDictJson_srl = {'name': "srl", 'value':json.dumps(sp.listSRL)}
    data.append(wordDictJson_srl)

    # ner
    wordDictJson_ner = {'name': "ner", 'value':json.dumps(sp.listNER)}
    data.append(wordDictJson_ner)

    # req probability dict (F, F_B, NF, NF_B)
    probaDict = sp.extractText(text)
    data.append(probaDict)

    ## inopai dict
    inopai_dict = {
        "refObject": "",
        "object": "",
        "priority": "",
        "actor": "",
        "pRefObject": "",
        "processWord": "",
        "precision": "",
        "attribute": "",
        "attValue": ""
    }
    for sr in sp.listSRL:
        sr_type = sr["type"]
        sr_value = sr["value"]
        if sr_type not in inopai_dict or not inopai_dict[sr_type]:
            inopai_dict[sr_type] = sr_value
        else:
            inopai_dict[sr_type] += ", " + sr_value
    data.append(inopai_dict)

    # parent / child list dict
    data.append(sp.listParentChild)

    return data

@csrf_exempt
def extractText(request):
    print('{}\n{}\r\n{}\r\n\r\n{}'.format(
        '-----------START-----------',
        request.method + ' ' + str(request),
        '\r\n'.join('{}: {}'.format(k, v) for k, v in request.headers.items()),
        request.body
    ))

    text = json.loads(request.body.decode('utf-8')).get("text", None)
    data = useSpacyNLP(text)

    return JsonResponse(data, safe=False)

@csrf_exempt
def getRelatedComponentsFromProject(request):
    project_id = json.loads(request.body.decode('utf-8')).get("project_id", None)
    data = []
    relatedComponents = []
    rootComponents = []

    project = Project.objects.get(id=project_id)

    # filter relatedComponents and get all root components from the related one.
    for relatedAsset in project.allRelatedAssets:
        if relatedAsset.classType == "Comp":
            print("component detected with id: " + str(relatedAsset.id))
            relatedComponents.append(relatedAsset.id)
            currentRootComp = relatedAsset
          
            if relatedAsset.getRelationsWithRelType("hasChild", False):
                currentRootComp = getRootComponent(relatedAsset)
                
            if currentRootComp not in rootComponents:
                rootComponents.append(currentRootComp)

    for rootComponent in rootComponents:
        data.append(preorderTraversal(rootComponent, relatedComponents))

    return JsonResponse(data, safe=False)
    

def getRootComponent(childComponent):
    relations = childComponent.getRelationsWithRelType("hasChild", False)
    if relations:
        print("ahoyaa")
        if len(relations) != 1:
            return
        else:
            return getRootComponent(relations[0].first_asset)
    else:
        return childComponent
        

def preorderTraversal(rootComponent, relatedComponents):
    isExcluded = True
    relations = rootComponent.getRelationsWithRelType("hasChild", True)
    referece_relations = rootComponent.getRelationsWithRelType("isReferenceOf", False)
    old_parent_relations = rootComponent.getRelationsWithRelType("hasChild", False)
    ref_id = -1
    old_par_id = -1

    rootComponent = Component.objects.get(id=rootComponent.id)

    if referece_relations:
        ref_id = referece_relations[0].first_asset.id

    if old_parent_relations:
        old_par_id = old_parent_relations[0].first_asset.id

    if rootComponent.id in relatedComponents:
        isExcluded = False

    if relations:
        children = []
        for relation in relations:
            children.append(preorderTraversal(relation.second_asset, relatedComponents))
        return {"name": rootComponent.name, "cost": rootComponent.cost, "comp_id": rootComponent.id, "ref_id": ref_id, "old_parent_id": old_par_id,"isExcluded": isExcluded, "children": children}
    else:
        return {"name": rootComponent.name, "cost": rootComponent.cost, "comp_id": rootComponent.id, "ref_id": ref_id, "old_parent_id": old_par_id, "isExcluded": isExcluded}

def preorderTraversalDownshift(downshiftedComponent):
    relations = downshiftedComponent.getRelationsWithRelType("hasChild", True)
    downshiftedComponent = Component.objects.get(id=downshiftedComponent.id)
    ## add a new object with a reference to the autocomplete comp id
    if relations:
        children = []
        for relation in relations:
            children.append(preorderTraversalDownshift(relation.second_asset))
        return {"name": downshiftedComponent.name, "cost": downshiftedComponent.cost, "comp_id": -1, "ref_id": downshiftedComponent.id, "old_parent_id": -1, "isExcluded": False, "children": children, "expanded": True}
    else:
        return {"name": downshiftedComponent.name, "cost": downshiftedComponent.cost, "comp_id": -1, "ref_id": downshiftedComponent.id, "old_parent_id": -1, "isExcluded": False}

@csrf_exempt
def getRelatedComponentsFromDownshift(request):
    def _findToEditCellFromTreeData(treeData, newData):
        for i, data in enumerate(treeData):
            if data["comp_id"] == -2:
                print("found the to edit data in tree data")
                treeData[i] = newData
            elif "children" in data:
                _findToEditCellFromTreeData(data["children"], newData)
        return treeData

    comp_id = json.loads(request.body.decode('utf-8')).get("comp_id", None)
    treeData = json.loads(request.body.decode('utf-8')).get("treeData", None)
    comp_id = comp_id["comp_id"]
    treeData = treeData["treeData"]
    
    data = []
    
    component = Component.objects.get(id=comp_id)
    newData = preorderTraversalDownshift(component)
    treeData = _findToEditCellFromTreeData(treeData, newData)
    data = treeData
    print(data)
    return JsonResponse(data, safe=False)
    
@csrf_exempt
def getFilteredComponentsAutocompleteSuggestion(request):
    components = Component.objects.all()
    filtered_component = []
    for component in components:
        if not component.getRelationsWithRelType("isReferenceOf", False):
            filtered_component.append({"name": component.name, "id": component.id})

    print(filtered_component)
    return JsonResponse(filtered_component, safe=False)

@csrf_exempt
def saveButtonComponentWizard(request):
    def _preorderTraversalSaveButtonComponentWizard(element, parent_id, project_id, doUpdate):
        name = element["name"]
        comp_id = element["comp_id"]
        ref_id = element["ref_id"]
        cost = element["cost"]
        isExcluded = element["isExcluded"]
        new_parent_id = comp_id

        print(element)
        ## publish new Component
        if comp_id == -1:
            comp = Component()
            comp.publishWithCost(name, cost)

            new_parent_id = comp.id
            compAsset = Asset.objects.latest('id')

            ## add Reference relation
            if ref_id != -1:
                rel = Relation()
                refAsset = Asset.objects.get(id=ref_id)
                rel.publish(refAsset, compAsset, "isReferenceOf")

            ## add Project relation
            if not isExcluded:
                rel = Relation()
                projectAsset = Asset.objects.get(id=project_id)
                rel.publish(projectAsset, compAsset, "contains")

            ## add Relation to Parent
            if parent_id:
                rel = Relation()
                parentAsset = Asset.objects.get(id=parent_id)
                rel.publish(parentAsset, compAsset, "hasChild")

        else:
            ## save existing component
            comp = Component.objects.get(id=comp_id)
            comp.name = name
            comp.cost = cost
            comp.save()

            compAsset = Asset.objects.get(id=comp_id)
            projectAsset = Asset.objects.get(id=project_id)

            ## Project relation
            if not isExcluded:
                try:
                    rel = Relation.objects.get(first_asset=projectAsset, second_asset=compAsset, type="contains")
                except Relation.DoesNotExist:
                    rel = Relation()
                    rel.publish(projectAsset, compAsset, "contains")
            else:
                try:
                    rel = Relation.objects.get(first_asset=projectAsset, second_asset=compAsset, type="contains")
                    rel.delete()
                except Relation.DoesNotExist:
                    rel = None

            ## update all reference components
            if doUpdate:
                comp.updateAllReferencesComponent()

        if 'children' in element:
            for childElement in element["children"]:
                print(f"Parent id for next children: {new_parent_id}")
                _preorderTraversalSaveButtonComponentWizard(childElement, new_parent_id, project_id, doUpdate)  

    treeData = json.loads(request.body.decode('utf-8')).get("treeData", None)
    toBeDeletedRelations = json.loads(request.body.decode('utf-8')).get("toBeDeletedRelations", None)
    project = json.loads(request.body.decode('utf-8')).get("projectId", None)
    doUpdate = json.loads(request.body.decode('utf-8')).get("updateAllReferencesComponent", None)

    ## delete unused Relation
    for relDict in toBeDeletedRelations:
        rel = Relation.objects.get(first_asset__id=relDict["parent_id"], second_asset__id=relDict["children_id"], type=relDict["rel_type"])
        print(f"This {rel} will be deleted")
        rel.delete()

    project_id = project["value"]
    for element in treeData:
        _preorderTraversalSaveButtonComponentWizard(element, None, project_id, doUpdate)

    return JsonResponse([], safe=False)          

@csrf_exempt
def submitRequirement(request):
    formJson = json.loads(request.body.decode('utf-8')).get("form", None)
    checkedComponents = json.loads(request.body.decode('utf-8')).get("checkedComponents", None)
    parentChildCheckedRelations = json.loads(request.body.decode('utf-8')).get("parentChildCheckedRelations", None)

    req_type = formJson["req_type"]["value"]
    req_category = formJson["req_category"]["value"]
    
    req_priority = "must"
    req_name = str(req_type) + "_"
    input_value = formJson["input_value"]
    
    srlDict = formJson["srl"] if "srl" in formJson else useSpacyNLP(input_value)

    print("---------------------------------")
    print(formJson)
    print(checkedComponents)
    print("---------------------------------")
    
    ## edit Requirement
    if "toEdit" in formJson:
        old_state = formJson["old_state"]
        old_sentence_text = formJson["old_sentence_text"]
        old_relations = formJson["old_relations"]
        old_requirement = Requirement.objects.get(id=old_state["id"])
        sentence = Sentence.objects.get(id=old_state["sentence"])
        
        ## adjust Req text, priority, category and type
        if old_sentence_text != input_value:
            sentence.deleteWords()
            sentence.text = input_value
            sentence.save()
            propertyDict = _publishWords(srlDict, sentence, input_value)
            req_name += str(propertyDict["assettext_name"]) + str(req_category)
            req_priority = str(propertyDict["assettext_priority"])

            old_requirement.name = req_name
            old_requirement.priority = req_priority
        
        old_requirement.type = req_type
        old_requirement.category = req_category
        old_requirement.save()
        reqAsset = Asset.objects.get(id=old_state["id"])

        ## Check old relation (if it has to be deleted)
        for old_relation in old_relations:
            if old_relation["delete"] == True:
                rel = Relation.objects.get(id=old_relation["id"])
                rel.delete()
    
    else:
        ## create Sentence
        sentence = Sentence()
        sentence.publish(input_value)

        ## create Requirement
        propertyDict = _publishWords(srlDict, sentence, input_value)
        req_name += str(propertyDict["assettext_name"]) + str(req_category)
        req_priority = str(propertyDict["assettext_priority"])
        
        req = Requirement()
        req.publish(sentence, req_name, req_type, req_category, req_priority)
        reqAsset = Asset.objects.latest('id')


    ## create Relation between Projects, Components and the requirement
    for project in formJson["projects"]:
        projectAsset = Asset.objects.get(id=project["value"])
        
        if "toEdit" in formJson:
            try:
                rel_pro_req = Relation.objects.get(first_asset=projectAsset, second_asset=reqAsset, type="contains")
            except Relation.DoesNotExist:
                rel_pro_req = Relation()
                rel_pro_req.publish(projectAsset, reqAsset, "contains")
        else:        
            rel_pro_req = Relation()
            rel_pro_req.publish(projectAsset, reqAsset, "contains")
        
        for comp in checkedComponents:
            splittedCompName = comp["comp_name"].split(' ', 1)
            for article in hasArticle:
                if article in splittedCompName[0].lower() and len(splittedCompName) > 1:
                    comp["comp_name"] = splittedCompName[1]
            if not comp["isExcluded"]:
                if comp["comp_id"] == -1:
                    compObj = Component()
                    compObj.publishWithCost(comp["comp_name"], comp["cost"])
                    compAsset = Asset.objects.latest('id')
                    comp["comp_id"] = compAsset.id
                else:
                    compAsset = Asset.objects.get(id=comp["comp_id"])

                try:
                    rel_pro_comp = Relation.objects.get(first_asset=projectAsset, second_asset=compAsset, type="contains")
                except Relation.DoesNotExist:
                    rel_pro_comp = Relation()
                    rel_pro_comp.publish(projectAsset, compAsset, "contains")

                try:
                    rel_req_comp = Relation.objects.get(first_asset=reqAsset, second_asset=compAsset, type="contains")
                except Relation.DoesNotExist:
                    rel_req_comp = Relation()
                    rel_req_comp.publish(reqAsset, compAsset, "contains")

            else:
                print(f"The component ({comp['comp_name']}, id:{comp['comp_id']}) is excluded from the requirement")
            
        mappedParentChildRelation = _get_map_id_for_parent_child_relations(checkedComponents, parentChildCheckedRelations)
        for mappedRel in mappedParentChildRelation:
            rel = Relation()
            if mappedRel["parent_id"] == -1:
                compObj = Component()
                compObj.publish(mappedRel["parent_name"])
                mappedRel["parent_id"] = Asset.objects.latest('id').id
            if mappedRel["child_id"] == -1:
                compObj = Component()
                compObj.publish(mappedRel["child_name"])
                mappedRel["child_id"] = Asset.objects.latest('id').id
            parentAsset = Asset.objects.get(id=mappedRel["parent_id"])
            childAsset = Asset.objects.get(id=mappedRel["child_id"])
            rel.publish(parentAsset, childAsset, "hasChild")

    return JsonResponse([], safe=False)

@csrf_exempt
def editWordInSentence(request):
    word = json.loads(request.body.decode('utf-8')).get("word", None)
    sentence_id = json.loads(request.body.decode('utf-8')).get("sentence_id", None)

    sentence = Sentence.objects.get(id=sentence_id)
    sp.extractText(sentence.text)
    original_word = ""

    for sr in sp.listSRL:
        if sr["position"] == word["position"]:
            original_word = sr["value"]

    if sentence.text.count(original_word) == 1:
        sentence.text = sentence.text.replace(original_word, word["text"])
    
    ## Define the right position to be edited from the sentence string
    ## Example: Die Flasche-Deckel muss die Flasche .... (Flasche occured 2 times)
    ## The position above only determine the position based on detected SRL not the actual word String
    else:
        print("TO DO occurence of the word are more than 1")

    print(sentence.text)
    sentence.save()


    return JsonResponse([], safe=False)

@csrf_exempt
def editComponentAfterEffect(request):
    comp_id = json.loads(request.body.decode('utf-8')).get("comp_id", None)
    comp_name = json.loads(request.body.decode('utf-8')).get("comp_name", None)
    comp_oldName = json.loads(request.body.decode('utf-8')).get("comp_oldName", None)
    print(f"compId: {comp_id}")
    print(f"compName: {comp_name}")
    print(json.loads(request.body.decode('utf-8')))
    comp = Component.objects.get(id=comp_id)
    relatedRequirementsId = []
    if comp_name == comp_oldName:
        pass
    else:
        for relatedAsset in comp.allRelatedAssets:
            if relatedAsset.classType == "Req":
                relatedRequirementsId.append(relatedAsset.id)
                print(f"relatedAssetId: {relatedAsset.id}")

        if relatedRequirementsId:
            for req_id in relatedRequirementsId:
                current_req = Requirement.objects.get(id=req_id)
                current_req.name = current_req.name.replace(comp_oldName, comp_name)
                current_req.save()
                
                ## change text in sentence
                sentence = current_req.sentence
                print(f"oldSentenceText: {sentence.text}")
                sentence.text = sentence.text.replace(comp_oldName, comp_name)
                sentence.save()
                print(f"SentenceText: {sentence.text}")

                ## change text in words
                words = sentence.words
                for word in words:
                    if word.text == comp_oldName:
                        print("found the word that are the same with the component")
                        word.text = comp_name
                        word.save() 

    return JsonResponse([], safe=False)


@csrf_exempt
def editReqPriorityAfterEffect(request):
    def _addKeinNegation(word):
        editedWord = " " + word
        kein_trigger = ["das", "ein"]
        keines_trigger = ["des", "eines"]
        keiner_trigger = ["der", "einer"]
        keine_trigger = ["die", "eine"]
        keinen_trigger = ["den", "einen"]
        keinem_trigger = ["dem", "einem"]

        if any(ele in word for ele in kein_trigger):
            for trigger in kein_trigger:
                editedWord = editedWord.replace(trigger, "kein")
        elif any(ele in word for ele in keines_trigger):
            for trigger in keines_trigger:
                editedWord = editedWord.replace(trigger, "keines")
        elif any(ele in word for ele in keiner_trigger):
            for trigger in keiner_trigger:
                editedWord = editedWord.replace(trigger, "keiner")
        elif any(ele in word for ele in keine_trigger):
            for trigger in keine_trigger:
                editedWord = editedWord.replace(trigger, "keine")
        elif any(ele in word for ele in keinen_trigger):
            for trigger in keinen_trigger:
                editedWord = editedWord.replace(trigger, "keinen")
        elif any(ele in word for ele in keinem_trigger):
            for trigger in keinem_trigger:
                editedWord = editedWord.replace(trigger, "keinem")
        else:
            editedWord = "kein " + word

        editedWord = editedWord[1:]
        return editedWord

    def _changePriorityEndsWord(basePriority):
        priority_dict = {
            "must": "muss",
            "should": "sollte",
            "will": "wird",
            "can": "kann",
            "must_not": "darf",
            "should_not": "sollte",
            "can_not": "kann",
            "will_not": "wird"
        }

        priority = priority_dict.get(basePriority, "muss")
        return priority

    priority = json.loads(request.body.decode('utf-8')).get("priority", None)
    sentence_id = json.loads(request.body.decode('utf-8')).get("sentence_id", None)

    sentence = Sentence.objects.get(id=sentence_id)
    words = sentence.getWords()
    sp.extractText(sentence.text)

    prio_word_obj = None
    object_word_obj = None
    prio_negation_word = ""

    negation_keys = ["nicht ", "kein ", "keinen ", "keinem ", "keiner ", "keine ", "keines ", "keins "]
    hasNegation =  any(ele in sentence.text for ele in negation_keys)

    prioHasNegation = "not" in priority

    for word in words:
        if word.type == "priority":
            prio_word_obj = word
        elif word.type == "object":
            object_word_obj = word

    if prio_word_obj:
        if hasNegation and not prioHasNegation:
            for key in negation_keys:
                if key in sentence.text:
                    sentence.text = sentence.text.replace(key, key[1:])
                    if key in object_word_obj.text:
                        object_word_obj.text = object_word_obj.text.replace(key, key[1:])
                        object_word_obj.save()
                    print(f"text after negation have been deleted: {sentence.text}")
                    break
        elif not hasNegation and prioHasNegation:
            if object_word_obj:
                sentence.text = sentence.text.replace(object_word_obj.text, _addKeinNegation(object_word_obj.text))
                print(f"text after negation have been added: {sentence.text}")
                object_word_obj.text = _addKeinNegation(object_word_obj.text)
                object_word_obj.save()
            else:
                prio_negation_word = " nicht"

        if sentence.text.count(prio_word_obj.text) == 1:
            priorityText = _changePriorityEndsWord(priority) + prio_negation_word
            sentence.text = sentence.text.replace(prio_word_obj.text, priorityText)
            print(f"text after priority have been changed: {sentence.text}")
            prio_word_obj.text = priorityText
            prio_word_obj.save()

        sentence.save()
    
    return JsonResponse([], safe=False)

@csrf_exempt
def getProjectEffortAndCost(request):
    project_id = json.loads(request.body.decode('utf-8')).get("project_id", None)
    data = {}

    project = Project.objects.get(id=project_id)
    effort_dict = project.project_effort
    cost_dict = project.project_cost
    start_date = project.start_date.date()
    end_date = project.end_date.date()
    
    data["start_date"] = start_date
    data["end_date"] = end_date
    data["id"] = project_id
    data["effort"] = effort_dict
    data["cost"] = cost_dict

    print(data)
    return JsonResponse(data, safe=False)

@csrf_exempt
def submitTask(request):
    formJson = json.loads(request.body.decode('utf-8')).get("form", None)
    checkedComponents = json.loads(request.body.decode('utf-8')).get("checkedComponents", None)
    parentChildCheckedRelations = json.loads(request.body.decode('utf-8')).get("parentChildCheckedRelations", None)

    task_start_date = formJson["task_start_date"]
    task_end_date = formJson["task_end_date"]
    task_effort = formJson["task_effort"]

    task_status = formJson["task_status"] if "toDupli" in formJson else formJson["task_status"]["value"]
    
    task_priority = "must"    
    task_name = str(task_status) + "_"
    input_value = "" if "toDupli" in formJson else formJson["input_value"]

    srlDict = formJson["srl"] if "srl" in formJson else useSpacyNLP(input_value)
    
    ## Edit Task
    if "toEdit" in formJson:
        old_state = formJson["old_state"]
        old_sentence_text = formJson["old_sentence_text"]
        old_relations = formJson["old_relations"]
        old_task = Task.objects.get(id=old_state["id"])
        sentence = Sentence.objects.get(id=old_state["sentence"])

        ## adjust Task text, priority and other properties
        if old_sentence_text != input_value:
            sentence.deleteWords()
            sentence.text = input_value
            sentence.save()
            propertyDict = _publishWords(srlDict, sentence, input_value)
            task_name += str(propertyDict["assettext_name"])
            task_priority = str(propertyDict["assettext_priority"])

            old_task.name = task_name
            old_task.priority = task_priority
        
        old_task.start_date = task_start_date 
        old_task.end_date = task_end_date
        old_task.effort = task_effort 
        old_task.status = task_status
        old_task.save()
        taskAsset = Asset.objects.get(id=old_state["id"])

        ## Check old relation (if it has to be deleted)
        for old_relation in old_relations:
            if old_relation["delete"] == True:
                rel = Relation.objects.get(id=old_relation["id"])
                rel.delete()

    else:   

        if "toDupli" in formJson:
            toDupliTaskID = formJson["task_id"]
            toDupliTask = Task.objects.get(id=toDupliTaskID)
            toDupliText = toDupliTask.sentence.text
            sentence = Sentence()
            sentence.publish(toDupliText)
            srlDict = useSpacyNLP(toDupliText)
            propertyDict = _publishWords(srlDict, sentence, toDupliText)
        else:
            ## create Sentence
            sentence = Sentence()
            sentence.publish(input_value)
            propertyDict = _publishWords(srlDict, sentence, input_value)

        ## create Task
        task_name += str(propertyDict["assettext_name"])
        task_priority = str(propertyDict["assettext_priority"])

        task = Task()
        task.publish(sentence, task_start_date, task_end_date, task_name, task_priority, task_status, task_effort)
        taskAsset = Asset.objects.latest('id')

    ## create Relation between Projects, Components and the requirement
    for project in formJson["projects"]:
        projectAsset = Asset.objects.get(id=project["value"])
        if "toEdit" in formJson:
            try:
                rel_pro_task = Relation.objects.get(first_asset=projectAsset, second_asset=taskAsset, type="contains")
            except Relation.DoesNotExist:
                rel_pro_task = Relation()
                rel_pro_task.publish(projectAsset, taskAsset, "contains")
        else:        
            rel_pro_task = Relation()
            rel_pro_task.publish(projectAsset, taskAsset, "contains")
        
        
        for comp in checkedComponents:
            splittedCompName = comp["comp_name"].split(' ', 1)
            for article in hasArticle: 
                if article in splittedCompName[0].lower() and len(splittedCompName) > 1:
                    comp["comp_name"] = splittedCompName[1]
            if not comp["isExcluded"]:
                if comp["comp_id"] == -1:
                    compObj = Component()
                    compObj.publishWithCost(comp["comp_name"], comp["cost"])
                    compAsset = Asset.objects.latest('id')
                    comp["comp_id"] = compAsset.id
                else:
                    compAsset = Asset.objects.get(id=comp["comp_id"])

                try:
                    rel_pro_comp = Relation.objects.get(first_asset=projectAsset, second_asset=compAsset, type="contains")
                except Relation.DoesNotExist:
                    rel_pro_comp = Relation()
                    rel_pro_comp.publish(projectAsset, compAsset, "contains")

                try:
                    rel_task_comp = Relation.objects.get(first_asset=taskAsset, second_asset=compAsset, type="contains")
                except Relation.DoesNotExist:
                    rel_task_comp = Relation()
                    rel_task_comp.publish(taskAsset, compAsset, "contains")

            else:
                print(f"The component ({comp['comp_name']}, id:{comp['comp_id']}) is excluded from the requirement")

        mappedParentChildRelation = _get_map_id_for_parent_child_relations(checkedComponents, parentChildCheckedRelations)
        for mappedRel in mappedParentChildRelation:
            rel = Relation()
            if mappedRel["parent_id"] == -1:
                compObj = Component()
                compObj.publish(mappedRel["parent_name"])
                mappedRel["parent_id"] = Asset.objects.latest('id').id
            if mappedRel["child_id"] == -1:
                compObj = Component()
                compObj.publish(mappedRel["child_name"])
                mappedRel["child_id"] = Asset.objects.latest('id').id
            parentAsset = Asset.objects.get(id=mappedRel["parent_id"])
            childAsset = Asset.objects.get(id=mappedRel["child_id"])
            rel.publish(parentAsset, childAsset, "hasChild")

    return JsonResponse([], safe=False)

@csrf_exempt
def getComponentsCostById(request):
    comps = json.loads(request.body.decode('utf-8'))
    data = []

    for comp in comps:
        cur_comp_dict = {}
        if comp["comp_id"] != -1:
            cur_component = Component.objects.get(id=comp["comp_id"])
            cur_comp_dict["comp_id"] = comp["comp_id"]
            cur_comp_dict["cost"] = cur_component.cost
            data.append(cur_comp_dict)
    
    return JsonResponse(data, safe=False)

@csrf_exempt
def getAllRelatedAssets(request):
    asset_ids = json.loads(request.body.decode('utf-8')).get("asset_ids", None)
    layout_type = json.loads(request.body.decode('utf-8')).get("layout_type", None)
    data = {}

    data_value = []
    for asset_id in asset_ids:
        related_assets_list = []
        asset = Asset.objects.get(id=asset_id)
        for relation in asset.allRelations:
            first_asset_type = ""
            second_asset_type = ""
            
            related_asset_id = -1
            related_asset_sentence = "- x -"

            if relation.first_asset.id == asset_id:
                first_asset = "[this edited Asset]"
            else:
                first_asset = relation.first_asset.name 
                first_asset_type = "[" + relation.first_asset.classType + "]"
                related_asset_id = relation.first_asset_id
                if first_asset_type == "[Req]" or first_asset_type == "[Task]":
                    current_asset_text = AssetText.objects.get(id=related_asset_id)
                    related_asset_sentence = current_asset_text.sentence.text
            if relation.second_asset.id == asset_id:
                second_asset = "[this edited Asset]"
            else:
                second_asset = relation.second_asset.name
                second_asset_type = "[" + relation.second_asset.classType + "]"
                related_asset_id = relation.second_asset_id
                if second_asset_type == "[Req]" or second_asset_type == "[Task]":
                    current_asset_text = AssetText.objects.get(id=related_asset_id)
                    related_asset_sentence = current_asset_text.sentence.text
            relatedAssetDict = {"related_asset_sentence": related_asset_sentence, "related_asset_id": related_asset_id, "id": relation.id, "type": relation.type, "first_asset": first_asset, "second_asset": second_asset, "first_asset_type": first_asset_type, "second_asset_type": second_asset_type, "delete": False}
            related_assets_list.append(relatedAssetDict)
        data_value.append({"asset_id": asset_id, "related_assets": related_assets_list})
    
    data["type"] = layout_type
    data["value"] = data_value
    return JsonResponse(data, safe=False)

@csrf_exempt
def getRelatedAssetFromProject(request):
    active_projects = json.loads(request.body.decode('utf-8')).get("active_projects", None)
    asset_type = json.loads(request.body.decode('utf-8')).get("asset_type", None)
    data = {}

    raw_data = []
    for project in active_projects:
        project_asset = Asset.objects.get(id=project["value"])
        for relatedAsset in project_asset.allRelatedAssets:
            if relatedAsset.classType == asset_type:
                if asset_type == "Req":
                    asset_text = Requirement.objects.get(id=relatedAsset.id)
                elif asset_type == "Task":
                    asset_text = Task.objects.get(id=relatedAsset.id)

                raw_data.append(model_to_dict(asset_text))

    asset_data = list({a['id']:a for a in raw_data}.values())
    data["type"] = asset_type
    data["value"] = asset_data
    return JsonResponse(data, safe=False)

@csrf_exempt
def getAssetTextWithNoRelatedProject(request):
    asset_type = request.body.decode('utf-8')
    data = {}
    asset_data = []
    asset_texts = []
    if asset_type == "Req":
        asset_texts = Requirement.objects.all()
    elif asset_type == "Task":
        asset_texts = Task.objects.all()

    for asset_text in asset_texts:
        if asset_text.hasRelatedProject:
            pass
        else:
            asset_data.append(model_to_dict(asset_text))

    data["value"] = asset_data
    data["type"] = asset_type

    return JsonResponse(data, safe=False)

@csrf_exempt
def getOpenTasks(request):
    asset_id = json.loads(request.body.decode('utf-8'))
    raw_data = []
    requirement_asset = Asset.objects.get(id=asset_id)
    for parentAsset in requirement_asset.allRelatedAssets:
        if parentAsset.classType == "Project":
            # project_asset = Asset.objects.get(id=parentRelatedAsset.id)
            for relatedAsset in parentAsset.allRelatedAssets:
                if relatedAsset.classType == "Task":
                    task = Task.objects.get(id=relatedAsset.id)
                    if task.status != "completed":
                        task_dict = model_to_dict(task)
                        task_dict["remaining_effort"] = task.remaining_effort
                        task_dict["completed_effort"] = task.completed_effort
                        raw_data.append(task_dict)

    data = list({a['id']:a for a in raw_data}.values())
    print(data)
    return JsonResponse(data, safe=False)

@csrf_exempt
def getExistingComponentsWithSameName(request):
    comp_names = json.loads(request.body.decode('utf-8'))
    data = []
    for name in comp_names:
        existing_comps_dict_list = []
        existing_comps = Component.objects.all().filter(name=name)
        for existing_comp in existing_comps:
            comp_dict = model_to_dict(existing_comp)
            existing_comps_dict_list.append(comp_dict)

        data.append({"name": name, "existing_comps": existing_comps_dict_list})
    
    print(data)
    return JsonResponse(data, safe=False)

def _publishWords(srlDict, sentence, input_value) :
    name = ""
    priority = "must"
    priority_must_key = ["muss", "müssen", "musst", "müsst", "musste", "mussten", "musstet", "musstest"]
    priority_should_key = ["sollte, soll, sollen, sollt, sollst, solltest, solltet, sollten"]
    priority_will_key = ["werde", "wirst", "wird", "werden", "werdet", "wurde", "wurdest", "wurden", "wurdet"]
    priority_can_key = ["kann", "darf", "darfst", "dürfen", "dürft", "durfte", "durftest", "durften", "durftet",
     "kannst", "können", "könnt", "konnte", "konntest", "konntet", "konnten"]

    name_key = ["refObject", "component", "attribute", "attValue", "processWord"]
    negation_key = ["nicht", "kein"]
    hasNegation =  any(ele in input_value for ele in negation_key)
    
    ## create Words
    for srl in json.loads(srlDict[0]["value"]):
        word = Word()
        position = srl["position"]
        word_type = srl["type"].split("_")[0]
        text = srl["value"]
        
        ## todo later change with the actual ner
        entity_type = "none"
        
        if word_type == "pRefObject":
            word_type = "parent"
        
        if word_type == "priority":
            if any(text in key for key in priority_must_key):
                priority = "must"
            elif any(text in key for key in priority_should_key):
                priority = "should"
            elif any(text in key for key in priority_will_key):
                priority = "will"
            elif any(text in key for key in priority_can_key):
                priority = "can"
            if hasNegation and not "not" in priority:
                priority += "_not"
        
        if any(word_type in key for key in name_key):
            name += str(text) + "_"

        word.publishWithPosition(text, word_type, sentence, position, entity_type)

    return {"assettext_name": name, "assettext_priority": priority}

def _get_map_id_for_parent_child_relations(components, parent_child_relation):
    mapped_parent_child_relations = []
    for rel in parent_child_relation:
        if not rel["isExcluded"]:
            mapped_rel = {"parent_id": -1, "child_id": -1, "parent_name": rel["parent"], "child_name": rel["children"][0]}
            for comp in components:
                if comp["comp_name"] == rel["parent"]:
                    mapped_rel["parent_id"] = comp["comp_id"]
                elif comp["comp_name"] == rel["children"][0]:
                    mapped_rel["child_id"] = comp["comp_id"]
            
            mapped_parent_child_relations.append(mapped_rel)

    return mapped_parent_child_relations


#===================================================
#===================================================
#=             OpenIE / Research Assistant         =
#===================================================
#===================================================

@csrf_exempt
def getWebInformation(request):
    text = json.loads(request.body.decode('utf-8')).get("text", None)
    doc = oie.nlp(text)
    parent_child_recommendations, parent_child_ranking_possible, sentence_recommendations = oie.getWebInformation(doc)
    full_result = {"context": text, "parent_child_ranking_possible": parent_child_ranking_possible, "parent_child": parent_child_recommendations, "recommended_sentences": sentence_recommendations}
    return JsonResponse(full_result, safe=False)

#===================================================
#===================================================
#=                    NLI Module                   =
#===================================================
#===================================================

@csrf_exempt
def getNLIResults(request, max_len = 128, batch_size = 16):

    premise = json.loads(request.body.decode('utf-8')).get("text", None)

    print("\nGet Natural Language Inference for: \n", premise)

    # Get all Sentences from Database
    hypothesis_sentences = []
    for sent in Sentence.objects.all():
        hypothesis_sentences.append(sent)
    
    # Tokenize Premise and Hypothesis-Pair
    input_ids_ar = []
    attn_masks_ar = []
    for hypothesis_sentence in hypothesis_sentences: 
        
        # Get text from setentence object    
        hypothesis = hypothesis_sentence.text
        # Convert sentence pairs to input IDs, with attention masks.
        encoded_dict = xlmr_tokenizer.encode_plus(premise, hypothesis, 
                                                  max_length=max_len, 
                                                  padding='max_length',
                                                  truncation=True, 
                                                  return_tensors='pt')

        input_ids_ar.append(encoded_dict['input_ids'])
        attn_masks_ar.append(encoded_dict['attention_mask'])

    # If no sentences are available, break – otherwise runtime error because of empty tensor.
    if not input_ids_ar:
        full_result = {"context": premise, "conflict_ids": [], "conflicts": []}
        return JsonResponse(full_result, safe=False)

    # Convert each Python list of Tensors into a 2D Tensor matrix.
    input_ids_ar = torch.cat(input_ids_ar, dim=0)
    attn_masks_ar = torch.cat(attn_masks_ar, dim=0)

    # Construct a TensorDataset from the encoded examples.
    dataset = TensorDataset(input_ids_ar, attn_masks_ar)

    # And a dataloader for handling batching.
    prediction_dataloader = DataLoader(dataset, batch_size=batch_size)

    # Put model in evaluation mode
    xlmr_model.eval()

    # Tracking variables 
    predictions = []

    # Predict 
    for batch in prediction_dataloader:

        # Add batch to GPU
        batch = tuple(t.to(device) for t in batch)

        # Unpack the inputs from our dataloader
        b_input_ids, b_input_mask = batch

        # Telling the model not to compute or store gradients, saving memory and 
        # speeding up prediction
        with torch.no_grad():
            # Forward pass, calculate logit predictions
            outputs = xlmr_model(b_input_ids, attention_mask=b_input_mask)

        logits = outputs[0]

        # Move logits and labels to CPU
        logits = logits.detach().cpu().numpy()

        # Store predictions and true labels
        predictions.append(logits)

    # Combine the results across all batches.
    flat_predictions = np.concatenate(predictions, axis=0)

    # For each sample, pick the label (0, 1, or 2) with the highest score.
    predicted_labels = np.argmax(flat_predictions, axis=1).flatten()

    #Get Conflicts (Label: 0)
    conflict_idx = np.where(predicted_labels == 0)[0]
    conflicts = np.array(hypothesis_sentences)[conflict_idx] 

    print("Found conflict of ", premise," with:")
    conflict_list = []
    conflict_id_list = []
    for conflict in conflicts:
        print(conflict.id, conflict.text)
        conflict_list.append(conflict.text)
        conflict_id_list.append(conflict.id)

    #Get Entailment (Label: 2)
    entailment_idx = np.where(predicted_labels == 2)[0]
    entailments = np.array(hypothesis_sentences)[entailment_idx] 

    print("Found entailment of ", premise," with:")
    entailment_list = []
    entailment_id_list = []
    for entailment in entailments:
        print(entailment.id, entailment.text)
        entailment_list.append(entailment.text)
        entailment_id_list.append(entailment.id)

    full_result = {"context": premise, "conflict_ids": conflict_id_list, "conflicts": conflict_list, "entailment_ids": entailment_id_list, "entailments": entailment_list}

    return JsonResponse(full_result, safe=False)