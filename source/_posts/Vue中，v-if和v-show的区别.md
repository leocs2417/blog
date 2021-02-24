---
layout: post
title: 'Vue中，v-if和v-show的区别.md'
date: 2019-10-13 22:00
comments: true
categories:
  - Vue
tags:
  - JS
  - Vue
---

> ## v-if: 

- v-if用在**条件性地渲染**一块内容，这块内容只会在指令的表达式返回的值为**truthy**时，才会被执行渲染。

```
<h1 v-if="awesome">Vue is awesome!</h1>
```

<!-- more -->

- 也可以用 v-else 添加一个“else 块”：

```
<h1 v-if="awesome">Vue is awesome!</h1>
<h1 v-else>Oh no 😢</h1>
```

- 在template中，使用v-if 条件渲染分组

因为 v-if 是一个指令，所以必须将它添加到一个元素上。但是如果想切换多个元素呢？此时可以把一个 <template> 元素当做不可见的包裹元素，并在上面使用 v-if。最终的渲染结果将不包含 <template> 元素

```
<template v-if="ok">
  <h1>Title</h1>
  <p>Paragraph 1</p>
  <p>Paragraph 2</p>
</template>
```

## v-else、v-else-if

```
<div v-if="type === 'A'">
  A
</div>
<div v-else-if="type === 'B'">
  B
</div>
<div v-else-if="type === 'C'">
  C
</div>
<div v-else>
  Not A/B/C
</div>
```

- v-else，v-else-if 也必须紧跟在带 v-if 或者 v-else-if 的元素之后。

- 用 key 管理可复用的元素：Vue 会尽可能高效地渲染元素，通常会复用已有元素而不是从头开始渲染。这么做除了使 Vue 变得非常快之外，还有其它一些好处。例如，如果你允许用户在不同的登录方式之间切换：

```
<template v-if="loginType === 'username'">
  <label>Username</label>
  <input placeholder="Enter your username">
</template>
<template v-else>
  <label>Email</label>
  <input placeholder="Enter your email address">
</template>
```

- 那么在上面的代码中切换 loginType 将不会清除用户已经输入的内容。因为两个模板使用了相同的元素，`<input>`不会被替换掉——仅仅是替换了它的placeholder。

- Vue提供了一种方式来表达“这两个元素是完全独立的，不要复用它们”。只需添加一个具有唯一值的**key**属性即可：

```
<template v-if="loginType === 'username'">
  <label>Username</label>
  <input placeholder="Enter your username" key="username-input">
</template>
<template v-else>
  <label>Email</label>
  <input placeholder="Enter your email address" key="email-input">
</template>
```

- 现在，每次切换时，输入框都将被重新渲染。

- 注意，<label> 元素仍然会被高效地复用，因为它们没有添加 key 属性。

## v-show

- 另一个用于根据条件展示元素的选项是**v-show**指令。用法大致一样：

```
<h1 v-show="ok">Hello!</h1>
```

不同的是带有**v-show**的元素始终会被渲染并保留在**DOM**中。**v-show**只是简单地切换元素的CSS属性**display**。

注意：**v-show**不支持`<template>`元素，也不支持**v-else**。

## v-if vs v-show

- **v-if**是“真正”的条件渲染，因为它会确保在切换过程中条件块内的事件监听器和子组件适当地被销毁和重建。

- **v-if**也是惰性的：如果在初始渲染时条件为假，则什么也不做——直到条件第一次变为真时，才会开始渲染条件块。

- 相比之下，**v-show**就简单得多——不管初始条件是什么，元素总是会被渲染，并且只是简单地基于CSS进行切换。

- 一般来说**v-if**有更高的切换开销，而**v-show**有更高的初始渲染开销。因此，如果需要非常频繁地切换，则使用**v-show**较好；如果在运行时条件很少改变，则使用**v-if**较好。
