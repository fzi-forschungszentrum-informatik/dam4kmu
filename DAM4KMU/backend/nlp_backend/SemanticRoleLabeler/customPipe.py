import os
import pandas as pd
from dateutil.parser import parse

import spacy
from spacy.matcher import Matcher
from spacy.tokens import Span
from spacy.tokens import Token
from spacy.tokens import Doc

class CustomPipe:
    def __init__(self, nlp):
        self.nlp = nlp
        Doc.set_extension("srl", default=[], force=True)
        Span.set_extension("srl", default = "", force=True)
        self.add_pipes()

    def add_pipes(self):       
        self.nlp.add_pipe(self.__refObject)
        self.nlp.add_pipe(self.__object)
        self.nlp.add_pipe(self.__actor)
        self.nlp.add_pipe(self.__pRefObject)
        self.nlp.add_pipe(self.__precision)
        self.nlp.add_pipe(self.__processWord)
        self.nlp.add_pipe(self.__comparisonObject)
        self.nlp.add_pipe(self.__attValue)
        self.nlp.add_pipe(self.__priority)
        
    ##########################################
    #####------Pipeline  Components------#####
    ##########################################

    def __refObject(self, doc):
        matcher_refObj = Matcher(self.nlp.vocab)
        pattern_refObj1 = [{"POS":{"IN":["NOUN","PROPN"]}, "DEP":{"IN":["sb","ROOT"]}}]
        matcher_refObj.add("refObjPattern", None, pattern_refObj1)
        matches_refObj = matcher_refObj(doc)
        
        i = 0
        for match_id, start, end in matches_refObj:
            spanStartEnd = _getTextSpan(doc[start])
            id = _setKBID(spanStartEnd, "10", i)
            
            role = _customNER_recognizer("refObject", doc[spanStartEnd["start"]:spanStartEnd["end"]], doc[start])
            
            if role == "refObject":
                doc._.srl = doc._.srl + [Span(doc, start, end, label = "component", kb_id = int(id) + 30000)]       
                doc[start:end]._.srl = "component"

            doc._.srl = doc._.srl + [Span(doc, spanStartEnd["start"], spanStartEnd["end"], label = role, kb_id = int(id))]       
            doc[spanStartEnd["start"]:spanStartEnd["end"]]._.srl = role
            i += 1

        return doc

    def __object(self, doc):
        matcher_obj = Matcher(self.nlp.vocab)
        pattern_obj1 = [{"POS":{"IN":["NOUN","PROPN"]}, "DEP":{"IN":["oa"]}}]
        matcher_obj.add("objPattern", None, pattern_obj1)
        matches_obj = matcher_obj(doc)

        i = 0
        for match_id, start, end in matches_obj:
            spanStartEnd = _getTextSpan(doc[start])
            id = _setKBID(spanStartEnd, "20", i)

            role = _customNER_recognizer("object", doc[spanStartEnd["start"]:spanStartEnd["end"]], doc[start])
            
            if role == "object":
                doc._.srl = doc._.srl + [Span(doc, start, end, label = "component", kb_id = int(id) + 30000)]       
                doc[start:end]._.srl = "component"

            doc._.srl = doc._.srl + [Span(doc, spanStartEnd["start"], spanStartEnd["end"], label = role, kb_id = int(id))]       
            doc[spanStartEnd["start"]:spanStartEnd["end"]]._.srl = role
            i += 1

        return doc

    def __actor(self, doc):
        matcher_actor = Matcher(self.nlp.vocab)
        pattern_actor1 = [{"POS":{"IN":["NOUN","PROPN"]}, "DEP":{"IN":["da"]}}]
        matcher_actor.add("actor", None, pattern_actor1)
        matches_actor = matcher_actor(doc)
        
        i = 0
        for match_id, start, end in matches_actor:
            spanStartEnd = _getTextSpan(doc[start])
            id = _setKBID(spanStartEnd, "30", i)
            
            doc._.srl = doc._.srl + [Span(doc, spanStartEnd["start"], spanStartEnd["end"], label = "actor", kb_id = int(id))]       
            doc[spanStartEnd["start"]:spanStartEnd["end"]]._.srl = "actor"
            i += 1

        return doc

    def __pRefObject(self, doc):
        matcher_pRefObj = Matcher(self.nlp.vocab)
        pattern_pRefObj1 = [{"POS":{"IN":["NOUN","PROPN"]}, "DEP":{"IN":["ag"]}}]
        matcher_pRefObj.add("pRefObjPattern", None, pattern_pRefObj1)
        matches_pRefObj = matcher_pRefObj(doc)
        
        i = 0
        for match_id, start, end in matches_pRefObj:
            spanStartEnd = _getTextSpan(doc[start])
            id = _setKBID(spanStartEnd, "40", i)
            
            doc._.srl = doc._.srl + [Span(doc, spanStartEnd["start"], spanStartEnd["end"], label = "pRefObject", kb_id = int(id))]       
            doc[spanStartEnd["start"]:spanStartEnd["end"]]._.srl = "pRefObject" 
            i += 1

        return doc

    def __precision(self, doc):
        matcher_precision = Matcher(self.nlp.vocab)
        pattern_precision = [{"POS":{"IN":["ADP", "ADV"]}, "DEP":{"IN":["mo", "mnr", "op"]}}]
        matcher_precision.add("precisionPattern", None, pattern_precision)
        matches_precision = matcher_precision(doc)
        
        i = 0
        for match_id, start, end in matches_precision:
            spanStartEnd = _getTextSpan(doc[start])
            id = _setKBID(spanStartEnd, "50", i)
            role = "precision"

            dt = _parseDate(doc[spanStartEnd["start"]:spanStartEnd["end"]])
            if not(dt == None):
                if doc[spanStartEnd["start"]].lemma_ == "bis":
                    role = "endDate;" + str(dt)
                else:
                    role = "startDate;" + str(dt)
                
            doc._.srl = doc._.srl + [Span(doc, spanStartEnd["start"], spanStartEnd["end"], label = role, kb_id = int(id))]       
            doc[spanStartEnd["start"]:spanStartEnd["end"]]._.srl = role
            i += 1

        return doc

    def __processWord(self,doc):
        matcher_processWord = Matcher(self.nlp.vocab)
        pattern_processWord = [{"POS":{"IN":["VERB", "AUX"]}, "DEP":{"IN":["oc", "cj", "mo"]}}]
        matcher_processWord.add("processWordPattern", None, pattern_processWord)
        matches_processWord = matcher_processWord(doc)
        
        spanStart = -1
        i = 0
        for i, (match_id, start, end) in enumerate(matches_processWord[:-1]):
            spanStartEnd = _getTextSpan(doc[start])
            id = _setKBID(spanStartEnd, "60", i)

            ## combining the text if it is next to each other
            if end == matches_processWord[i+1][1]:
                spanStart = start
            else:
                if spanStart == -1:
                    spanStart = start
                doc._.srl = doc._.srl + [Span(doc, spanStart, end, label = "processWord", kb_id = int(id))]       
                doc[spanStart:end]._.srl = "processWord"
                # reset spanStart
                spanStart = -1
            i += 1
            
        ## for last element
        if matches_processWord:
            spanStartEnd = _getTextSpan(doc[matches_processWord[-1][1]])
            id = _setKBID(spanStartEnd, "60", i)

            if spanStart == -1: 
                doc._.srl = doc._.srl + [Span(doc, matches_processWord[-1][1], matches_processWord[-1][2], label = "processWord", kb_id = int(id))]       
                doc[matches_processWord[-1][1]:matches_processWord[-1][2]]._.srl = "processWord"
            else:
                doc._.srl = doc._.srl + [Span(doc, spanStart, matches_processWord[-1][2], label = "processWord", kb_id = int(id))]       
                doc[spanStart:matches_processWord[-1][2]]._.srl = "processWord"
            
        return doc

    def __comparisonObject(self, doc):
        matcher_comparisonObject = Matcher(self.nlp.vocab)
        pattern_comparisonObject = [{"POS":{"IN":["NOUN","PROPN"]}, "DEP":{"IN":["cc", "pd"]}}]
        matcher_comparisonObject.add("comparisonObjectPattern", None, pattern_comparisonObject)
        matches_comparisonObject = matcher_comparisonObject(doc)
        
        i = 0
        for match_id, start, end in matches_comparisonObject:
            spanStartEnd = _getTextSpan(doc[start])
            id = _setKBID(spanStartEnd, "70", i)
 
            doc._.srl = doc._.srl + [Span(doc, spanStartEnd["start"], spanStartEnd["end"], label = "comparisonObject", kb_id = int(id))]       
            doc[spanStartEnd["start"]:spanStartEnd["end"]]._.srl = "comparisonObject"
            i += 1

        return doc

    def __attValue(self, doc):
        matcher_attValue = Matcher(self.nlp.vocab)
        pattern_attValue = [{"POS":{"IN":["ADJ"]}, "DEP":{"IN":["cc", "pd", "mo"]}}]
        matcher_attValue.add("attValuePattern", None, pattern_attValue)
        matches_attValue = matcher_attValue(doc)

        i = 0
        for match_id, start, end in matches_attValue:
            spanStartEnd = _getTextSpan(doc[start])
            id = _setKBID(spanStartEnd, "80", i)

            doc._.srl = doc._.srl + [Span(doc, spanStartEnd["start"], spanStartEnd["end"], label = "attValue", kb_id = int(id))]       
            doc[spanStartEnd["start"]:spanStartEnd["end"]]._.srl = "attValue"
            i += 1
            
        return doc

    def __priority(self, doc):
        matcher_prio = Matcher(self.nlp.vocab)
        PRIO_LEMMAS = ["muss", "müssen", "darf", "dürfen", "kann", "können", "soll", "sollen"]
        pattern_prio = [{"POS":"VERB", "TAG":"VMFIN", "LEMMA":{"IN":PRIO_LEMMAS}}]
        matcher_prio.add("pattern_prio", None, pattern_prio)
        matches_prio = matcher_prio(doc)

        i = 0
        for match_id, start, end in matches_prio:
            spanStartEnd = _getTextSpan(doc[start])
            id = _setKBID(spanStartEnd, "99", i)

            doc._.srl = doc._.srl + [Span(doc, spanStartEnd["start"], spanStartEnd["end"], label = "priority", kb_id = int(id))]       
            doc[spanStartEnd["start"]:spanStartEnd["end"]]._.srl = "priority"
            i += 1

        return doc            

