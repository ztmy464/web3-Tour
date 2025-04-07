# git
- View both local and remote branches:  
git branch -a  

- create and switch to dev branch:  
git checkout -b dev  

- make sure in main branch:
git checkout main  

- pull the last update:  
git pull origin main 

- git push origin main  

- git add . && git commit -m "clamm finished" && git push origin dev

- git log:
if you make a mistake you can revert back to a previous version very easily

- git status:
see the status of local file

- about remote repo 

git remote -v
git remote add foundary-fundme-cu https://github.com/ztmy464/foundary-fundme-cu.git
git push -u foundary-fundme-cu main
git remote remove foundary-fundme-cu

# bash

$env:http_proxy="http://127.0.0.1:7890"
$env:https_proxy="http://127.0.0.1:7890"
