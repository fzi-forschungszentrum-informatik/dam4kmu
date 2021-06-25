import re
import json
import requests
from bs4 import BeautifulSoup
from googleapiclient.discovery import build

from backend.models import WebResults

class QueryGenerator:
    def __init__(self):
        print("Initializing QueryGenerator")            
        self.query_types = {
                                "Komponenten" : [
                                                    "Bestandteile",
                                                    "Komponenten"
                                                ],
                                "Richtlinie" : [
                                                    "Standard"
                                                ],
                                "Anforderung" : [
                                                    "Anforderungen"
                                                ]}

    def getQueryList(self, component_descriptions):
        # Create search query requests based on the generated adj-based component descripton and the defined query types
        query_list = []
        for component in component_descriptions:
            for res in self.query_types:
                for descr in self.query_types[res]:
                    query_list.append(component + " " + descr)

        return query_list
        
    def generateComponentDescription(self, doc, nlp):
        # Step 1: Detect for each component its corresponding adjectives
        # Extract lemma-form of ADJ from root-subtree-relationship 
        # e.g. {'Auto': {'schnellen'}} from "Das neue Auto muss schnell sein."
        roots = [sent.root for sent in doc.sents]
        for root in roots:
            subtree = "".join(w.text_with_ws for w in root.subtree)
            doc_subtree = nlp(subtree)
            subtree_pairs = self._find_pairs_in_subtree(doc_subtree)
        print("subtree_pairs:\n", subtree_pairs)

        # Extract lemma-form of ADJ from nounchung-relationship 
        # e.g. {'Auto': {'neue'}} from "Das neue Auto muss schnell sein."
        nounchunk_pairs = {k.lemma_: set() for k in doc if k.ent_type_ == "component"}
        noun_chunk_adj = [token for chunk in doc.noun_chunks for token in chunk if token.pos_ == 'ADJ']
        if noun_chunk_adj:
            for chunk in doc.noun_chunks:
                adj = set()
                comp = ""
                for i, tok in enumerate(chunk):
                    if tok.ent_type_ == "component":
                        comp = tok.lemma_
                    if tok.pos_ == "ADJ":
                        adj.add(tok.lemma_)
                if comp:
                    nounchunk_pairs.update({comp:adj})
        print("nounchunk_pairs:\n", nounchunk_pairs)

        # Step 2: Generate a description for each component based on its corresponding adjectives
        # e.g. {'Auto': {'schnellen'}} + {'Auto': {'neue'}} -> 'neue, schnelle Auto'
        component_descriptions = []
        roots = [sent.root for sent in doc.sents]
        for root in roots:
            subtree = "".join(w.text_with_ws for w in root.subtree)
            doc_subtree = nlp(subtree)
            components = [token.lemma_ for token in doc_subtree if token.ent_type_ == "component"]
            # If there are more then 2 componens in doc_subtree false positive results in subtree_pairs are a problem
            if len(components) >= 2:

                # Exclude false positive results from subtree_pairs
                ag_components = [token.lemma_ for token in doc_subtree if token.ent_type_ == "component" if token.dep_ in ["ag"]]
                for ag_comp in ag_components:
                    subtree_pairs[ag_comp] = set()

                # Merge nounchunk_pairs and subtree_pairs
                # e.g. {'Auto': {'schnellen'}} + {'Auto': {'neue'}} -> {'Auto': {'schnellen','neue'}}
                pairs = {key: subtree_pairs[key].union(nounchunk_pairs[key]) for key in subtree_pairs}
                print("Merged (cleared) subtree_pairs & nounchunk_pairs: ", pairs)

                # if false positive results exist in subtree_pairs, generate description like this
                if ag_components:
                    key_comp = ag_components[0]
                    not_ag_components = [comp for comp in components if comp not in key_comp]
                    compound_key_comp = ', '.join(pairs[key_comp])
                    for component in not_ag_components:
                        compound = ', '.join(pairs[component])
                        desc = compound + " " + component + " " + compound_key_comp + " " + key_comp
                        desc = ' '.join(desc.split())
                        component_descriptions.append(desc)
                # if no false positive results exist in subtree_pairs, generate description like this
                else:
                    key_comp = components[0]
                    compound_key_comp = ', '.join(pairs[key_comp])
                    for component in components[1:]:
                        compound = ', '.join(pairs[component])
                        desc = compound + " " + component + " " + compound_key_comp + " " + key_comp
                        desc = ' '.join(desc.split())
                        component_descriptions.append(desc)

            else:
                # Merge nounchunk_pairs and subtree_pairs
                # e.g. {'Auto': {'schnellen'}} + {'Auto': {'neue'}} -> {'Auto': {'schnellen','neue'}}
                pairs = {key: subtree_pairs[key].union(nounchunk_pairs[key]) for key in subtree_pairs}
                print("Merged cleared nounchunk_pairs & subtree_pairs:\n", pairs)
                # generate description like this
                for comp, adj_set in pairs.items():
                    if adj_set:
                        compound = ', '.join(adj_set)
                        desc = compound + " " + comp
                        component_descriptions.append(desc)
                    else:
                        component_descriptions.append(comp)

        return component_descriptions

    def _find_pairs_in_subtree(self, doc):
        noun_adj_pairs = {k.lemma_: set() for k in doc if k.ent_type_ == "component"}
        noun_chunk_adj = [token for chunk in doc.noun_chunks for token in chunk if token.pos_ == 'ADJ']
        for i,token in enumerate(doc):
            if token.ent_type_ != "component":
                continue
            for j in range(i+1,len(doc)):
                if doc[j].pos_ == "NOUN" and doc[j].ent_type_ != "unit" and doc[j].dep_ not in ["ag"]:
                    break
                if doc[j].pos_ == 'ADJ' and doc[j] not in noun_chunk_adj:
                    noun_adj_pairs[doc[i].lemma_].add(doc[j].lemma_)
                    for m in range(j+1, len(doc)):
                        if doc[m].pos_ == 'ADJ' and doc[m] not in noun_chunk_adj:
                            noun_adj_pairs[doc[i].lemma_].add(doc[m].lemma_)
                    break    
        return noun_adj_pairs

