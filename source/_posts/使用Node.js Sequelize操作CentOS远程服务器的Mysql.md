---
layout: post
title: "使用Node.js Sequelize操作CentOS远程服务器的Mysql"
date: 2018-02-18 15:00
comments: true
categories:
 	- Node.js
tags: 
	- Node.js
	- Mysql
---

> 前端有时候也需要自己写后端以及数据库的代码，可能会使用Node.js作为服务端代码，并与数据库连接进行数据交互。

<!-- more -->

其中，操作数据库部分，这里使用的**mysql**：这里可以直接使用mysql包提供的接口，缺点是编写的代码比较底层，而且在代码中使用**SQL语句**安全性较差。

#### 这里使用的方法是**sequelize**操作数据库。
（学名为Node.JS的ORM框架，即把关系数据库的表结构映射到对象上）

#### 使用该框架，增删改查的都是JavaScript对象。

本文为使用Sequelize连接服务器上的Mysql。特此记录，仅供参考。

**步骤如下：**

1. 安装依赖

```
// 打开终端进入项目的根目录
npm install sequelize

// sequelize操作依赖于mysql2
npm install mysql2
```
2. 连接数据库

```
var Sequelize = require('sequelize');
// 数据库名, mysql的用户名, 密码
var sequelize = new Sequelize(db_name, user_name, password, {
	host: IP, // 服务端地址，默认localhost
	port:'3306',
  	dialect: 'mysql',
  	pool: {   //连接池设置
	    max: 5, //最大连接数
	    min: 0, //最小连接数
	    idle: 10000
	},
});
```
3. 测试连接

```
sequelize.authenticate().then(() => {
    console.log("数据库连接成功");
}).catch((err) => {
    //数据库连接失败时打印输出
    console.error(err);
    throw err;
});
```

4. 定义模型test，告诉Sequelize如何映射数据库表：

```
const test = sequelize.define('test', {
    id: {
        type: Sequelize.STRING(50),
        primaryKey: true
    },
    usr: Sequelize.STRING(100),
    name: Sequelize.STRING(100),
    updateTime: Sequelize.DATE
}, {
    timestamps: false // 关闭Sequelize的自动添加时间戳的功能
})
```

5. 写数据

```
// 主键必须有值
test.create({
    'id': 'testId',
    'usr': 'testUsr',
    'name': 'testName'
})
```

6. 删数据

```
notes.destroy({
 	where: {
 		'id': '123'
 	}
})
```

7. 改数据

```
// ES6
test.update({'name': 'newName'},
{
    'where': {
        'id': 'testId'
    }
}).then((res) => {
    console.log(res);
}).catch((err) {
    console.log(err);
})
```

8. 查数据

```
// ES7
(async ()=> {
	const res = await test.find({
        attributes: ['name', 'usr'],
        where: {
            'id': '123'
        }
    },{
        timestamps: false
    })
	console.log(res);
})();
```

**注：sequelize数据类型表传送门：https://blog.csdn.net/zdluoa/article/details/81194215**