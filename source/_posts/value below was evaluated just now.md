---
layout: post
title: "浏览器中console.log()，出现'value below was evaluated just now'的情况"
date: 2019-02-13 21:00
comments: true
categories:
		- 浏览器
tags:
		- 浏览器
		- JS
---

> 偶然一次，在浏览器控制台，使用console.log()打印调试代码的时候，发现这样一个现象：

## 现象：

![value-null](/blog/assets/image/value-null.png)

<!-- more -->

对象/数组展开之前，是`{}`，但是展开之后，发现里面显示的是最终的输出结果。

## 原因：
chrome的解释是`'Value below was evaluated just now'`，后经查阅发现：

- 当在控制台展开`console.log()`打印出来的数组（对象），若此时数组（对象）的数据已经发生了改变，那么则显示改变后最终的数据。

注：Firefox下也有此现象。

参考链接：

https://stackoverflow.com/questions/4057440/is-chromes-javascript-console-lazy-about-evaluating-arrays#comment4358029_4057440

https://bugs.webkit.org/show_bug.cgi?id=35801