########################################################
########## ----------Word  List---------################
########################################################

GUIDELINES = ["Richtlinie", "Artikel", "Beschluss"]

NOT_COMPONENT = ["Ja", "Monat", "Zeit"]

base_dir = os.path.dirname(__file__)
att_abs_path = os.path.join(base_dir, 'attributewordList.csv')
df = pd.read_csv(att_abs_path, sep=';', header=0, names=['nom'], dtype={'nom': str} )
att_words = set(df['nom'].tolist())

########################################################
########## -------Utility Methods-------################
########################################################

def _getTextSpan(token):
    spanStartEnd = {}
    start = token.i
    end = token.i + 1
    isConjugated = False
    hasNegation = False
    isGuideline = False

    if token.lemma_ in GUIDELINES:
        isGuideline = True

    for t in token.lefts:
        if (t.dep_ == "nk" or t.dep_ == "cm" or t.dep_ == "pnc") and t.i < start:
            start = t.i
            if t.pos_ == "NUM":
                start = min(start, _getTextSpan(t)["start"])

        if t.dep_ == "mo" and t.pos_ == "ADJ":
                start = min(start, _getTextSpan(t)["start"])
        
        if _checkNegation(t):
            hasNegation = True

    for t in token.rights:
        if t.dep_ == "nk" and t.i + 1 > end:
            recurToken = _getTextSpan(t)
            end = max(end, recurToken["end"])

        elif (t.dep_ == "cd" or t.dep_ == "cj") and t.i + 1 > end:
            conjugatedToken = _getTextSpan(t)
            end = max(end, conjugatedToken["end"])
            isConjugated = True

        if _checkNegation(t):
            hasNegation = True

    spanStartEnd["start"] = start
    spanStartEnd["end"] = end
    spanStartEnd["isConjugated"] = isConjugated
    spanStartEnd["hasNegation"] = hasNegation
    spanStartEnd["isGuideline"] = isGuideline
    return spanStartEnd

