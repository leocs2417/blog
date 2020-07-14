---
layout: post
title: "React Virtual DOM"
date: 2020-07-14 22:00
comments: true
categories:
 	- JS
tags: 
  - JS
  - React
---

> 如大家熟知，在目前主流的JS框架中，Vue, React均使用了虚拟DOM概念，来进行DOM的变更。

下面我们从三个部分讨论一下虚拟DOM在React中的原理和特点。

- 什么是虚拟DOM?

- 深入了解虚拟DOM

- 虚拟DOM中的diff算法
  
<!-- more -->

## 什么是虚拟DOM?

### 1. 一段代码：

```
  xxx
```

### 2. 一些相关的思考：

- 过程：当组件的state或者props发生改变的时候，render函数就会重新执行。重新渲染页面。


### 2. 
- 如果没有React，我们该如何实现这个功能？

- 思路a： 
  1. 定义state, 先有数据

  2. jsx template

  3. 数据 + 模板  结合  -> 生成真实的DOM， 渲染

  4. state 发生改变

  5. 数据 + 模板 结合  -> 生成新的DOM，替换原始的DOM

- a的缺陷：

第一次生成了一个完整的DOM片段
第二次生成了一个完整的DOM片段
第二次生成的DOM替换第一次的DOM，**非常耗性能**

- 思路a的改良尝试：思路b:

  1. 定义state, 先有数据

  2. jsx template

  3. 数据 + 模板  结合  -> 生成真实的DOM， 渲染

  4. state 发生改变

  5. 数据 + 模板 结合  -> 生成新的DOM，**并不直接**替换原始的DOM

  6. 新的DOM(Document Fragment：文档碎片)和原始的DOM做比对，找差异

  7. 找出input框发生了变化

  8. 只用新的DOM中的改变的input元素，替换掉老的DOM中的input元素 **此步骤性能得以提升**

- b的缺陷：DOM比对，多消耗性能，故性能的提升并不明显。

- 思路c：

  1. state 数据

  2. JSX 模板

  3. 数据 + 模板 结合， 生成真实DOM，来显示
  
  ```
    <div id="abc"><span>Hello, world</span></div>
  ```
  
  4. 生成虚拟DOM(虚拟DOM就是一个JS对象，用来**描述**真实DOM)
  
  ```
    ['div', {id: 'abc'}, ['span', {}, 'Hello, world']]
  ```

  5. 当 state发生变化 eg: Hello, world -> Bye bye

  6. 数据 + 模板 生成新的虚拟DOM (**极大的提升了性能**)

  ```
    ['div', {id: 'abc'}, ['span', {}, 'Bye bye']]
  ```

  7. 比较原始的虚拟DOM和新的虚拟DOM的区别，找到区别：是span中的内容

  8. 直接操作DOM，改变span中的内容

- c性能的减弱：生成虚拟DOM，多生成了一个JS对象，

但是， 生成一个JS对象相对的代价非常小；JS生成**DOM**代价极高：JS创建一个JS对象很简单，而创建DOM需要调用Web Appliction级别的API，性能损耗较大

- c性能的提升点： 
  6. 生成新的虚拟DOM， 创建了一个JS对象， 极大的提升性能

  7. 比对虚拟DOM，极大的提升性能

**注：** 实际上，真实的react中，先生成虚拟DOM，然后根据虚拟DOM的结构，生成真实的DOM，来显示