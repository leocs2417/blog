---
layout: post
title: 'Vue源码中，nextTick的实现原理'
date: 2019-11-11 21:00
comments: true
categories:
  - Vue源码
tags:
  - JS
  - Vue.js
  - 笔记
---

> nextTick 是 Vue 提供的一个官方 API，在 Vue 内部实现中，也经常用到。

## 主要作用：

- Vue 官方文档的解释是：在下次`DOM`更新循环结束之后执行延迟回调。在修改数据之后立即使用这个方法，获取更新后的`DOM`。

<!-- more -->

- 相对简单的理解是：它可以在等待`DOM`更新完毕之后，再去执行一个回调。

- 官方例子：

```
// 修改数据
vm.msg = 'Hello'
// DOM 还没有更新
Vue.nextTick(function () {
  // DOM 更新了
})

// 作为一个 Promise 使用 (2.1.0 起新增，详见接下来的提示)
Vue.nextTick()
  .then(function () {
  // DOM 更新了
})
```

## 什么时候需要用这个 API？

- 尽管**MVVM**框架不推荐进行`DOM`操作，但实际工作中，难免会有这种时候，尤其是和第三方框架配合的过程中，在我的工作中，是以`table`、`offSet`相关的时候，较多会用到访问`DOM`。

- 故特此记录，`nextTick`的实现原理。

## 源码分析：

### 源码位置：[src/core/util/next-tick.js](https://github.com/vuejs/vue/blob/dev/src/core/util/next-tick.js)

目前共**110 行**，相对比较易读。

### 源码主要分为两个部分：

- 能力检测

- 根据能力检测，以不同方式执行回调队列

#### 能力检测：

- EventLoop 分为宏任务(macro task)，和微任务(micro task)，不论是执行宏任务还是微任务，完成后都会进入下一个 tick，并在前后两次 tick 中间，进行 render UI。

- 由于宏任务的执行耗时更长，所以在浏览器支持的前提下，优先使用微任务，否则，使用宏任务。

- 由于各宏任务也存在性能不一的情况，所以根据浏览器的支持，判断选择使用哪种宏任务。

代码如下：

```
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve()
  timerFunc = () => {
    p.then(flushCallbacks)
    // In problematic UIWebViews, Promise.then doesn't completely break, but
    // it can get stuck in a weird state where callbacks are pushed into the
    // microtask queue but the queue isn't being flushed, until the browser
    // needs to do some other work, e.g. handle a timer. Therefore we can
    // "force" the microtask queue to be flushed by adding an empty timer.
    if (isIOS) setTimeout(noop)
  }
  isUsingMicroTask = true
} else if (!isIE && typeof MutationObserver !== 'undefined' && (
  isNative(MutationObserver) ||
  // PhantomJS and iOS 7.x
  MutationObserver.toString() === '[object MutationObserverConstructor]'
)) {
  // Use MutationObserver where native Promise is not available,
  // e.g. PhantomJS, iOS7, Android 4.4
  // (#6466 MutationObserver is unreliable in IE11)
  let counter = 1
  const observer = new MutationObserver(flushCallbacks)
  const textNode = document.createTextNode(String(counter))
  observer.observe(textNode, {
    characterData: true
  })
  timerFunc = () => {
    counter = (counter + 1) % 2
    textNode.data = String(counter)
  }
  isUsingMicroTask = true
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  // Fallback to setImmediate.
  // Technically it leverages the (macro) task queue,
  // but it is still a better choice than setTimeout.
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  // Fallback to setTimeout.
  timerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}
```

由此段**检测代码**可见，这里会进行一系列浏览器的检测：

- 优先检测：是否支持原生的`Promise`，若支持，就使用此微任务，并将 Flag: `isUsingMicroTask`设为`true`。

- 若不支持，检测是否支持`MutationObserver`，若支持，则使用此微任务，同上，并将 Flag: `isUsingMicroTask`设为`true`。

- 若也不支持，检测是否支持`setImmediate`，若支持，则使用此宏任务。

- 若以上，都不支持，就只能使用性能最差的`setTimeout`了。

#### 根据能力检测，以不同方式执行回调队列：

执行回调的代码：

```
import { noop } from 'shared/util'
import { handleError } from './error'
import { isIE, isIOS, isNative } from './env'

export let isUsingMicroTask = false

const callbacks = []
let pending = false

function flushCallbacks () {
  pending = false
  const copies = callbacks.slice(0)
  callbacks.length = 0
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}

export function nextTick (cb?: Function, ctx?: Object) {
  let _resolve
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx)
      } catch (e) {
        handleError(e, ctx, 'nextTick')
      }
    } else if (_resolve) {
      _resolve(ctx)
    }
  })
  if (!pending) {
    pending = true
    timerFunc()
  }
  // $flow-disable-line
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}
```

由此段**代码**可见，这里的基本流程就是：

- 接收回调函数，并将回调放进回调函数队列中。

- 在接收第一个回调时，执行上边**能力检测**中对应的异步方法。

- 如何保证只在接收第一个回调函数时执行异步方法？

传入的`cb`会被`push`进`callbacks`中存放起来，然后执行`timerFunc`（`pending`是一个异步锁 Flag，保证`timerFunc`在下一个`tick`之前只执行一次）。

注：`timeFunc`即为上边性能检测对应的异步方法。

#### 实现一个简单的 nextTick：

```
let callbacks = []
let pending = false

function nextTick (cb) {
  callbacks.push(cb)

  if (!pending) {
    pending = true
    setTimeout(flushCallback, 0)
  }
}

function flushCallback () {
  pending = false
  let copies = callbacks.slice()
  callbacks.length = 0
  copies.forEach(copy => {
    copy()
  })
}
```

> 由此代码可见：通过 nextTick 接收`cb`，使用`setTimeout`来异步执行`cb`。这样即可实现在 UI rerender 后，执行`cb`。
