---
layout: post
title: "React Virtual DOM"
date: 2020-07-14 22:00
comments: true
categories:
    - React
tags:
    - React
    - JS
---

> 如大家熟知，在目前主流的JS框架中，React, Vue均使用了虚拟DOM概念，来进行**数据驱动视图的更新**。

下面我们分三个部分讨论一下虚拟DOM在React中的原理和特点。

- 什么是虚拟DOM?

- 深入了解虚拟DOM

- 虚拟DOM中的diff概念
  
<!-- more -->

## 什么是虚拟DOM?

1. DOM本质：**浏览器**的概念，用js对象来表示页面上的元素，并提供了**操作dom对象的API**。

2. 虚拟DOM：用**js对象**的形式，来模拟页面上Dom嵌套关系。(格式见部分二)

## 深入了解虚拟DOM:

### 1. 一段代码：

```
  render() {
    return (
      <div>hello world</div>
    );
  }
```

- 过程：当组件的`state`或者`props`发生改变的时候，render函数就会重新执行。重新渲染页面。

### 2. 一些相关的思考：

- a. 如果没有React，我们该如何实现**数据变化，更新视图**的功能？

- 思路1： 
  1. 定义`state`, 先有数据

  2. `jsx`模板

  3. `state` + `template`  结合 -> 生成真实的DOM，渲染

  4. `state`发生改变

  5. `state` + `template` 结合 -> 生成新的DOM，替换原始的DOM

- 思路1的缺陷：

  第一次生成了一个完整的DOM片段

  第二次生成了一个完整的DOM片段

  第二次生成的DOM替换第一次的DOM，**非常耗性能**

- 思路1的改良尝试：思路2:

  1. 定义state, 先有数据

  2. `jsx`模板

  3. `state` + `template` 结合 -> 生成真实的DOM， 渲染

  4. `state`发生改变

  5. `state` + `template` 结合 -> 生成新的DOM，**并不直接**替换原始的DOM

  6. 新的DOM(`Document Fragment`：文档碎片)和原始的DOM做比对，找差异

  7. eg: 找出`input`框发生了变化

  8. 只用新的DOM中的改变的`input`元素，替换掉老的DOM中的`input`元素 **此步骤性能得以提升**

- 2的缺陷：DOM比对，多消耗性能，故性能的提升并不明显。

- 思路3：

  1. `state`数据

  2. `jsx`模板

  3. `state` + `template` 结合，生成真实DOM，来显示
  
  ```
    <div id="abc"><span>Hello, world</span></div>
  ```
  
  4. 生成虚拟DOM(虚拟DOM就是一个JS对象，用来**描述**真实DOM)
  
  ```
    ['div', {id: 'abc'}, ['span', {}, 'Hello, world']]
  ```

  5. 当 state发生变化 eg: Hello, world -> Bye bye

  6. `state` + `template` 生成新的虚拟DOM (**极大的提升了性能**)

  ```
    ['div', {id: 'abc'}, ['span', {}, 'Bye bye']]
  ```

  7. 比较原始的虚拟DOM和新的虚拟DOM的区别，eg: 找到区别：是`span`中的内容

  8. 直接操作DOM，改变`span`中的内容

- 3性能的减弱：生成虚拟DOM，多生成了一个JS对象，

但是， 生成一个JS对象相对的代价非常小；JS生成**DOM**代价极高：JS创建一个JS对象很简单，而创建DOM需要调用Web Appliction级别的API，性能损耗较大

- c性能的提升点： 

  6. 生成新的虚拟DOM，创建了一个JS对象，极大的提升性能

  7. 比对虚拟DOM，极大的提升性能

**注：** 实际上，真实的react中，先生成虚拟DOM，然后根据虚拟DOM的结构，生成真实的DOM，来显示


- 一段代码：

```
render() {
    return (
      // JSX -> `createElement` -> 虚拟DOM(JS 对象) -> 真实的DOM
      <div><span>hello, world</span></div>

      // return React.createElement('div', {}, React.createElement('span', {}, 'hello, world' ))
    );
  }
```

这样做的优点：

1. 性能提升了。

2. 它使得跨端应用得以实现。RN(只有浏览器识别真实DOM，故可以通过虚拟DOM，被原生移动端识别)

## 虚拟DOM中的diff算法:

1. 先看一下todolist demo:

2. 几个问题：

- 问题1：什么时候会发生数据的变化？
  
  props, state的改变-> 归根结底都是调用setState的时候

- 问题2：哪一步需要diff? 

  比较原始虚拟DOM和新的虚拟DOM的比对，找出差异。

- 问题3：setSate 关键字：异步 (为什么？若连续setState三次，之更新一次虚拟DOM)

  !['state'](/blog/assets/image/reactState.jpg)

- 问题4：怎么比对的？逻辑是什么？

  从顶层开始，逐层，同层比对：
  !['diff'](/blog/assets/image/reactDiff.jpg)

  a. 做法：若某一层不同，下边所有节点全部更新。

  b. 另一个问题：若是这样做，只有外层一层不一样，下边所有子节点全相同，岂不是很浪费？

  c. 为什么这样：同层比对的算法，简单，比对速度快，进而减少了比对算法上的性能消耗

3. without keys VS with keys

  !['keys'](/blog/assets/image/reactKeys.jpg)

  场景：
    - 假设有一个数组，包含五个数据，页面第一次渲染时，会把这五个数据映射成五个虚拟DOM节点，生成虚拟DOM树，如图左。

    - 接着添加一个新的内容，数据发生变化，生成新的虚拟DOM树。

    - 接着对前后2个虚拟DOM进行对比，如果每一个节点，都没有一个自己的key值，节点和节点之间的关系就很难被对应上，所以需要两层循环比较。
  
  改善：
    - 如图右侧，给每个节点增加一个key，这样在比对的时候，就可以轻松发现一一对应的关系，只有`z`不同，这个时候，快速建立起关联后，只把`z`加进去即可。

  注：why no index as key in loop?

    - 若key值为index，在新的虚拟DOM树上，没办法保证前后key值一致。

    举例说明：再看一下`todolist` demo:
      - a:0 b: 1 c: 2  -> 删除a，重新渲染

      - b: 0 c: 1 -> 前后index值不一样，故失去了快速比对的条件。
  
写在最后：
Keys should be stable, predictable, and unique.Unstable keys (like those produced by Math.random() will cause many component instances and DOM nodes to be unnecessarily recreated, which can cause performance degradation and lost state in child components.