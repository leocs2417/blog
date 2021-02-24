---
layout: post
title: "彻底删除Git仓库中某个文件（文件夹）及其历史记录"
date: 2018-12-06 20:00
comments: true
categories:
 	- Git
tags:
	- Git
---

> 最近写blog的代码，误操作把带有自己邮箱的SMTP的后台接口文件一起push到远程仓库了。

由于如果此误操作，直接删除此文件的话，依然能从**git log** 中查看到该文件，所以需要将该文件删除的同时，删除它的所有commit的记录才可以。

github官方参考传送门：https://help.github.com/articles/remove-sensitive-data/

特此记录删除对应文件（文件夹的）的过程：

<!-- more -->

**步骤如下：**

**首先，重写git log，删除文件和对应的log:**
```
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch FILE_PATH' --prune-empty --tag-name-filter cat -- --all
```
**然后，强制推到远端所有分支:**
```
git push origin master --force --all

```

**最后，这个文件还在你的本地仓库里，还需要将它完全抹除:**
```
rm -rf .git/refs/original/

git reflog expire --expire=now --all

git gc --prune=now

git gc --aggressive --prune=now

```
**注：步骤1中的‘FILE_PATH’是该文件所在的路径(本地文件也会被删除)**
