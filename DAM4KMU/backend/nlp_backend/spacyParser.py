import os
import time
import spacy
from spacy_iwnlp import spaCyIWNLP
from .SemanticRoleLabeler.customPipe import CustomPipe

import re
import pandas as pd
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer

class SpacyParser:
    def __init__(self):

        print("\nInitializing SpacyParser...")
        print("Initializing SemanticRoleLabeler")
        startTime = time.time()
        base_dir = os.path.dirname(__file__)
        ner_abs_path = os.path.join(base_dir, 'NER_Large')
        self.nlp = spacy.load(ner_abs_path)
        iwnlp_abs_path = os.path.join(base_dir, 'IWNLP.Lemmatizer.json')
        self.nlp.add_pipe(spaCyIWNLP(lemmatizer_path=iwnlp_abs_path))
        self.custompipe = CustomPipe(self.nlp)

        # Training Data
        req_abs_path = os.path.join(base_dir, 'requirementPatterns.csv')
        df = pd.read_csv(req_abs_path, sep=';', header=0, names=['sentence', 'value'], dtype={'sentence': str, 'value': str})
        df = df.reset_index(drop=True) 
        df['text_clean'] = self._clean_text(df, 'sentence')
        vocab = self._flatten_words(df['text_clean'].values.tolist(), get_unique=True)

        # Models
        print("Initializing tfidf")
        self.tfidf = TfidfVectorizer(vocabulary=vocab)
        print("Initializing SVM")
        self.svm = self._trainSVM(df)

        self.listSRL = []
        self.listNER = []
        self.listParentChild = []

        print(f"SpacyParser is now ready, loading took {time.time()-startTime :<.2f}s.")

    def extractText(self, text):
        # Used in useSpacyNLP() in ajax.py

        doc = self.nlp(text)

        currentListParentChild = []
        print("{:<35}{:<10}{:<10}{:<50}{:<30}".format("text", "pos", "dep","ancestors", "children"))
        print("______________________________________________________________________________________________________________________________________")
        for token in doc:
            currentDict = {}

            text = token.text
            pos = token.pos_
            dep = token.dep_

            ancestors = [t.text for t in token.ancestors if t.text[0].isupper()]
            children = [t.text for t in token.children]
            
            if dep == "ag":
                currentDict["parent"] = text
                currentDict["children"] = ancestors
                currentListParentChild.append(currentDict)


            print("{:<35}{:<10}{:<10}{:<50}{:<30}".format(text, pos, dep, str(ancestors), str(children)))
        
        probaDict = {}
        wordTypeSeq = []
        
        currentListSRL = []
        currentListNER = []
        currentWordSeq = []

        print("")
        print("{:<45}{:<25}".format("ner_text", "ner_label"))
        print("___________________________________________________________")
        for ent in doc.ents:
            currentDict = {}
            currentDict["type"] = ent.label_
            currentDict["value"] = ent.text
            currentListNER.append(currentDict)

            print("{:<45}{:<25}".format(ent.text, ent.label_)) 
            
        print("")

        self.listNER = currentListNER
        self.listParentChild = currentListParentChild

        print("")    
        print("{:<45}{:<15}{:<15}".format("srl_text", "srl_label", "kbid"))
        print("___________________________________________________________")

        ## append SRL_lvl1 based on the sequences in sentence, the word sequences
        ## will be used later to determine the template ranking 
        position_index = 0
        used_srls = [False for sr in doc._.srl]
        for token in doc:
            for i, sr in enumerate(doc._.srl):
                if token.orth_ in sr.text:
                    currentDict = {}
                    if sr.label_ == "component" or used_srls[i]:
                        break
                    else:
                        currentDict["position"] = position_index
                        if not currentWordSeq:
                            currentWordSeq.append(sr.label_)
                        else:
                            if currentWordSeq[-1] != sr.label_:
                                currentWordSeq.append(sr.label_)
                            else:
                                break

                        used_srls[i] = True
                        position_index += 1
                    
                    currentDict["type"] = sr.label_
                    currentDict["value"] = sr.text
                    currentListSRL.append(currentDict)
                    print("{:<45}{:<15}{:<15}".format(sr.text, sr.label_, sr.kb_id)) 

        wordTypeSeq.append(''.join(str(e) + " " for e in currentWordSeq))
        print("---------- wordtype seq: \n", wordTypeSeq)
        extractedWordType = self.tfidf.fit_transform(wordTypeSeq)
        
        self.listSRL = currentListSRL

        probaList = self.svm.predict_proba(extractedWordType.todense())
        for item in probaList:
            i = 0
            while i < len(item):
                probaDict[self.svm.classes_[i]] = round(item[i] * 100, 2)
                i += 1
        print("---------- probability dictionary: \n", probaDict)

        return probaDict

    def _trainSVM(self, df):
        training_matrix = self.tfidf.fit_transform(df.text_clean)
        df = pd.concat([df, pd.DataFrame(training_matrix.todense())], axis=1)
        train_outcome = pd.crosstab(index=df["value"], columns="count") 
        train, dev = train_test_split(df, test_size=0.2, random_state=1868)
        features = train.columns[3:]
        X = train[features].values
        y = train['value'].values
        features_dev = dev[features].values
        svm = SVC(probability=True)
        svm.fit(X, y)
        print("Evaluation SVM")
        print("SVM Score:", svm.score(X,y))
        dev_predicted = svm.predict(features_dev)
        print("SVM Accuracy:", accuracy_score(dev.value, dev_predicted))
        return svm

    def _flatten_words(self, document, get_unique=False):
        # Get vocabulary
        sentence_list = [sent.split() for sent in document]
        if get_unique:
            return sorted(list(set([w for word_list in sentence_list for w in word_list])))
        else:
            return [w for word_list in sentence_list for w in word_list]

    def _clean_text(self, df, col):
        # Keep only alpha-numeric characters and replace all white space with a single space.
        return df[col].apply(lambda x: re.sub('[^A-Za-z0-9]+', ' ', x.lower())).apply(lambda x: re.sub('\s+', ' ', x).strip())