class WebMiner:
    def __init__(self, api_key, cse_id):
        '''Initiliaisiert ein WebMiner-Objekt'''
        print("Initializing WebMiner")
        self.api_key = api_key 
        self.cse_id = cse_id 
        self.pageLimit = 1
        self.startIndex = 1
        self.blocked_websites = ["https://www.amazon.de", "https://www.amazon.com",
                                "https://www.instagram.de", "https://www.instagram.com",
                                "https://www.pinterest.com", "https://www.pinterest.de",
                                "https://www.youtube.com", "https://www.youtube.de"]

    def addResultsToDB(self, query):
        response =  self._getSearchResults(query)
        for result in response["searchResults"]:
            url = result['link']
            if self._check_valid_url(url):
                content = json.dumps(self._getSections(url))
                webResult = WebResults()
                webResult.publish(str(result['title']), (url), content, str(query))

    def _getSearchResults(self, query):
        """Accesses Google Search API with a single given query to return a result dictionary containing the following three keys
        results['searchResults'] (list of dict): 
            Per each found web page that machtches the search query, creates a dict with the corresponding CUSTOM SEARCH RESULT object.
            See https://developers.google.com/custom-search/v1/reference/rest/v1/Search#Result for more information.
        results['PDFResults'] (list of dicts): 
            Right now we can't read PDF-Documents so discard them for now.
        results['searchInfo'] (dict): 
            Saved meta information (searchTime and totalResults) of the single given Search Query request
            See https://developers.google.com/custom-search/v1/reference/rest/v1/Search for more information
        """
        print("______________________________")
        print("NOW processing Query: " + query)
        self.__resetStartIndex()
        
        response = {}
        response["searchResults"] = []
        response["PDFResults"] = []

        google_service = self.__getService()

        """The default number of results per page is 10, controls how many pages of the google search are visited."""
        for page in range(0, self.pageLimit):
            print("Reading page number:", page+1)
            
            # Access Google Search API: Returns metadata about the search performed, metadata about the engine used for the search, and the search results.
            # query_results is a instance of the Search object. See https://developers.google.com/custom-search/v1/reference/rest/v1/Search
            query_results = google_service.cse().list(
                cx = self.cse_id,       # Search Engine ID to use for this request
                q = query,              # Query
                lr = "lang_de",         # Restricts the search to documents written in German
                start = self.startIndex # The index of the first result to return. The default number of results per page is 10, so &start=11 would start at the top of the second page of results. 
            ).execute()
            
            # Save meta information about the search
            response["searchInfo"] = query_results.get("searchInformation")
            
            # Get the Search Result object in the Search object. 
            # See https://developers.google.com/custom-search/v1/reference/rest/v1/Search#Result
            for item in query_results.get("items"):
                keep_item = True
                
                # Cannot process PDFs, so they get discarded for now
                if item.get("mime") == "application/pdf":
                    keep_item = False

                if keep_item:
                    response["searchResults"].append(item)
                else:
                    response["PDFResults"].append(item)
                    
            # Increase startIndex, so we get the google search result of the next page (10 more results)
            self.startIndex = query_results.get("queries").get("nextPage")[0].get("startIndex")
                    
        return response

    def _check_valid_url(self, url):
        # Check if url is not contained in self.blocked_websites
        pattern = "((http|ftp|https):\/\/)?(([\w.-]*)\.([\w]*))"
        result = re.match(pattern, url)
        
        if result[0] not in self.blocked_websites:
            if result[0][-2:] == "de" or result[0][-3:] == "org":
                return True
        else:
            return False

    def _getSections(self, link):
        url = link
        soup = self.__get_html_document(url)

        headings = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
        sections = {}

        for index, heading in enumerate(headings):
            section = ""
            links_list = []
            # Use next_siblings to navigate between page elements that are on the same level of the parse tree
            for elem in heading.next_elements:
                if elem.name and elem.name.startswith('h'):
                    break
                #If element is a paragraph
                if elem.name == 'p':
                    prossesed = self.__cleanElement(elem) 
                    section += " " + prossesed   

            if heading and section.strip():
                sections[index] = {"heading":self.__clearString(heading.get_text()), "section": self.__clearString(section)}

        return sections

    def __getService(self):
        # Initialize Google Custom Search
        service = build("customsearch", "v1", developerKey=self.api_key, cache_discovery=False)
        print("Google Service initialized")
        return service

    def __resetStartIndex(self):
        """Setzt den Start-Index auf 1"""
        self.startIndex = 1

    def __get_html_document(self, url, parser = "lxml"):
        # Returns soup, a BS object, which allows us to interact with the HTML code
        response = requests.get(url.rstrip())
        html = response.content
        # Alternative: use the "html5lib" parser instead of the "lxml" parser, which is more lenient but slower
        soup = BeautifulSoup(html,parser)
        return soup

    def __cleanElement(self, elem):
        result = re.sub("\\u00a0", " ", elem.get_text())
        result = re.sub("\\u00ae", " ", result)
        return result

    def __clearString(self, in_text):
        text = re.sub(r"\\u00c4", "Ae", in_text)
        text = re.sub(r"\\u00e4", "ae", in_text)
        text = re.sub(r"\\u00d6", "Oe", text)
        text = re.sub(r"\\u00f6", "oe", text)
        text = re.sub(r"\\u00dc", "Ue", text)
        text = re.sub(r"\\u00fc", "ue", text)
        text = re.sub(r"\\u2013", "", text)
        text = text.replace('\n', ' ').replace('\xa0', ' ').replace('\r', ' ').replace('\t', ' ')
        text = re.sub(' +', ' ', text).strip()
        return text