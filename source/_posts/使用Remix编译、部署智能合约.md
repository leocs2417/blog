---
layout: post
title: "使用Remix编译、部署智能合约"
date: 2018-11-23 19:00
comments: true
categories:
 	- 区块链
tags: 
	- 区块链
	- 笔记
---

> # 一、Solidity的介绍
Solidity是目前区块链中，开发智能合约最常用、也是最流行的语言，运行在**Ethereum虚拟机**（EVM）之上。它的语法接近于**Javascript**，是一种面向对象的语言，真正意义上运行在网络上的去中心化合约。

<!-- more -->

## 1. 文档地址
官方文档：[https://solidity.readthedocs.io](https://solidity.readthedocs.io).（英文）
中文翻译版： [https://solidity-cn.readthedocs.io/zh/develop/](https://solidity-cn.readthedocs.io/zh/develop/).（中文版版本较旧，但不影响基础学习）
# 二、编译合约
## 1.编译方式
编译合约有很多种办法：可以使用**Remix**进行在线编译，可以使用**solcjs命令行**编译，也可以使用**solc、node.js**进行编译。

## 2.remix
此篇文章中，我们使用的[Remix](http://remix.ethereum.org)这个在线**IDE**进行编译的。
假设我们这里将文档中实例的合约复制下来，并粘贴到[Remix](http://remix.ethereum.org)中。
然后，将IDE右上角的**Compile**栏目下的**Auto compile**选项勾选上，即可自动编译。
（注：选择编译版本默认即可，会自动向下兼容。）
![](/assets/image/remix.png)
若此处自动编译过程中，编译**失败**有报错，首先将编译版本调成与当前合约版本一致（0.5.x版可能能存在不兼容），其次再检查是否有语法错误。
这时，如果编译**成功**了，会看到如上图所示的合约ABI出现，点击**ABI**按钮就可以复制得到当前合约编译后的ABI文件了。（注：如果当前合约代码中存在**多个合约**，点击下拉框选择**所需合约**即可获取对应ABI）
# 三、部署合约
## 1.MetaMask
使用Chrome就可以直接安装MetaMask插件到浏览器上了。
这里账户可以自行根据步骤注册，也可以根据**短语**导入已有账户。
## 2.部署到本地
对于项目前期运行测试来讲，合约部署在本地的话，会得到实时的反馈结果，更为方便。本篇文章讲的是部署到本地环境下。
### a.Truffle、Ganache
[ Truffle、Ganache](https://truffleframework.com/)具体环境安装官方文档很详细。
### b.从Ganache导入账户到MetaMask
安装完Ganache客户端之后，它会提供给你待导入的测试账户的短语（10个测试账户）。
导入后，选择MetaMask连接地址。
![](/assets/image/metamask.png)

点击**Custom RPC**，然后输入**Ganache**上的地址，如上图已添加完，这里的地址是**http://127.0.0.1:7545**
添加完之后选择刚添加的测试地址，此时就可以看到上一步导入的测试账户了。
![](/assets/image/metamask-accout.png)
### c.部署
上一步成功后，此时再回到Remix中，选择**Run** => **Environment** => **Web3 Provider**，
然后将地址改为**Ganache**客户端的Server地址（这里是**http://127.0.0.1:7545**）,点击ok保存。
![](/assets/image/web3-deploy.png)
然后点击**Deploy**即可部署成功。
（注：若合约代码中，存在需要在Deploy前，输入的Constructor函数所需的字段，在Deploy输入框后，手动输入符合规则的字段后，再点击Deploy部署即可）
### d.合约地址
部署成功后，合约地址可以在**Ganache**客户端的**Block**选项中得到。

