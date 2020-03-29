---
layout: post
title: "浏览器的工作原理及JS的运行机制"
date: 2019-06-06 20:00
comments: true
categories:
 	- JS
tags: 
    - 浏览器
    - JS
---

> 浏览器的工作原理及JS的运行机制。

## 大纲 

- 浏览器是多进程的
- 梳理浏览器内核中线程之间的关系
- 浏览器渲染流程
- 从Event Loop谈JS的运行机制
- 事件循环进阶：macrotask与microtask
- 浏览器的安全

## 宏观视角下的浏览器

### Chrome架构：仅仅打开一个页面，为什么有多个进程？

<!-- more -->

现代浏览器使用的都是多进程架构，打开一个网页时最少有4个进程：

1. Browser进程（主进程）：

    - 浏览器的界面显示，及用户交互（当前页面的前进后退）。
    - 其他页面的管理: 创建、销毁其他页面等。
    - 页面的Render渲染。
    - 网络资源的管理，下载等。

2. 网络进程：

    - 主要负责页面的网络资源加载，之前是作为一个模块运行在浏览器进程里面的，直至最近才独立出来，成为一个单独的进程。

3. Renderer进程（渲染进程）：

    - 核心任务是将 HTML、CSS 和 JavaScript 转换为用户可以与之交互的网页，排版引擎 Blink 和 JavaScript 引擎 V8 都是运行在该进程中，默认情况下，Chrome 会为每个 Tab 标签创建一个Renderer进程。出于安全考虑，Renderer进程都是运行在沙箱模式下。

4. GPU进程：
    
    - Chrome 刚开始发布的时候是没有GPU进程的。而GPU的使用初衷是为了实现 3D CSS 的效果，只是随后网页、Chrome 的 UI 界面都选择采用GPU来绘制，这使得GPU成为浏览器普遍的需求。最后，Chrome 在其多进程架构上也引入了GPU进程。

5. 页面进程：
    
    - 每打开一个页面，都会开启一个进程。

    注：Chrome中，多个空的tab页会合并为一个进程。

6. 插件进程：

    - 每个浏览器插件都是一个进程，考虑到插件易崩溃，所以单独进程。

参考图：

![](/assets/image/process.png)

### 多进程的优势？

- 单个页面或第三方插件**Crash**，不会影响整个浏览器。

- 充分利用设备**多核**优势。

- 方便使用沙盒模型隔离插件等进程，提高稳定性。

### HTTP请求流程：为什么很多网站第二次打开会快很多？

- DNS缓存
- 页面资源缓存

详细供参考链接：https://zhuanlan.zhihu.com/p/38240894

### 导航流程：从输入URL到页面展示，中间发生了什么？

简化版：

- 浏览器根据DNS服务器得到域名的IP地址。
    
- 向该IP地址的服务器发起HTTP请求。

- 服务器收到、处理、并返回HTTP请求。

- 浏览器得到返回内容，渲染流程开始。

详细供参考链接：https://zhuanlan.zhihu.com/p/23155051

## 浏览器内核（即Renderer进程）- 重点

大多时候，对于前端开发来讲，最重要、最需要清楚的就是**浏览器的渲染，即Renderer进程：**

- 页面的渲染，JS的执行，以及事件的轮询。

- 浏览器Renderer进程，即Renderer进程是**多线程的**。

### 主要包含哪些线程：
1. GUI渲染线程
    
    - 负责浏览器的界面渲染。

2. JS引擎线程

    - 负责JavaScript脚本的处理和解析。（例如Chrome V8引擎）。

    - 等待着任务队列中任务的到来，然后加以处理，一个Tab页只有一个JS线程。

3. 事件触发线程

    - 归属于浏览器而不是JS引擎，用来事件轮询。

    - 当**JS引擎**执行代码块，例如**用户点击**，**定时器**，**网络请求**等异步Function。会将此任务添加到**事件队列**（即事件触发线程）中。

    - 当对应的事件符合触发的条件，被触发时，事件线程会将其添加到事件队列的队尾，等待**JS引擎**的处理。

4. 定时器触发线程 **setTimeout**和**setInterval**
    
    - 定时器不是由JS引擎计时的。因为JS引擎是单线程的，如果处于阻塞状态会影响计时的准确性。
    
    - 为了保证计时的准确性，就单独起一个线程，来做计时，计时完毕后，排在事件队列中，等待JS引擎空闲后执行。

5. HTTP网络请求线程

    - 在**XMLHttpRequest**，连接后，起一个新线程，触发请求。

    - 将检测到状态变更时，如果设置有回调函数，异步线程就产生状态变更事件，将这个回调再放入事件队列中。再由JS引擎执行。


### HTML，CSS，JavaScript是如何变成页面的？

