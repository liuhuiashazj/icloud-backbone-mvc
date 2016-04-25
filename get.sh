#!/bin/sh
#sh get.sh master 部署master分支最新代码

gitname=befe-clouddisk
giturl=ssh://g@gitlab.baidu.com:8022/be-fe/befe-clouddisk.git
#代码部署路径
dest=$(cd `dirname $0`; pwd)
echo 123
echo $dest
cd $dest
dirname=build

downdir=svn-ignore
branch=$1
if [ ! -x "$downdir" ];then
        mkdir "$downdir"
fi
cd "$downdir"

if [ -x "$gitname" ];then
        cd "$gitname"
        git pull
        echo "update code from remote"
else
        git clone "$giturl"
        cd "$gitname"
        echo "get code from remote"
fi

if [ ! -n "$1" ];then
        echo "no branch input"
else
        echo "go to branch $1"
        git checkout "$1"

fi
pwd
git pull
cd ..
pwd
if [ ! -x bak ];then
        mkdir bak
else
        rm -rf bak/*
fi
cd ..
pwd
echo 'start to bak'
cp -rf `ls|grep -Ev "^($downdir|get.sh)$"` ./$downdir/bak
#cp -r $dest ./bak
echo 'start to copy'
cp -r $downdir/$gitname/$dirname/* .
echo 'update success'
