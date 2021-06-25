import requests
import numpy as np
import pandas as pd
from SPARQLWrapper import SPARQLWrapper

class WikiDataCrawler:
    def __init__(self):
        self.sparql = SPARQLWrapper("http://query.wikidata.org/sparql", agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11")
        self.result = pd.DataFrame(columns=["parentItem.value", "item.value", "itemLabel.value", "itemDescription.value", "itemAltLabel.value"])
        self.currItemID = ''

    def find_first_itemID(self, component, i):
        url = "https://www.wikidata.org/w/api.php"
    
        params = {
        "action" : "wbsearchentities",
        "language" : "de",
        "format" : "json",
        "search" : component 
        }
            
        try:
            data = requests.get(url,params=params)
            self.currItemID = data.json()["search"][0]['id']
            if self.result.empty:
                self.result.loc[0] = [f"SEARCH_COMPONENT{i}", self.currItemID, component, np.nan, np.nan]
            else:
                self.result.loc[-1] = [f"SEARCH_COMPONENT{i}", self.currItemID, component, np.nan, np.nan]
                self.result.index = self.result.index + 1
                self.result.sort_index(inplace=True) 
        except:
            print("Invalid Input try again !!!")

    def query_sparql_generator(self, prop, debug = 0):
        """
        P361:= Part of (e.g Der Motor ist Part of vom Auto)
        P527:= has Part (e.g Das Auto has Part Motor)
        """
        if debug: print("Creating Query for: ", self.currItemID, prop)
        query_sparql = f"SELECT ?item ?itemLabel ?itemDescription ?itemAltLabel WHERE {{?item wdt:P361 wd:{self.currItemID}. SERVICE wikibase:label {{ bd:serviceParam wikibase:language 'de'. }}}}"
    
        return query_sparql

    def _get_itemID(self, item_value):
        return item_value.split("/")[-1]
    
    def save_result(self, result_df):
        for index, row_series in result_df.iterrows():
            # Create new row to append to self.result
            row = row_series.to_frame().T
            row.insert(0, "parentItem.value", self.currItemID) 
            # Append to self.result
            self.result = pd.concat([self.result, row], ignore_index=True)
        
        # Modify values of 'item.value' column
        self.result['item.value'] = self.result['item.value'].apply(lambda x: self._get_itemID(x))
        
    def run_sparql_query(self, sparql_query, debug = 0):
        if debug: print("Run SPARQL Query: ", sparql_query)
        self.sparql.setQuery(sparql_query)
        self.sparql.setReturnFormat(JSON)
        result = self.sparql.query().convert()
        
        result_df = pd.io.json.json_normalize(result['results']['bindings'])
        
        if 'itemDescription.value' not in result_df.columns:
            result_df['itemDescription.value'] = np.nan
            
        if 'itemAltLabel.value' not in result_df.columns:
            result_df['itemAltLabel.value'] = np.nan

        if 'itemLabel.xml:lang' in result_df.columns:
            result_df = result_df.dropna(subset=["itemLabel.xml:lang"])
            result_df_subset = result_df[["item.value", "itemLabel.value", "itemDescription.value", "itemAltLabel.value"]]
            self.save_result(result_df_subset)

    def run_sparql(self, sparql_query, depth = 1, debug = 0):
        # For more information see: https://www.mediawiki.org/wiki/Wikidata_Query_Service/User_Manual#Query_limits
        # Per Minute we get 60 seconds of query runtime
        for i in range(0,depth):
            if debug: print(f"__________Current depth: {i+1}/{depth}__________")
            if i == 0:
                self.run_sparql_query(sparql_query, debug)
            else:
                item_values = self.result.loc[self.result['parentItem.value'] == self.currItemID][['item.value']].T.values.tolist()[0]
                for item_value in item_values:
                    self.currItemID = item_value
                    sparql_query = self.query_sparql_generator("P361")
                    self.run_sparql_query(sparql_query, debug)
                              
    def get_results(self):
        if self.result.empty:
            print("No results where found for the given Keyword.")
        else:
            return self.result
        
    def get_relation_dict(self, i):
        # Select all parent_ids, throw away the id of the keywordsearch
        df = self.result
        
        relations = {}
        parent_id_list = df['parentItem.value'].unique()[i:]
        
        for parent_id in parent_id_list:
            
            parent_idx = df.index[df['item.value'] == parent_id].tolist()[0]
            parent_label = df.loc[parent_idx].at['itemLabel.value']
            relations[parent_label] = set()
            
            child_dfidx = df.index[df['parentItem.value'] == parent_id].tolist()
            for child_idx in child_dfidx:
                child_label = df.loc[child_idx].at['itemLabel.value']
                relations[parent_label].add(child_label)
                
        return relations