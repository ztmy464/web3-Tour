# git

- SSH log in GitHub:

git config --global user.email "ztmy464@gmail.com"  
git config --global user.name "ztmy464"  
ls -al ~/.ssh  
ssh-keygen -t rsa -b 4096 -C "ztmy464@gmail.com"  
cat ~/.ssh/id_rsa.pub  
ssh -T git@github.com  

- branch  

View both local and remote branches:  
git branch -a  

create and switch to dev branch:  
git checkout -b dev  

make sure in main branch:
git checkout main  

- pull  

pull the last update:  
git pull origin main 

- **push**

git add . && git commit -m "clamm finished" && git push origin dev

- log

if you make a mistake you can revert back to a previous version very easily

- git status:

see the status of local file

- remote 

git remote -v  

git remote add foundary-fundme-cu https://github.com/ztmy464/foundary-fundme-cu.git  

git remote remove foundary-fundme-cu 

Change the origin address of the current Git repository(HTTP) to an SSH format address:  
git remote set-url origin git@github.com:ztmy464/web3-Tour.git







# bash

$env:http_proxy="http://127.0.0.1:7890"  
$env:https_proxy="http://127.0.0.1:7890"
