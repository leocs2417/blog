---
layout: post
title: 'Vue中，计算属性vs方法vs侦听属性'
date: 2019-03-21 22:00
comments: true
categories:
  - Vue
tags:
  - JS
  - Vue
---

> template 中，内嵌的表达式，可以添加简单的运算，以便动态绑定显示一些值。

## 计算属性：

当 Vue.js 模板(template)中的内嵌表达式，逻辑较为复杂时，会使模板过重，且难以维护。

例如：

```
<div id="example">
  {{message.split('').reverse().join('')}
</div>
```

<!-- more -->

这时，模板中已经不算是简单的生命是逻辑，这里更优的做法，是将属性的计算方法，放到 computed 属性中。

### 基础例子：

**template:**

```
<div id="example">
  <p>Original message: "{{ message }}"</p>
  <p>Computed reversed message: "{{ reversedMessage }}"</p>
</div>
```

**js:**

```
var vm = new Vue({ // vm = view model
  el: '#example',
  data: {
    message: 'Hello'
  },
  computed: {
    // 计算属性的 getter
    reversedMessage: function () {
      // `this` 指向 vm 实例
      return this.message.split('').reverse().join('')
    }
  }
})
```

### 结果：

Original message: **"Hello"**

Computed reversed message: **"olleH"**

## 2. 计算属性 vs 方法：

上边的这个例子，通过表达式的形式，在**methods**中同样可以实现。

**template:**

```
<p>Reversed message: "{{ reversedMessage() }}"</p>
```

**js:**

```
// 在组件中
methods: {
  reversedMessage() {
    return this.message.split('').reverse().join('')
  }
}
```

这两种的实现方法，最后的结果是相同的。

### 不同点：

计算属性是基于它们的**响应式依赖**进行**缓存**的，只在相关响应式依赖发生改变时，才会重新求值。

这就意味着，只要上边例子中的 message 没有发生改变，多次访问 reversed 计算属性，会**立即返回**之前的计算结果，而不会再次执行函数。

### 注：Date.now()

这也同样意味着，下面的计算属性将不再更新，因为**Date.now()**不是响应式依赖：

```
computed: {
  now: function () {
    return Date.now()
  }
}
```

相比之下，每当触发重新渲染时，调用方法将总会再次执行函数。

### 为什么要缓存？

- 原因：当我们有一个性能开销比较大的计算属性**A**，它需要遍历一个巨大的数组并做大量的运算。然后我们可能有其他的计算属性依赖于**A**。
  如果这种情况下**没有缓存**，我们将不可避免地多次执行**A**的 getter！

反之，如果不希望缓存的场景下，可以用方法替代。

## 计算属性 vs 侦听属性：

Vue 中提供了一种更通用的方式来观察和响应 VUe 实例上的数据变动：**侦听属性**。

当有一些数据，需要随着他的数据变动而改变时，很容易就滥用**watch**。然而，通常更好的做法是：使用计算属性而不是命令式 watch 回调。

### 例子：

**template:**

```
<div id="demo">{{ fullName }}</div>
```

**js:**

```
var vm = new Vue({
el: '#demo',
data: {
  firstName: 'Foo',
  lastName: 'Bar',
  fullName: 'Foo Bar'
},
watch: {
  firstName: function (val) {
    this.fullName = val + ' ' + this.lastName
  },
  lastName: function (val) {
    this.fullName = this.firstName + ' ' + val
  }
}
})
```

上边的代码是命令式且重复的，将它与计算属性的版本进行比较：

```
var vm = new Vue({
  el: '#demo',
  data: {
    firstName: 'Foo',
    lastName: 'Bar'
  },
  computed: {
    fullName: function () {
      return this.firstName + ' ' + this.lastName
    }
  }
})
```

## 计算属性的setter：

计算属性默认只有**getter**，不过在需要时也可以提供一个**setter**：

```
// ...
computed: {
  fullName: {
    // getter
    get: function () {
      return this.firstName + ' ' + this.lastName
    },
    // setter
    set: function (newValue) {
      var names = newValue.split(' ')
      this.firstName = names[0]
      this.lastName = names[names.length - 1]
    }
  }
}
// ...
```

现在再运行vm.fullName = 'xxx yy' 时，setter会被调用，同时vm.firstName 和 vm.lastName 也会相应地被更新。

## 侦听器：

虽然计算属性在大多数情况下更合适，但有时也需要一个自定义的侦听器。这就是为什么Vue通过**watch**属性提供了一个更通用的方法，来响应数据的变化。

- 使用场景：当需要在数据变化时，执行**异步或开销较大**的操作时，使用**watch**是更优的。

例如：

**template:**

```
<div id="watch-example">
  <p>
    Ask a yes/no question:
    <input v-model="question">
  </p>
  <p>{{ answer }}</p>
</div>
```

**js:**

```
<!-- 因为 AJAX 库和通用工具的生态已经相当丰富，Vue 核心代码没有重复 -->
<!-- 提供这些功能以保持精简。这也可以让你自由选择自己更熟悉的工具。 -->
<script src="https://cdn.jsdelivr.net/npm/axios@0.12.0/dist/axios.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lodash@4.13.1/lodash.min.js"></script>
<script>
var watchExampleVM = new Vue({
  el: '#watch-example',
  data: {
    question: '',
    answer: 'I cannot give you an answer until you ask a question!'
  },
  watch: {
    // 如果 `question` 发生改变，这个函数就会运行
    question: function (newQuestion, oldQuestion) {
      this.answer = 'Waiting for you to stop typing...'
      this.debouncedGetAnswer()
    }
  },
  created: function () {
    // `_.debounce` 是一个通过 Lodash 限制操作频率的函数。
    // 在这个例子中，我们希望限制访问 yesno.wtf/api 的频率
    // AJAX 请求直到用户输入完毕才会发出。想要了解更多关于
    // `_.debounce` 函数 (及其近亲 `_.throttle`) 的知识，
    // 请参考：https://lodash.com/docs#debounce
    this.debouncedGetAnswer = _.debounce(this.getAnswer, 500)
  },
  methods: {
    getAnswer: function () {
      if (this.question.indexOf('?') === -1) {
        this.answer = 'Questions usually contain a question mark. ;-)'
        return
      }
      this.answer = 'Thinking...'
      var vm = this
      axios.get('https://yesno.wtf/api')
        .then(function (response) {
          vm.answer = _.capitalize(response.data.answer)
        })
        .catch(function (error) {
          vm.answer = 'Error! Could not reach the API. ' + error
        })
    }
  }
})
</script>
```

在这个示例中，使用watch属性，允许我们执行**请求一个API**（异步操作），限制我们执行操作的频率，并在得到最终的结果前，设置**中间状态**。这些都是计算属性无法做到的。
