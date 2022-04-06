---
layout: post
title: "单点登录(SSO)"
date: 2022-03-10 22:00
comments: true
categories:
 	- 浏览器
tags:
  - 浏览器
---

> 是现阶段较流行的企业业务整合的解决方案之一。 SSO的定义是在多个应用系统中，用户只需要登录一次就可以访问所有相互信任的应用系统。

## 技术背景：
  - 随着各大企业的业务范围的增大，大多会有多个同时使用的系统，每个系统都会有一套独立的登录模块。这样就会造成：使用人员在操作不同系统的时候，就需要多次进行登录的操作，不是很便捷。为了解决这个痛点，所以SSO就应运而生。
  
<!-- more -->

## 技术实现：

### 1. 普通登录的认证机制
  客户端(cookie) => 服务端(session)
  客户端登录后，会将cookie传给服务端，服务端通过cookie找到对应的唯一登录态session，来判断当前用户是否登录

### 2. 同一个顶级域名的“单点登录”

  如果同一个域名下，存在着多个系统，分别对应着不同的子域名，此时还是可以[将cookie存到顶级域名](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Cookies#cookie_%E7%9A%84%E4%BD%9C%E7%94%A8%E5%9F%9F)上去，从而实现多个子域名可以同时访问同一个cookie，进而服务端通过共享session来实现这个同域下的“单点登录”。
  

### 3. 真正的单点登录实现逻辑

  通常我们所指的单点登录，是在不同域下的。
  !['sso'](/assets/image/sso.png)

  上图为CAS官网上的标准流程图，具体流程如下：

  1. 用户访问app系统，app系统是需要登录的，但用户现在没有登录。
  2. 跳转到CAS server，即SSO登录系统。 SSO系统也没有登录，弹出用户登录页。
  3. 用户填写用户名、密码，SSO系统进行认证后，将登录状态写入SSO的session，浏览器（Browser）中写入SSO域下的Cookie。
  4. SSO系统登录完成后，服务端会生成一个Service Ticket，然后跳转到app系统，同时将Ticket参数传回给app系统。
  5. app系统拿到Ticket后，后台向SSO发送请求，验证有效性。
  6. 验证通过后，app系统将登录态写入session，并设置app域下的Cookie。

至此，跨域单点登录就完成了。以后我们再访问app系统时，app就是登录的。接下来，我们再看看访问app2系统时的流程。

1. 用户访问app2系统，app2系统没有登录，跳转到SSO系统。
2. 由于此时SSO已经登录了，则不需要重新登录。
3. SSO生成Ticket，浏览器跳转到app2系统，并将Ticket作为参数传递给app2。
4. 此时同样，app2拿到Ticket后，后台向SSO发送请求，验证有效性。
5. 验证成功后，app2将登录状态写入session，并在app2域下写入Cookie。
  
这个过程就是SSO系统的思路和逻辑。