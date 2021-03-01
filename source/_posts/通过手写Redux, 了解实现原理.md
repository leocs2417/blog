---
layout: post
title: "通过手写一个简单的Redux, 了解实现原理"
date: 2020-05-07 23:00
comments: true
categories:
		- React
tags:
		- React
		- JS
---

> Redux本身其实只是单纯的状态管理库, 不跟任何界面UI相关.

我们先从基本的用法入手, 然后尝试使用手动实现一个简易的Redux.

<!-- more -->

## 基本概念:

(来自Redux 中文网)
Redux是针对`JavaScript`应用程序的可预测状态容器.

它可以帮助您编写性能一致、在不同环境（客户端、服务器和原生环境）中运行且易于测试的应用程序.最重要的是, 它提供了出色的开发人员体验, 例如 带有时间旅行调试器的实时代码编辑.

可以将`Redux` 与`React`或任何其他类似的工具库一起使用. 他的体积很小（算上依赖也只有 2kB, 但是在其生态系统中有大量插件可用.

### 如何使用:

Redux在使用层面上, 主要分三个部分: `Store`, `Actions`, `Reducers`.

#### Store

-	用途: 存储(State)状态的仓库, 和一些操作状态的API, 使用用例: 初始化一个累加器的状态.

#### Actions

-	用途: 改变Store中的某个状态, 使用用例: 想在num上, 进行加操作.

#### Reducers

-	用途: 上边的State中, 只是**想**添加一项item, 实际操作要使用Reducer: 根据接收的action参数, 来改变Store中的状态

#### 整合简单实例:

```JavaScript
// Reducer 部分
const defaultState = {
	num: 0
}

export const reducer = (state = defaultState, action) => {
	switch(action.type) {
		case 'ADD_NUM':
			return { ...state, num: state.num + action.count };
		default:
			return state;
	}
}

// Store 部分
import { createStore } from 'redux';
import { reducer } from './reducer';
const store = createStore(reducer);
export default store;

// 某个使用`num`的组件
import { store } from './store';

// subscribe: 订阅状态改变
// 一旦store发生了变化, 传入的回调函数就会被调用
// 页面UI的更新操作, 就是在这里执行的
// getState: 返回当前的state
store.subscribe(() => console.log(store.getState()));

// dispatch: 分发状态改变的动作
const action = { type: 'ADD_NUM', count: 2 };
store.dispatch(action);
```
以上代码片段: 就是**使用**Redux, 实现对变量`num`的加操作.

### 实现一个简单的Redux

#### createStore

用途: 接收reducer方法作为参数, 然后返回一个Store对象.

核心: 发布订阅模式

- 关于Store主要用到的几个函数: `subscribe`, `dispatch`, `getState`.

代码: 

```JavaScript
export const createStore = () => {
	// state记录所有状态
  let state;              
	// 保存所有注册的回调
  let listeners = [];

	// subscribe: 保存传进来的回调函数
  const subscribe = (callback) => {
    listeners.push(callback);
  }

  // dispatch: 就是将所有的回调拿出来依次执行就行
  const dispatch = () => {
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      listener();
    }
  }

  // getState: 直接返回当前的state
  const getState = (state);

  // store: 集合相关函数并导出
  const store = {
    subscribe,
    dispatch,
    getState
  }
	// ... 一些错误处理
  return store;
}
```

#### combineReducers

用途: 顾名思义(Combined Reducers)组合Reducers, 当我们项目相对复杂后, 如果将所有逻辑都写在一个reducer里面, 会变得特别冗余, 这种情况下, 可以使用combineReducers这个API, 来模块化的编写多个reducer, 最后组合起来.

用法:

```JavaScript
import { createStore, combineReducers } from 'redux';

const defaultNum = {
	num: 0
}

export const numReducer = (state = defaultNum, action) => {
	switch(action.type) {
		case 'ADD_NUM':
			return { ...state, num: state.num + action.count };
		case 'DECREASE_NUM':
			return { ...state, num: state.num - action.count };
		default:
			return state;
	}
}

const defaultTheme = {
  color: 'red',
	fontSize: 16
};
function themeReducer(state = defaultTheme, action) {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, color: action.color };
		case 'SET_FONTSIZE':
			return { ...state, fontSize: action.fontSize };
    default:
      return state;
  }
}

// 组合reducer
const reducer = combineReducers({ numState: numReducer, themeState: themeReducer });

let store = createStore(reducer);

store.subscribe(() => console.log(store.getState()));

// 操作num的action
store.dispatch({ type: 'ADD_NUM', count: 1 });
store.dispatch({ type: 'DECREASE_NUM', count: 2 });

// 操作theme的action
store.dispatch({ type: 'SET_THEME', color: 'green' });
store.dispatch({ type: 'SET_FONTSIZE', fontSize: 18 });
```

代码: 

```JavaScript
export const combineReducers = (reducerMap) => {
	// 先把参数里面所有的键值拿出来
  const reducerKeys = Object.keys(reducerMap);
  
  // 返回值是一个普通结构的reducer函数
  const reducers = (state = {}, action) => {
    const newState = {};
    
    for(let key of reducerKeys) {
      // reducerKeys[i]: 对应每个reducer
      // 组合成reducer新的State: newState[key]集合
      const currentReducer = reducerMap[key];
      const prevState = state[key];
      newState[key] = currentReducer(prevState, action);
    }
    
    return newState;
  };
  // ... 一些错误处理
  return reducers;
}
```

### 拓展 Redux 功能

大多数的应用都会使用`middleware`或`enhancer`来拓展 Redux store 的功能.（注：middleware 很常见, enhancer 不太常见） middleware 拓展了 Redux dispatch 函数的功能；enhancer 拓展了 Redux store 的功能.

