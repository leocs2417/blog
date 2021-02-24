---
layout: post
title: "SSH设置无密码和使用别名登录Linux服务器"
date: 2018-03-18 19:00
comments: true
categories:
 	- Linux
tags:
	- Linux
	- SSH
---

> 在使用远程服务器的时候，经常需要本地使用**ssh**密码去登录，每次都需要去输入密码，很繁琐，后来学习了一下如何在本地使用**无密码登录**，特此记录，仅供参考。

**步骤如下：**

1. 首先，拿到本机的.ssh下的公钥，若无则手动创建即可。

进入.ssh目录 若无此目录，根目录下手动mkdir .ssh即可
```
cd ~/.ssh
```

创建秘钥对，最后的-P即私钥密锁为空，免密登录用。

<!-- more -->

```
ssh-keygen -b 1024 -t rsa -f id_rsa -P "" 
```
打开**id_rsa.pub**文件复制下来公钥
```
cat id_rsa.pub
```

2. 其次，ssh登录远程服务器，在根目录下，进入.ssh目录，若无，**mkdir**手动创建。

3. 然后，在.ssh目录下打开或创建并打开authorized_keys文件
```
touch authorized_key 
vi authorized_key
```
4. 最后将步骤1中的本地公钥粘贴到服务器的authorized_key上即可实现免密登录了。

这时服务器上已经有了本地的公钥，即可在本地实现**免密登录**了:
```
ssh user@xxx.com
```

这里也可以配置别名直接使用**别名登录**：

1. 进入.bash_profile文件
```
cd ~/
vi .bash_profile
```
2. 添加启动别名
```
alias startserver='ssh user@xxx.com'
 ```
3. 重载.bash_profile
 ```
source ~/.bash_profile
```
正常情况下，这样就可以使用别名直接登录了。

#### 问题：但是Mac上安装了item2+zsh的话，每次新打开一个终端窗口，重载就会失效，需要重新执行重载命令。

#### 原因：每次新打开窗口，zsh加载的都是 ~/.zshrc文件。
#### 解决方案：
1. 进入.zshrc文件
```
vi ~/.zshrc
```
2. 将重载语句添加到.zshrc文件的中即可。
```
source ~/.bash_profile
```

注：windows版同理，拿到本机.ssh的公钥复制到远程服务器下即可。