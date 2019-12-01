---
layout: post
title: "Node.js web3.js编译、部署智能合约"
date: 2018-12-18 20:00
comments: true
categories:
 	- 区块链
tags: 
	- 区块链
	- Node.js
---

> 供参考脚本：https://github.com/Saturday24/Smart-Contracts-Script

<!-- more -->

##  1.编译脚本
		a.install -- web3 solc fs path 
		b.编译: node compiler.js
   首先在工程目录下，使用**node.js**的*fs*模块，查找是否存在.**sol**格式的合约文件， 若存在：
   则再去对应目录查找是否存在：与该合约对应的.**abi**、.**json**文件，根据需求，若不存在编译后的文件或合约代码已更改，则执行编译脚本，生成对应的.**abi**、.**json**文件。
   **注**：运行编译文件报错：原因一：fileName前需加 **:** ; 原因二：最新版solc编译生成.**abi**、.**json**文件时会报错，建议重新安装**稳定版**；
##  2.部署脚本
	  部署: node deploy.js
将.**abi**、.**json文件**以及**所需参数**传递给部署脚本，部署脚本，执行成功则返回合约地址，供前端调用。
**注**：部署合约所消耗的gas可以通过调用web3的**web3**.**eth**.**estimateGas**()的方法来预估计算，并填入**deploy**函数中。

安装 Truffle - https://truffleframework.com/truffle
安装 Ganache - https://truffleframework.com/ganache

   

1.install -- web3 solc fs path
2.编译: node compiler.js

    var solc = require("solc")
    var fs = require("fs")
    var path = require('path')
    
    function compiler(file,contractName){
        // 读取智能合约文件
        var input = fs.readFileSync(file,'utf8').toString();
        var fileName = path.parse(file)['name'].toString();
        console.log(fileName)
        // 编译合约
        var contract = solc.compile(input,1);
        // 输出结果   
    	console.log(contract.contracts[contractName].interface)
        console.log(contract.contracts[contractName].bytecode)
        // 将编译后生成的bytecode保存到本地
        fs.writeFile(fileName+'.abi','0x'+contract.contracts[contractName].bytecode,{},function (err,result) {
            if (err){
                console.log(err)
            }
        })
        // 将编译后生成的interface保存到本地
        fs.writeFile(fileName+'.json',(contract.contracts[contractName].interface),{},function (err,result) {
            if (err){
                console.log(err)
            }
        })
    }
    
    // 调用函数,第一个参数是你的合约文件地址，第二个参数是你的合约名，注意冒号不要省略
    compiler('./ballot.sol',':Ballot');

注：运行编译文件报错：
    原因一：`fileName`前需加`:`；
    原因二：最新版`solc`编译生成`.json`和`.abi`文件时会报错，重新安装稳定版；

3.部署合约: node deploy.js

    var Web3 = require('web3');
    var web3 = new Web3(new Web3.providers.HttpProvider(`ipfsAddress`));
    var fs = require('fs');
    var path = require('path')
    deploy(`contractName`,`account[0]`,`psw`);
    /*
    @param file 文件名，会自动查找文件名路径下的被编译过的文件
    @param from 合约账户，合约部署到私链上将从这个账户上扣除gas
    @param password 该账户的密码，如果你账户是锁定状态
    */
    function deploy(file,from,password) {
        var filename = path.parse(file)['name'].toString();
        var interface = fs.readFileSync(file+'.json').toString();
        var bytecode = fs.readFileSync(file+'.abi').toString();
        var MyContract = new web3.eth.Contract(JSON.parse(interface),{from:from,gasPrice:'1597262155',gas:3000000,data:bytecode});
        // 如果你的账户是未锁定状态，可以将这里去掉
    //     web3.eth.personal.unlockAccount(from,password,function (err,result) {
    //         if (result){
                // 只保留这些
                MyContract.deploy({
                    data:bytecode,
                }).send({
                        from: from,
                        gas: 3000000,
                        gasPrice: '1597262155',
                        value:0
                    },function (error,transactionHash) {
                        if (error)
                            console.log(error)
                        console.log(transactionHash)
                    })
                    .on('error', function (error) {
                        console.log(error)
                    })
                    .on('transactionHash',function (transactionHash) {
                        console.log(transactionHash)
                    })
                    .on('receipt',function (receipt) {
                        console.log(receipt)
                    })
                    .on("confirmation", function (confirmationNumber,receipt) {
                        console.log(confirmationNumber)
                        console.log(receipt)
                    })
                    .then(function(newContractInstance){
                        console.log(newContractInstance.options.address) // instance with the new contract address
                        // 将合约部署的地址保存到本地
                        fs.writeFile(filename+'address.txt',newContractInstance.options.address,{},function (err,result) {
                            if (err){
                                console.log(err)
                            }
                            console.log('contract address write into contractAddress.txt');
                        })
                    });
    //         }
    //     })
    }