我们将会添加如下两个 middleware 和 一个 enhancer：

redux-thunk middleware, 允许了简单的 dispatch 异步用法.
一个记录 dispatch 的 action 和得到的新 state 的 middleware.
一个记录 reducer 处理每个 action 所用时间的 enhancer.

#### applyMiddleware

用途: 中间件是Redudx生态中较重要的一个概念, `applyMiddleware`就是用来引入相关的中间件的.

用法:

```JavaScript
// logger是一个中间件, 注意返回值嵌了好几层函数
// 我们后面来看看为什么这么设计
const logger = store => next => action => {
  console.group(action.type)
  console.info('dispatching', action)
  let result = next(action)
  console.log('next state', store.getState())
  console.groupEnd()
  return result
}

export default logger

// 调用createStore时, 将applyMiddleware作为第二个参数传进去
export const store = createStore(reducer, applyMiddleware(logger));
```

可以看到上述代码为了支持中间件, createStore传入了第二个参数, 这个参数官方称为enhancer, 顾名思义他是一个增强器, 用来增强store的能力的.官方对于enhancer的定义如下：

`type StoreEnhancer = (next: StoreCreator) => StoreCreator`

上面的结构的意思是说enhancer作为一个函数, 传进来一个参数StoreCreator, 同时return的也是一个StoreCreator相同结构的函数.

#### 使createStore支持enhancer

代码:

```JavaScript
const createStore = (reducer, enhancer) => {   // 接收第二个参数enhancer
  // 先处理enhancer
  // 如果enhancer存在并且是函数
  // 我们将createStore作为参数传给他
  // 应该返回一个新的createStore
  // 我再拿这个新的createStore执行, 应该得到一个store
  // 最后返回这个store
  if(enhancer && typeof enhancer === 'function'){
    const newCreateStore = enhancer(createStore);
    const newStore = newCreateStore(reducer);
    return newStore;
  }
  
  // 如果没有enhancer或者enhancer不是函数, 直接执行之前的逻辑
  // .......
  const store = {
    subscribe,
    dispatch,
    getState
  }

  return store;
}

export default createStore;
```

#### applyMiddleware

前面我们已经有了enhancer的基本结构, applyMiddleware是作为第二个参数传给createStore的, 也就是说他是一个enhancer, 准确的说是applyMiddleware的返回值是一个enhancer, 因为我们传给createStore的是他的执行结果applyMiddleware():

一个中间件的具体结构:

- 一个中间件接收store作为参数, 会返回一个函数
- 返回的这个函数接收老的dispatch函数作为参数, 会返回一个新的函数
- 返回的新函数就是新的dispatch函数, 这个函数里面可以拿到外面两层传进来的store和老dispatch函数

代码:

```JavaScript
const applyMiddleware = (middleware) => {
  const enhancer = (createStore) => {
    const newCreateStore = (reducer) => {
      const store = createStore(reducer);
      
      // 将middleware拿过来执行下, 传入store
      // 得到第一层函数
      const func = middleware(store);
      
      // 解构出原始的dispatch
      const { dispatch } = store;
      
      // 将原始的dispatch函数传给func执行
      // 得到增强版的dispatch
      const newDispatch = func(dispatch);
      
      // 返回的时候用增强版的newDispatch替换原始的dispatch
      return {...store, dispatch: newDispatch}
    }
    
    return newCreateStore;
  }
  
  return enhancer;
}

export default applyMiddleware;
```

#### 多个中间件

示例:

```JavaScript
applyMiddleware(
  rafScheduler,
  timeoutScheduler,
  thunk,
  vanillaPromise,
  readyStatePromise,
  logger,
  crashReporter
)
```

返回的newDispatch里, 将传入的middleware依次的串行执行就行.
多个函数的串行执行可以使用辅助函数compose, 这个函数定义如下, 最终需返回一个包裹了所有方法的方法.

compose函数:

```JavaScript
function compose(...func){
  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}
```

支持多个中间件的实现:

内部结构:

1. enhancer: 接收传入的store
2. newCreateStore: dispatch => newDispatch, 多个中间件的这层函数可以compose起来, 形成一个大的dispatch => newDispatch
3. return {...store, dispatch: newDispatch}.

代码:

```JavaScript
// 参数支持多个中间件
const applyMiddleware = (...middlewares) => {
  const enhancer = (createStore) => {
    const newCreateStore = (reducer) => {
      const store = createStore(reducer);
      
      // 多个middleware, 先解构出dispatch => newDispatch的结构
      const chain = middlewares.map(middleware => middleware(store));
      const { dispatch } = store;
      
      // 用compose得到一个组合了所有newDispatch的函数
      const newDispatchGen = compose(...chain);
      // 得到newDispatch
      const newDispatch = newDispatchGen(dispatch);

      return {...store, dispatch: newDispatch}
    }
    
    return newCreateStore;
  }
  
  return enhancer;
}

export default applyMiddleware;
```

## 总结

- Redux本身只是一个状态存储仓库(store).

- store: 里面存了所有的状态(state).

- 改变state: 通过dispatch(action).

- 分发出去的action: 通过reducer来处理, 处理后得到并返回新的state.

- subscribe: 订阅状态改变, 一旦store发生了变化, 传入的回调函数就会被调用.

- enhancer: 其实就是一个装饰者模式, 传入当前的createStore, 返回一个增强的createStore.

- 可以使用`applyMiddleware`添加中间件, applyMiddleware的返回值就是一个enhancer. 中间件也是一个装饰者模式, 传入当前的dispatch, return一个enhancer的dispatch.

- Redux只涉及数据层: 不涉及UI层.