1. 根据HTML生成DOM Tree。
2. 根据CSS生成CSSOM。
3. 根据DOM Tree和CSSOM生成Render Tree。
4. 根据Render Tree开始渲染和展示。
5. 遇见**\<script>**标签，执行，并阻塞渲染。（与JS引擎线程互斥）

参考图：![Render process](/assets/image/render-page.png)

### WebWorker（HTML5 API）（简略）

#### 应用场景：

- 比如页面中包含耗时较大的算法代码时，就会阻塞线程影响浏览器渲染等。这时候就可把比较耗时的代码，放到**WebWorker**(另一个线程)中执行。

- **new Worker()**
    
- 流程：

    - 首先，JS引擎向浏览器申请开一个子线程创建worker线程（其本身不能操作DOM）

    - JS引擎线程与Worker线程间通过特定的方式通信（postMessage API，需要通过序列化对象来与线程交互特定的数据）

    - 待计算出结果后，将结果通信给JS主线程。

注：WebWorker是**当前页面专有**的。

详细供参考链接：https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers

### SharedWorker（简略）

#### 应用场景：

- 多个标签页、iframe之间的通信。

- **new SharedWorker('worker.js')**

- 前提都是同源的(相同的协议，域名和端口)

注：SharedWorker是浏览器所有页面共享的，它不隶属于某个Renderer进程，可以为多个Renderer进程共享。

详细供参考链接：https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker

## Browser进程与Renderer进程的通信具体实例

1. 当我们打开**任务管理器**后，新打开一个浏览器后，**任务管理器**中相应的增加了两个进程：
    
    - 主控进程

    - tab页面的Renderer进程

2. tab页非空白页的前提下，整个主要的渲染过程如下：

    - Browser进程收到请求，先要获取页面内容，然后将RendererHost接口传递给Renderer进程。

    - Renderer进程相应的接口收到消息，**处理后，交给渲染线程**，开始渲染：
    
    - 渲染线程收到收到请求，加载并渲染网页，期间可能需要Browser进程和GPU进程帮助渲染。
    - 期间，还可能会有JS线程进程DOM操作（操作可能会导致回流、重绘）。

    - 最后，**渲染结果**将传给Browser进程。

    - Browser进程收到结果并将结果绘制出来。

通信的过程参考图：
!['Browser communication'](/assets/image/browser-communication.png)

## V8工作原理（简略）

### 栈空间和堆空间：数据是如何存储的？

- 在JavaScript的执行过程中，主要有三种类型内存空间：代码空间、栈空间、堆空间。

- 原始类型的数据值都是直接保存在栈中的，引用类型的值都是保存在堆空间中的。

- 通常情况下，栈空间都不会设置太大，主要用来存放一些原始类型的小数据。堆空间很大，能存放很多大的数据。

- 原始类型的赋值会完整复制变量值，而引用类型的赋值是复制引用地址。

### 垃圾回收：垃圾数据是如何自动回收的？

对一些不需要的数据，我们称之为垃圾数据，由于内存是有限的，为了释放内存，我们需要对这么垃圾数据进行回收：

详细供参考链接：https://zhuanlan.zhihu.com/p/23992332


### 编译器和解释器：V8中是如何执行一段JS代码的？

详细供参考链接：https://juejin.im/post/5dc4d823f265da4d4c202d3b

## 浏览器中的JS运行机制 - 重点

当页面渲染首次完毕之后，就到了JS引擎线程运行的机制分析：

这里主要从EventLoop来说一下JS的执行。

### 几个概念：
- JS分同步任务和异步任务。

- 同步任务在**主线程**上执行，会形成一个**执行栈**。

- 另外，还有一个**事件触发线程**，负责**任务队列**，只要异步任务有了运行结果，就在任务队列中添加一个事件。

- 一旦**执行栈**中的同步任务全部执行完毕，即此时JS引擎线程空闲，就会开始读取任务队列，将可运行的异步任务加到执行栈中，开始执行。

流程如图：
    !['Event process img'](/assets/image/evt.png)

### 定时器：

上边的EventLoop机制的核心就是：**JS引擎线程**和**事件触发线程**。

- 在浏览器中，定时器不是JS引擎线程来控制的，而是由浏览器单独起一个定时器线程来计时的。

**单独起定时器线程的原因：**

- 因为JavaScript引擎是单线程的，一旦其正处于阻塞状态，会影响计时的准确性，所以浏览器单独起一个线程来做计时。

**什么时候会用到定时器线程：**

- 当使用**setTimeout**或**setInterval**的时候，需要用到定时器线程计时，待计时完成后，将相应事件推入事件队列中，排队等待**主线程**执行。

eg. 

    setTimeout(() => {
        console.log('hello!');
    }, 0);

    console.log('begin');
    
**注：**

执行结果：先begin，后hello。

虽然本身是0ms，随即推入事件队列，但在W3C标准中，低于4ms的间隔，按4ms算。

