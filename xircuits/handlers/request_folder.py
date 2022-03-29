from tqdm import tqdm
import os
from urllib import request

def request_folder(folder, repo_name="XpressAi/Xircuits"):
    from github import Github
    print("Downloading " + folder + " from " + repo_name)
    g = Github()
    repo = g.get_repo(repo_name)
    base_url = "https://raw.githubusercontent.com/" + repo_name + "/master/"

    if not os.path.exists(folder):
        os.mkdir(folder)
    else:
        print(folder + " already exists.")

    contents = repo.get_contents(folder)
    total_folders = sum(content.type=='dir' for content in contents)
    
    pbar = tqdm(total=total_folders)
    
    while len(contents)>0:
        file_content = contents.pop(0)
        if file_content.type=='dir':
            os.mkdir(file_content.path)
            contents.extend(repo.get_contents(file_content.path))
            pbar.update(1)

        else:
            file_url = base_url + "/" + file_content.path
            request.urlretrieve(file_url, file_content.path)