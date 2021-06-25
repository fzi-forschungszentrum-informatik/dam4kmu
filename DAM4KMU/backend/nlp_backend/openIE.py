import os
import time
import json 

import spacy
from spacy.matcher import Matcher
from spacy.lang.de import German

import torch
import numpy as np
import pandas as pd
from gensim.models import KeyedVectors
from sentence_transformers import SentenceTransformer, util

from .openIEModule.wikiDataCrawlerModule import WikiDataCrawler
from .openIEModule.webCrawlerModule import QueryGenerator, WebMiner

from backend.models import WebResults
from django.db.models import Q
from django.utils import timezone

class openIE:
    def __init__(self, nlp, api_key, cse_id):

        print("\nInitializing openInformationExtractor...")
        startTime = time.time()
        base_dir = os.path.dirname(__file__)

        print("Loading Spacy Pipeline")
        self.nlp = nlp

        print("Loading Web Crawlers")
        self.qg = QueryGenerator()
        self.webMiner = WebMiner(api_key, cse_id)
        self.wdc = WikiDataCrawler()

        print("Loading Vector Representations")
        w2v_rel_path = "germanwordembeddings.model"
        w2v_abs_path = os.path.join(base_dir, w2v_rel_path)
        self.word2vec_model = KeyedVectors.load_word2vec_format(w2v_abs_path, binary=True)

        print("Loading TextCat Model")
        textcat_rel_path = "textCatModel"
        textcat_abs_path = os.path.join(base_dir, textcat_rel_path)
        self.nlp_textcat = spacy.load(textcat_abs_path)

        print("Loading Sentence Transformer")
        device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.sentence_transformer = SentenceTransformer('distilbert-base-nli-stsb-mean-tokens').to(device)

        print(f"openInformationExtractor is now ready, Initialization took {time.time()-startTime :<.2f}s.")

    def getWebInformation(self, doc, percentil = 0.85, top_k = 5, use_wikidata = False):
        # Used in ajax.py: Creates context-dependant sentence and (parent-child) component recommendations

        # ================================================
        # Module 1: Run Web Crawler using Google Custom Search
        # ================================================
        # Get context information from the sentence: 
        # Detected components & generate a description for each component based on its corresponding adjectives
        print("\nFind Web Information for:\n", doc)
        context_components = [ent.lemma_ for ent in doc.ents if ent.label_ == "component"]
        print("Found components:\n", context_components)
        component_descriptions = self.qg.generateComponentDescription(doc, self.nlp)
        print("Generated adj-based component descripton:\n", component_descriptions)
        
        # Create search query based on the adj-based component descriptions
        query_list = self.qg.getQueryList(component_descriptions)
        print("# QUERIES " + str(len(query_list)) + ":")
        print(query_list)
        
        # Run query amd save results in the database
        dateTimeObj = timezone.now()
        for query_element in query_list:
            res = self.webMiner.addResultsToDB(query_element)
        
        # Load results from DB
        web_results = WebResults.objects.filter(Q(added_on__date=dateTimeObj.date(), added_on__time__gte=dateTimeObj.time()))
        print("______________________________")
        print(f"Loaded {len(web_results)} web_results")
        print("______________________________")
        
        # Extract Information from web_results
        print("Recommending new components...")
        relation_dict, sentence_dict, comp_freq = self.process_web_results(web_results)

        # ================================================
        # Module 2: Run Web Crawler using Wikidata Knowledge Graph
        # ================================================
        if use_wikidata:
            for i, component in enumerate(context_components):
                self.wdc.find_first_itemID(component, i)
                sparql_query = self.wdc.query_sparql_generator("P361")
                item_values = self.wdc.run_sparql(sparql_query, depth = 2)
                results = self.wdc.get_results()

            # Extract Information from wikidata results
            wd_relation_dict = self.wdc.get_relation_dict(len(context_components))
            # Merge wd_relation_dict with relation_dict
            relation_dict = self.merge_relation_dicts(relation_dict, wd_relation_dict)

        # ================================================
        # Module 3: Make Recommendations
        # ================================================
        # Recommend all components in the web-results with the highest word2vec-embeddings-similarity to the components in the context sentence 
        component_recommendations_json, ranking_possible, component_recommendations = self.findInterestingComponents(relation_dict, context_components, comp_freq, percentil)
        
        # Recommend all sentences in the sentence_dict with the highest similarity of its sentence_transformer_embeddings to the context sentence
        sentence_recommendations = self.findInterestingSentences(doc, sentence_dict, component_recommendations, top_k)

        # Delete data from DB
        WebResults.objects.all().delete()

        return component_recommendations_json, ranking_possible, sentence_recommendations
    
    def process_web_results(self, web_results):  
        # Go through all sentences in web_results and create the following dicts:
        # comp_freq: Map found component to its frequency
        # sentence_dict: Map sentence to its corresponding web page
        # relation_dict: Map parent-component to its corresponding set of child-components

        # Create sentence split pipeline
        nlpSplitSentence = German()
        sentencizer = nlpSplitSentence.create_pipe("sentencizer")
        nlpSplitSentence.add_pipe(sentencizer)

        # Iterate over each web_result
        parent_child_relation_triples = []
        sentence_dict = {}
        comp_freq = {}
        for row in web_results:  

            pageid = row.id
            title = row.title
            link = row.link
            content = row.content
            search_query = row.search_query
            added_on  = row.added_on

            # If no content found: skip
            if content=={}:
                continue
        
            # Load content of web_result
            content = json.loads(content)
            for key, item in content.items():
                wholeText = item['section'] 

                # Iterate over each sentence in content of the web_result
                for sent in nlpSplitSentence(wholeText).sents:
                    if sent.text != '.':
                        
                        # Call NLP pipeline for sentence
                        doc = self.nlp(sent.text)
                        
                        # Count frequency of all found components
                        for token in doc:
                            if token.ent_type_ == "component":
                                if "-" in token.text:
                                    hypen_word = token.text
                                    if hypen_word[-1] == "-":
                                        hypen_word = hypen_word[:-1]
                                        if "-" not in hypen_word:
                                            break

                                    hyphen_word_split = hypen_word.rsplit("-", 1)
                                    X = hyphen_word_split[0]
                                    hyphen_word_lemma = hyphen_word_split[0] + "-" + [token.lemma_ for token in self.nlp(hyphen_word_split[1])][0]
                                    comp_freq[hyphen_word_lemma] = comp_freq.get(hyphen_word_lemma, 0) + 1
                                else:
                                    comp_freq[token.lemma_] = comp_freq.get(token.lemma_, 0) + 1
                        
                        # Map sentence to its corresponding web page
                        sentence_dict[sent.text] = link
    
                        # Get parent-child-relation triples of the components
                        found_triples = self._getParentChildRelationTriples(doc)
                        if found_triples:
                            parent_child_relation_triples.extend(found_triples)

        # Create nested parent-child-relation dict
        relation_dict = {}
        for relation in parent_child_relation_triples:
            X, _, Y = relation
            if X in relation_dict:
                relation_dict[X]["childs"].add(Y)
            else:
                relation_dict[X] = {"childs": set(), "similarity": []}
                relation_dict[X]["childs"].add(Y)

        return relation_dict, sentence_dict, comp_freq

    def merge_relation_dicts(self, relation_dict, wd_relation_dict):
        # Merge relation_dict and wd_relation_dict
        for key, values in wd_relation_dict.items():
            if key in relation_dict:
                for value in values:
                    relation_dict[key]["childs"].add(value)
            else:
                relation_dict[key] = {"childs": set(), "similarity": []}
                for value in values:
                    relation_dict[key]["childs"].add(value)
        return relation_dict
        
    def findInterestingComponents(self, relation_dict, context_components, comp_freq, percentil):
        # Note: Its important to not _clear_token() the comps in relation_dict.keys() at this position 
        # as this would mess up the output dictionary. We save the unprocessed components.
        web_result_components = [comp for comp in relation_dict.keys()]
        cleared_context_components = [self._clear_token(comp) for comp in context_components if self._clear_token(comp) in self.word2vec_model.wv.vocab]
        
        # Step 1: Calculate word2vec-embeddings-similarity between the components in the web-results and in the context sentence 
        # Case 1: Ranking possible because context_components are part of the W2V-vocabulary
        if cleared_context_components:
            ranking_possible = True
            for target_word in cleared_context_components:
                for component in web_result_components:
                    cleared_component = self._clear_token(component)
                    if cleared_component not in self.word2vec_model.wv.vocab:
                        relation_dict[component]["similarity"].append(-0.1)
                    else:
                        similarity_score = self.word2vec_model.similarity(target_word, cleared_component)
                        relation_dict[component]["similarity"].append(similarity_score)

            sorted_relation_dict = {k: relation_dict[k]["childs"] for k in sorted(relation_dict.keys(), key=lambda x: self._get_average(relation_dict[x]['similarity']), reverse = True)}  
            similarity_scores = {k: self._get_average(relation_dict[k]['similarity']) for k in sorted(relation_dict.keys(), key=lambda x: self._get_average(relation_dict[x]['similarity']), reverse = True)}

        # Case 2: Ranking not possible because context_components are out of the W2V-vocabulary (OOV)
        else:
            print(f"All context_components are OOV. No ranking possible.")
            ranking_possible = False
            sorted_relation_dict = {k: relation_dict[k]["childs"] for k in relation_dict.keys()}
            similarity_scores = {}

        # Step 2: Recommend all components with a similarity in the top similarity_df_quantile quantile
        if similarity_scores:
            similarity_df = pd.DataFrame(similarity_scores.values())
            similarity_df_quantile = similarity_df.quantile(percentil)[0]
            component_recommendations = {k: v for k, v in sorted_relation_dict.items() if similarity_scores[k] > similarity_df_quantile}
        else:
            component_recommendations = {k: v for k, v in sorted_relation_dict.items()}

        # Step 3: Create JSON-Representation for the component recommendations
        # Create list with child-parent-pairs
        list_child_parent = []
        for parent, childs in component_recommendations.items():
            for child in childs:
                list_child_parent.append((child, parent))

        # Iterate over list with child-parent-pairs and create JSON-Representation
        has_parent = set()
        component_recommendations_json = []
        for child, parent in list_child_parent:
            parent_index = next((index for (index, d) in enumerate(component_recommendations_json) if d["title"] == parent), None)
            if parent_index == None:
                similarity = self._get_similarity(parent, context_components)
                component_recommendations_json.append({'title': parent, 'similarity': self._get_average(similarity), 'frequency': comp_freq.get(parent, 0), 'children': []})

            child_index = next((index for (index, d) in enumerate(component_recommendations_json) if d["title"] == child), None)
            if child_index == None:
                similarity = self._get_similarity(child, context_components)
                component_recommendations_json.append({'title': child, 'similarity': self._get_average(similarity), 'frequency': comp_freq.get(child, 0), 'children': []})

            parent_index = next((index for (index, d) in enumerate(component_recommendations_json) if d["title"] == parent), None)
            child_index = next((index for (index, d) in enumerate(component_recommendations_json) if d["title"] == child), None)
            component_recommendations_json[parent_index]['children'].append(component_recommendations_json[child_index])
            component_recommendations_json[parent_index]['children'] = sorted(component_recommendations_json[parent_index]['children'], key=lambda item: (item['similarity'], item['frequency']), reverse = True)
            has_parent.add(child)   

        # Iterate over JSON-Representation and remove duplicates
        component_recommendations_json_copy = component_recommendations_json[:]
        for idx, dictionary in enumerate(component_recommendations_json_copy):
            if dictionary['title'] in has_parent:
                component_recommendations_json.remove(dictionary)

        return component_recommendations_json, ranking_possible, component_recommendations
        
    def findInterestingSentences(self, doc, sentence_dict, component_recommendations, top_k):

        print(f"Recommending new sentences with top_k = {top_k}")
        
        # Step 1: Preprocessing: Get sentence queries and sentence corpus
        # Create sentence split pipeline
        nlpSplitSentence = German()
        sentencizer = nlpSplitSentence.create_pipe("sentencizer")
        nlpSplitSentence.add_pipe(sentencizer)

        # Get Queries
        queries = [sent.text for sent in nlpSplitSentence(doc.text).sents]
        
        # Get all recommended components
        all_components = []
        for k,v in component_recommendations.items():
            all_components.append(k)
            for value in v:
                all_components.append(value)

        # Get Corpus: Append sentence from web_results, if sentence contains a recommended component
        corpus = []
        for key in sentence_dict.keys():
            if any(token in all_components for token in key.split()):
                corpus.append(key)
        
        # Step 2: Classify Sentences in Corpus
        top_k_textcat = {"req": [],"info": [], "todo": []}
        for sent in corpus:
            doc = self.nlp_textcat(sent)
            pred_label = max(doc.cats, key=doc.cats.get)
            top_k_textcat[pred_label].append(sent)
        
        # Step 3: For each query sentence, find the closest top_k corpus sentences based on cosine similarity of the sentence transformer embeddings
        sentence_recommendations = {"req": [],"info": [], "todo": []}
        for query in queries:
            for cat in top_k_textcat:
                corpus = top_k_textcat[cat]
                corpus_embeddings = self.sentence_transformer.encode(corpus, convert_to_tensor=True)
                query_embedding = self.sentence_transformer.encode(query, convert_to_tensor=True)
                cos_scores = util.pytorch_cos_sim(query_embedding, corpus_embeddings)[0]
                cos_scores = cos_scores.cpu()
                print("Top_K: ", top_k)
                top_results = np.argpartition(-cos_scores, range(top_k))[0:top_k]
        
                for idx in top_results[0:top_k]:
                    sentence_recommendations[cat].append({"sentence": corpus[idx].strip(), "score": float(cos_scores[idx]),"url":sentence_dict[corpus[idx].strip()]})
                    
        return sentence_recommendations

    def _getParentChildRelationTriples(self, doc):
        # Extracts components with parent-child relation and returns a list of triples (e.g ('Auto', 'hat', 'Tür'))
        
        # 1. Initialize Matcher
        matcher = Matcher(self.nlp.vocab, validate=True) 
        
        # Extracts "Tür des Autos" as (Auto, "hat", Tür)
        has_fact_pattern_1 = [{"ENT_TYPE":{"IN":["component"]}, "OP": "+"},
                              {"POS": "DET", "OP": "?"},
                              {"ENT_TYPE":{"IN":["component"]}, "DEP": "ag", "OP": "+"}]
        
        # Extracts "Auto mit/ohne Tür" as (Auto, "hat", Tür)
        has_fact_pattern_2 =  [{"ENT_TYPE": "component", "OP": "+"},
                               {'OP': '*'},
                               {"LEMMA":{"IN": ["mit", "ohne"]}, "OP": "+"},
                               {'OP': '?'},
                               {"ENT_TYPE": "component", "OP": "+"}]
        
        # Extracts "Auto-Tür" as (Auto, "hat", Tür)
        has_fact_pattern_3 = [{"TEXT": {"REGEX": "((?:\w+-)+\w+)"}}]
        
        matcher.add("Has_Fact_Pattern_1", None, has_fact_pattern_1)
        matcher.add("Has_Fact_Pattern_2", None, has_fact_pattern_2)
        matcher.add("Has_Fact_Pattern_3", None, has_fact_pattern_3)
        
        # 2. Check for Matches
        has_fact_matches = matcher(doc)
        
        # 3. Extract Spans from Matches
        spans_pattern_1 = []
        spans_pattern_2 = []
        spans_pattern_3 = []
        
        for match_id, start, end in has_fact_matches:
            # spaCy stores all strings as integers, the match_id you get back will be an integer
            # get the string representation by looking it up in the vocabulary’s StringStore
            match_type = self.nlp.vocab.strings[match_id]
            
            # Append match to corresponding spans
            if match_type == "Has_Fact_Pattern_1":
                spans_pattern_1.append(doc[start:end])
                
            if match_type == "Has_Fact_Pattern_2":
                spans_pattern_2.append(doc[start:end])
                
            if match_type == "Has_Fact_Pattern_3":
                spans_pattern_3.append(doc[start:end])
        
        # 4. Make Conclusions based on the Match
        parent_child_relation_triples = []
        for span in spans_pattern_1:
            if len(span) == 3:  
                X = span[2].lemma_
                Y = span[0].lemma_
                parent_child_relation_triples.append((X, "hat", Y))
        
        for span in spans_pattern_2: 
            if len(span) == 3:
                X = span[0].lemma_
                Y = span[-1].lemma_
                parent_child_relation_triples.append((X, "hat", Y))
        
        for span in spans_pattern_3: 
            if "“" not in span.text:
                text = span.text
                if text[-1] == "-":
                    text = text[:-1]
                hyphen_word_split = text.rsplit("-", 1)
                X = hyphen_word_split[0]
                hyphen_word_lemma = hyphen_word_split[0] + "-" + [token.lemma_ for token in self.nlp(hyphen_word_split[1])][0]
                parent_child_relation_triples.append((X, "hat", hyphen_word_lemma))
        
        # 5. Return list containing all parent-child triples
        return parent_child_relation_triples

    def _clear_token(self, token):
        # Makes sure that words fit the W2V vocabulary
        token = token.replace('Ä', 'Ae').replace('ä', 'ae').replace('Ü', 'Ue').replace('ü', 'ue').replace('Ö', 'Oe').replace('ö', 'oe').replace('ß', 'ss')
        return token
    
    def _get_average(self, my_list): 
        # Used to built the average of the similarity-score-list for one token with all the context_components
        return sum(my_list) / len(my_list)
    
    def _get_similarity(self, token, context_components):
        # Get list of similarity-scores of the W2V-embeddings of a token with all the context_components
        cleared_context_components = [self._clear_token(comp) for comp in context_components if self._clear_token(comp) in self.word2vec_model.wv.vocab]
        cleared_token = self._clear_token(token)

        similarity_list = []
        if cleared_context_components:
            for target_word in cleared_context_components:
                if cleared_token not in self.word2vec_model.wv.vocab:
                    similarity_list.append(-0.1)
                else:
                    similarity_score = self.word2vec_model.similarity(target_word, cleared_token)
                    similarity_list.append(similarity_score)
        else:            
            similarity_list.append(-1)
    
        return similarity_list