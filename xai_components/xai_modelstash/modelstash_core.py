from xai_components.base import InArg, OutArg, Component, xai_component

import modelstash
import modelstash_cli
import os
import sys
from pathlib import Path


# uncomment if you would like to use modelstash without using StartModelStashSession
# client_url = "http://localhost:8080"
# username = ""
# password = ""
# ms = modelstash.ModelStash(url=client_url, username=username, password=password)
# ms_cli = modelstash_cli.ModelStashCli(url=client_url, username=username, password=password)

@xai_component
class StartModelStashSession(Component):

    client_url: InArg[str]
    username: InArg[str] 
    password: InArg[str]

    def __init__(self):
        self.done = False

        self.client_url = InArg.empty()
        self.username = InArg.empty()
        self.password = InArg.empty() 


    def execute(self) -> None:
        
        global ms
        global ms_cli
        global client_url
        global username
        global password

        client_url = self.client_url.value if self.client_url.value else "http://localhost:8080"
        username = self.username.value
        password = self.password.value

        ms = modelstash.ModelStash(url=client_url, username=username, password=password)
        ms_cli = modelstash_cli.ModelStashCli(url=client_url, username=username, password=password)

        self.done = True


@xai_component
class ListModels(Component):

    def __init__(self):
        self.done = False

    def execute(self) -> None:
        print(ms_cli.list_models())
        self.done = True


@xai_component
class ListSkills(Component):

    def __init__(self):
        self.done = False

    def execute(self) -> None:
        print(ms_cli.list_skills())
        self.done = True


@xai_component
class UploadToModelStash(Component):

    model_file_path: InArg[any] #should be a str
    model_name: InArg[str] 
    creator_name: InArg[str] 
    training_dataset_name: InArg[str]
    input_names: InArg[any]  #should be a list
    output_names: InArg[any] #should be a list
    ms_model: OutArg[any] #should be a list


    def __init__(self):
        self.done = False

        self.model_file_path = InArg.empty()
        self.model_name = InArg.empty() 
        self.creator_name = InArg.empty() 
        self.training_dataset_name = InArg.empty()
        self.input_names = InArg.empty()  
        self.output_names = InArg.empty()
        self.ms_model = OutArg.empty() 


    def execute(self) -> None:

        model_file_path = self.model_file_path.value if self.model_file_path.value else ""

        filename = Path(sys.argv[0]).stem
        #filepath = Path.splitext(sys.argv[0])[0]

        model_name = self.model_name.value if self.model_name.value else filename
        creator_name = self.creator_name.value if self.creator_name.value else os.getlogin()
        training_dataset_name = self.training_dataset_name.value if self.training_dataset_name.value else filename + "_dataset"
        input_names = self.input_names.value if self.input_names.value else [filename + "_input"]
        output_names = self.output_names.value if self.output_names.value else [filename + "_output"]

        print(f"{model_file_path=}")
        print(f"{model_name=}")
        print(f"{creator_name=}")
        print(f"{training_dataset_name=}")
        print(f"{input_names=}")
        print(f"{output_names=}")

        model = ms.create_model(file_path=model_file_path, 
                                        model_name=model_name, 
                                        created_by=creator_name, 
                                        training_dataset=training_dataset_name, 
                                        input_names=input_names, 
                                        output_names=output_names)

        self.ms_model.value = model
        self.done = True

@xai_component
class DeleteModelfromModelStash(Component):

    model_name: InArg[str]

    def __init__(self):

        self.done = False
        self.model_name = InArg.empty()

    def execute(self) -> None:

        filename = Path(sys.argv[0]).stem
        model_name = self.model_name.value if self.model_name.value else filename

        #assert not supposed in xpipes yet
        #assert ms.find_model(model_name), f'{model_name} not found!'

        model_id = ms.find_model(model_name).id
        model_versions = ms.list_model_versions(model_id)

        print(f"Found {model_name=} {model_id=} with {len(model_versions)} versions!")

        for model_version in model_versions:
            print(f"Deleting {model_version.id=} {model_version.name=}")
            ms_cli.delete_model_version(model_version.id)

        print(f"Deleting {model_name=} with {model_id=}")
        ms_cli.delete_model(model_id)


@xai_component
class DownloadLinkfromModelStash(Component):

    model_name: InArg[str]
    modelVersion: InArg[int] 

    def __init__(self):

        self.done = False
        self.model_name = InArg.empty()
        self.modelVersion = InArg.empty() 

    def execute(self) -> None:

        filename = Path(sys.argv[0]).stem
        model_name = self.model_name.value if self.model_name.value else filename
        modelVersion = self.modelVersion.value if self.modelVersion.value else -1

        link = getDownloadLink(model_name, modelVersion)

        if link:
            print(f"{model_name} modelstash download link:\n{link}")
        
        else:
            print(f"Model {model_name} not found in model stash!")


@xai_component
class LoadfromModelStash(Component):

    model_name: InArg[str]
    modelVersion: InArg[int]
    model: OutArg[any]

    def __init__(self):

        self.done = False

        self.model_name = InArg.empty()
        self.modelVersion = InArg.empty()

        self.model = OutArg.empty() 


    def execute(self) -> None:


        filename = Path(sys.argv[0]).stem
        model_name = self.model_name.value if self.model_name.value else filename
        modelVersion = self.modelVersion.value if self.modelVersion.value else -1

        ms_model = ms.find_model(model_name)

        if not ms_model:
            print(f"Model {model_name} not found in model stash!")
        
        else:

            link = getDownloadLink(model_name, modelVersion)
            target_directory = os.path.dirname(os.path.abspath(sys.argv[0]))
            zip_file = DownloadfromModelStash(link, target_directory)

            extracted_path = ""

            import zipfile
            with zipfile.ZipFile(zip_file, 'r') as zip_ref:
                zip_ref.extractall(target_directory)
                extracted_path = zip_ref.namelist()[0]
    
            model_path = target_directory + "//" + extracted_path

            #TODO: Assert type of model
            from keras.models import load_model
            model = load_model(model_path)

            self.model.value = model

        self.done = True

            

def getDownloadLink(model_name, modelVersion=-1):

    ms_model = ms.find_model(model_name)

    if ms_model:
        ms_version = ms_model.modelVersions[modelVersion]
        return '%s%s' % (client_url, "/api/models/versions/{}/download".format(ms_version.id))

    else:
        print(f"Model {model_name} not found in model stash!")
        return False
        

def DownloadfromModelStash(link, target_directory):

    import requests
    import re
    from tqdm import tqdm

    get_request = requests.get(link, headers=_get_headers(), stream=True)

    with get_request as r:
        r.raise_for_status()
        total_size_in_bytes = int(r.headers.get('content-length', 0))
        filename = re.findall("filename=\"?(.+?)\"?$", r.headers.get("content-disposition"))[0]
        block_size = 1024
        progress_bar = tqdm(total=total_size_in_bytes, unit='iB', unit_scale=True, desc=filename)

        zip_file = os.path.join(target_directory, filename)

        with open(zip_file, 'wb') as file:
            for data in r.iter_content(block_size):
                progress_bar.update(len(data))
                file.write(data)
        progress_bar.close()

        return zip_file


def _get_headers():
    from base64 import b64encode

    headers = {}
    if username is not None and password is not None:
        header_username = username.encode("utf-8")
        header_password = password.encode("utf-8")
        headers['Authorization'] = 'Basic %s' % str(b64encode(b':'.join((header_username, header_password))), "ASCII").strip()

    elif access_token is not None:
        headers['Authorization'] = 'Bearer %s' % access_token

    return headers