def _customNER_recognizer(semanticRole, span, startToken):
    role = ""
    if _isPerson(span) or startToken.orth_.startswith("@") :
        role = "person"
    elif _isAttribute(startToken):
        role = "attribute"
    elif _isNotComponent(startToken):
        role = "notComponent"
    else:
        role = semanticRole
    return role

def _parseDate(span):
    for token in span:
        if token.pos_ == "NOUN" or token.pos_ == "PROPN":
            text = token.orth_
            if text.startswith("//"):
                text = text[2:]
            try:
                dt = parse(text)
                return dt
            except:
                pass
    return None

def _setKBID(span, sr_id, i):
    id = sr_id + str(i)
    if span["isConjugated"]:
        id = "9" + id
    if span["hasNegation"]:
        id = "1" + id
    if span["isGuideline"]:
        id = "2" + id
    return id

def _checkNegation(token):
    if token.tag_ == "PIAT" or token.dep_ == "ng":
        return True
    return False

def _isPerson(span):
    ents = list(span.ents)
    for ent in ents:
        if ent.label_ == "PER" or ent.label_ == "PERSON":
            return True
    return False

def _isAttribute(token):
    lemma = token.lemma_
    if lemma in att_words or lemma.endswith("heit") or lemma.endswith("tät") or lemma.endswith("keit") or lemma.endswith("zahl"):
        return True
    else:
        return False

def _isNotComponent(token):
    lemma = token.lemma_
    if lemma in NOT_COMPONENT:
        return True
    else:
        return False