**setTimeout代替setInterval：**

用setTimeout模拟setInterval，和直接使用setInterval是有区别的，原因：

- setTimeout会在每次计时完毕后，就会去执行(有一定误差)，执行一段时间后才会继续setTimeout。

- 而setInterval每次都精确的隔一段时间推入一个事件。但是，事件的实际执行时间不一定就准确，还有可能是这个事件还没执行完毕，下一个事件就来了，这样就会导致累积效应。导致定时器**连续运行多次**，而中间**没有时间间隔**。

注：有时候**setTimeout**不能准确按照制定的延时时间执行，就是因为可能在它排在任务队列中时，主线程不是空闲状态，正在执行其它任务，所以会造成误差。

### **macrotask与microtask：**

#### JS任务类型分两种：**macrotask(宏任务)与microtask(微任务)**

1. macrotask - task:

    - 每次执行栈执行的代码就是一个宏任务，包括每次从事件队列中获取一个事件回调并放到执行栈中执行。

    - 每个task直到执行完毕，期间不会执行其他任务。

    - 浏览器为了能够使得JS内部task与DOM任务能够有序的执行，会在一个task执行结束后，在下一个 task 执行开始前，对页面进行重新渲染 （task->渲染->task->...）

2. microtask - jobs:

    - 在当前**task**执行完毕后，立即执行（在当前task任务后，下一个task之前，在渲染之前）。

    - 所以它的响应速度相比setTimeout（setTimeout是task）会更快，因为无需等渲染。

    - 在某一个macrotask执行完后，就会将在它执行期间产生的所有microtask都执行完毕（在渲染前）。

**注：**

- 宏任务微任务，简单来说，都是异步代码，一般情况下，一个宏任务内部总是先**按顺序执行同步代码**，之后再执行该宏任务中的微任务，等到都执行完毕，再进入下一个宏任务。

- **macrotask（宏任务）：**script标签包含的code、**setTimeout**、**setInterval**、**setImmediately**、**I/O**等。（可以看到，事件队列中的每一个事件都是一个macrotask）

- **microtask（微任务）：** **MutationObserver**，**Promise**，**process.nextTick**等
(浏览器中的优先级：process.nextTick > Promise > MutationObserver)。

总结：

- 所有宏任务都是放在一个事件队列中的，而这个队列由事件触发线程维护。

- 所有微任务都是添加到微任务队列（Job Queues）中，等待当前macrotask执行完毕后执行。

如图：

!['task img'](/assets/image/task.png)

一段代码：

    async function async1() {
        console.log(1)
        const result = await async2();
        console.log(3)
    }

    async function async2() {
        console.log(2);
    }

    Promise.resolve().then(() => {
        console.log(4)
    })

    setTimeout(() => {
        console.log(5)
    }, 0)

    async1();
    console.log(6);


## 浏览器安全（简略）

- 同源策略：为什么XMLHttpRequest不能跨域请求资源？

    - 同源策略会隔离不同源的 DOM、页面数据和网络通信，进而实现Web页面的安全性

- 跨域通信：

    1. 通过jsonp跨域
    2. document.domain + iframe跨域
    3. location.hash + iframe
    4. window.name + iframe跨域
    5. PostMessage跨域
    6. 跨域资源共享（CORS）
    7. Nginx代理跨域
    8. Nodejs中间件代理跨域
    9. WebSocket协议跨域

    详细供参考链接：https://juejin.im/post/5c23993de51d457b8c1f4ee1

- 网络攻击：

    - XSS(Cross Site Scripting - 跨站脚本攻击)：

        - 场景实例：

            - 在新浪博客写了一篇文章，同时偷偷插入一段**\<script>**

            - 在攻击代码中，获取cookie，发送到自己的服务器。

            - 发布博客，有人查看博客内容。

            - 则查看者的cookie发送到攻击者的服务器。

    - CSRF(Cross-site request forgery - 跨站请求伪造)：

        - 场景实例：
        
            - 你已登录一个购物网站。
            
            - 该网站的付费接口是xxx.com/pay?id=250，但没有验证。

            - 然后你收到一封邮件，隐藏着<img src=xxx.com/pay?id=250>

            - 查看邮件的时候，就已经悄悄购买了。

- 如何避免：

    - XSS：

        1. HttpOnly 防止劫取 Cookie

        2. 不要相信用户的任何输入。

        3. Server端做输出检查。

    - CSRF：

        1. 增加指纹，密码，短信验证码等。

        2. 增加Token验证。

    - HTTPS - 让数据传输更安全。

详细供参考链接：https://juejin.im/entry/5b4b56fd5188251b1a7b2ac1

本文其他参考链接：

https://time.geekbang.org/column/intro/216
https://juejin.im/post/5a6547d0f265da3e283a1df7
https://juejin.im/post/5dc12da8f265da4cfb512db0
