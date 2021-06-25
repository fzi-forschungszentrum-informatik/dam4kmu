# DAM4KMU

## Installation

#### Prerequisites: (the following programs must already be installed)
1. Visual Studio Code or other IDE
2. Python 3.7

#### Steps to install and run the program
- **git clone**
```
git clone TBD
```

- **install NodeJs** from https://nodejs.org/en/download/ (make sure `npm` is included)

- For Windows: add the NodeJs path to the user's environment variable `PATH`; e.g.
```
C:\Program Files\nodejs\
```
- **Unzip following files**

```
DAM4KMU/backend/nlp_backend/NER_Large/vocab/vectors
DAM4KMU/backend/nlp_backend/germanwordembeddings.model
```

- **Installing dependencies for python and nodejs**

```
// change into the repository's root folder
cd dam4kmu

// Create new folder name node_modules
mkdir node_modules

// Install the Nodejs dependencies from package.json
npm install

// Create python virtualenv name `env`
python -m venv ./env

// Activate the venv
source ./env/bin/activate

// Install the python dependencies
pip install -r requirements.txt
```

- **Initiate the django database**
```
// go to the folder containing the file `manage.py`
cd DAM4KMU

// and run
python manage.py migrate
python manage.py makemigrations
```

- **Run the program**
```
// run Django server
python manage.py runserver

// launch another console and run React or Nodejs
npm run dev
```

#### Steps to create Google Custom Search (Last checked: 30.03.2021)
We use as a backbone for our Research Assistant a Google Custom Search with a free limit of 10000 queries per day.
Please create your own `api_key` and `cse_id` based on the following steps:
- **Get a custom search engine API key (api_key)**
```
– Go to https://developers.google.com/custom-search/v1/introduction and click 'Get a Key'.
– Click 'Select or create project'.
– Click 'Create new project'.
– Enter a new project name. Click 'Next'.
– Copy api key to clipboard.
```

- **Get a custom search engine id (cse_id)**
```
– Go to https://programmablesearchengine.google.com/about/ and click 'Get started'.
– Click 'Add' to add a new search engine.
– Use 'www.example.com' as a dummy for the 'Sites to search' field.
– Select 'German' as language.
– Give the search engine a name.
– Click 'Create'.
– Go back to the search engine overview page. Click on your created search engine.
– Delete 'www.example.com' from 'Sites to search'.
– Copy search engine id to clipboard.
```

Insert `api_key` and `cse_id` in `DAM4KMU/DAM4KMU/settings.py` in line 160/161.

## License
This software is licensed under the MIT license, which can be found in the file [LICENSE](LICENSE).<br>
All dependencies are copyright to the respective authors and released under the licenses listed in [LICENSE_LIBRARIES](LICENSE_LIBRARIES).

## Acknowledgements
This software was developed at the [FZI Research Center for Information Technology](https://www.fzi.de).<br>
The associated research is partially funded by the German Ministry of Education and Research (BMBF) (grant number: 01IS18086) within the context of the project [DAM4KMU](https://dam4kmu.de/).<br>
<div style="display: flex; align-content: center; justify-content: center; flex-direction: row;">
    <img src="img/BMBF.jpg" alt="BMBF Logo" height="150" style="padding-right: 20px">
    <img src="img/DAM4KMU_Logo.svg" alt="DAM4KMU Logo" height="60" style="padding-top: 40px">
</div>
