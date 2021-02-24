---
layout: post
title: "新版Sublime Text3的Package Control打不开的问题"
date: 2019-01-05 12:00
comments: true
categories:
 	- IDE
tags:
	- IDE
---

> 前一段时间电脑上的Sublime Text3 突然不太好用，索性就卸载重装了一个。

> 结果安装完后，准备安装需要用到的插件，结果发现**Package Control** 打不开。试过很多次依然打不开。之前从来没有遇到过这个问题。

然后Google了一下，发现类似的问题很少出现，后来在Github的Sublime Text3官方问题区，找到了如何解决的方式。

**步骤如下：**

首先，在编辑器安装路径下，找到  **PackageControl.sublime-settings**文件，将**debug**设为**true**。
![](https://github.com/Saturday24/notes/blob/master/image/sublime-text-debug.png?raw=true)


然后，打开编辑器的**调试窗口**，再次进行打开**Package Control** 的操作。

结果发现报错信息是：
```
There are no packages available for installation - Package Control of Sublime Text 3

Package Control: Unable to download https://packagecontrol.io/channel_v3.json after 3 attempts
```

<!-- more -->

就是安装插件的那个Package Control在需要拿到channel url下的地址，从而获取插件的配置项和依赖。

这里的`https://packagecontrol.io/channel_v3.json`，在打开SS后，在浏览器中能访问， 但是编辑器本身不支持https的路径，所以翻墙也拿不到。

所以只好在浏览器打开该地址，将该JSON文件的所有内容复制下来，自行在本地或者服务器中封装一个**GET**方式的**API**，然后在**PackageControl.sublime-settings**文件中，添加或修改**channels**中添加上墙内的API的地址即可。
```
"channels":
	[
		"http://PATH/channel_v3.json"
	]
```

**(注：此处的PATH指的封装的API的IP)**

(此处我是在服务器上开了一个端口，写了一个http的get请求的API。)