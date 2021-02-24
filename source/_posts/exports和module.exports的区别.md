---
layout: post
title: "exports和module.exports的区别"
date: 2019-08-31 20:00
comments: true
categories:
 	- JS
tags:
	- JS
---

> 使用 **require** 时，**exports** 和 **module.exports** 的区别

1. require:

```
	a. commonjs 规范
	b. require 缓存策略
	c. 同步异步
```


2. module

```
	a. has property: exports(type: Object)
	b. exports 只是 module.exports 的引用
```

<!-- more -->

3. 实例

```
//koala.js
let a = '程序员成长指北';

console.log(module.exports); //能打印出结果为：{}
console.log(exports); //能打印出结果为：{}

exports.a = '程序员成长指北哦哦'; //这里辛苦劳作帮 module.exports 的内容给改成 {a : '程序员成长指北哦哦'}

exports = '指向其他内存区'; //这里把exports的指向指走

//test.js

const a = require('/koala');
console.log(a) // 打印为 {a : '程序员成长指北哦哦'}
```

require 导出的内容是 module.exports 的指向的内存块内容，并不是 exports 的。 简而言之，区分他们之间的区别就是 exports 只是 module.exports 的引用，辅助后者添加内容用的。用内存指向的方式更好理解。

上面的代码等价于:

```
module.exports = somethings
exports = module.exports
```

复制代码原理很简单，即 module.exports 指向新的对象时，exports 断开了与 module.exports 的引用，那么通过 exports = module.exports 让 exports 重新指向 module.exports 即可。

参考文章：https://juejin.im/post/5d5639c7e51d453b5c1218b4
