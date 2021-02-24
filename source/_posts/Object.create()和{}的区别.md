---
layout: post
title: 'Object.create和{}的区别'
date: 2020-03-30 00:30
comments: true
categories:
  - JS
tags:
  - JS
---

> 在 Vue 源码中，创建新对象都使用了`Object.create(null)`，而没有使用`{}`。

在很多社区也都因为这个话题讨论过，特此记录一下。

<!-- more -->

## Object.create():

### 定义：

- `Object.create()`方法创建一个新对象，使用现有的对象来提供新创建的对象的`__proto__`。

### 语法：

`Object.create(proto[, propertiesObject])`

### 参数：

- proto

新创建对象的原型对象。

- propertiesObject

可选。如果没有指定为`undefined`，则是要添加到新创建对象的不可枚举（默认）属性（即其自身定义的属性，而不是其原型链上的枚举属性）对象的属性描述符以及相应的属性名称。这些属性对应 Object.defineProperties()的第二个参数。

### 返回值：

- 一个新对象，带着指定的原型对象和属性。

### 例子(MDN)：

```
const person = {
  isHuman: false,
  printIntroduction: function () {
    console.log(`My name is ${this.name}. Am I human? ${this.isHuman}`);
  }
};

const me = Object.create(person);

me.name = "Matthew"; // "name" is a property set on "me", but not on "person"
me.isHuman = true; // inherited properties can be overwritten

me.printIntroduction();
// expected output: "My name is Matthew. Am I human? true"
```

## Object.create()和{}的对比：:

### {}：

#### 例子：

```
let a = {o: 24};
console.log(a);
```

#### output:

!['output'](/assets/image/object.png)

从上图可以看到，使用`{}`新创建的对象，继承了`Object`自身的属性，例如`hasOwnProperty`、`toString`等，在新对象上可以直接使用。

### Object.create():

#### 例子：

```
let o = Object.create(null, {
  a: {
    writable: true,
    configurable: true,
    value: 24   
  }
});
console.log(o);
```

#### output:

!['output'](/assets/image/object-create.png)

由上图可见：新创建的属性，只有个自身一个属性`a`，其原型链上没有其他任何属性。也就是没有继承`Object`任何属性。若此时我们访问`o.toString()`会报错`Uncaught TypeError`。

#### 将第一个属性null改成{}：

```
let o = Object.create({}, {
  a: {
    writable: true,
    configurable: true,
    value: 24   
  }
});
console.log(o);
```


#### output:

!['output'](/assets/image/object-null.png)

此时不难发现，此时已经具有了和`{}`几乎一样的属性了，除了多了一层`_proto_`。

#### 将第一个属性null改成Object.prototype：

```
let o = Object.create(Object.prototype, {
  a: {
    writable: true,
    configurable: true,
    value: 24   
  }
});
console.log(o);
```

#### output:

!['output'](/assets/image/object-proto.png)

此时，已经和直接使用`{}`一样了。

## 为什么使用Object.create(null)?

#### 代码：
```
Object.create(null);
```

#### output:

```
{}
//No properties
```

- 由此可见：使用这样的方式初始化一个新对象，没有任何属性，这样是一个比较纯净的`map`。这样就可以自行扩展原型链的属性，同样包括原来既有的`hasOwnProperty`，`toString`这样的属性。

- 所以，使用`Object.create(null);`，就不必担心原型链上的属性被覆盖。

平时大多的普通场景，两者的差距并不是很在意，统一风格就好。
