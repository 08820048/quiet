# SpringBoot邮件集成

**摘要**：邮件大家都不会陌生，如果从功能上去做一个划分的话，比如可以有注册激活邮件、密码找回邮件等等，如果从邮件的形式上来划分的话，又可以有简单文本邮件、HTML 邮件（包括模板 HTML 邮

**分类**：Spring Boot

**标签**：Spring Boot, 后端

**发布时间**：2025-08-14T13:14:07

---



## SpringBoot邮件集成

### 概述

邮件大家都不会陌生，如果从功能上去做一个划分的话，比如可以有注册激活邮件、密码找回邮件等等，如果从邮件的形式上来划分的话，又可以有简单文本邮件、HTML 邮件（包括模板 HTML 邮件）、附件邮件、静态资源邮件等。就是这样我们可以把不同形式的邮件加以功能需求化，做成一个一个的邮件服务去满足我们的业务需求。在 **Spring Boot 中提供了一套针对于邮件服务的模块 spring-boot-starter-mail 以供我们开发项目需要的邮件服务。**我们可以在项目中开发很多基础的邮件服务的业务逻辑，去适应很多的业务场景。

> 下面是上面提到的`Spring-boot-starter-mail`依赖。

```xml
<!-- https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-mail -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
    <version>2.6.7</version>
</dependency>
```

我们开发的邮件服务就是实现发送邮件的一方可以不用去邮箱登录的网页去登录然后指定接收人，编辑邮件的内容等，这些工作内容我们全部交由给程序来实现，这样子集成的一套服务，当然发送邮件，接收邮件，中间的形式可以有很多的拓展，这些都可以交给代码来实现，所以我们来明确一下这些关系：

发件人，比如我们需要在一个邮箱平台申请一个自己的邮箱用户名和密码，然后需要有服务器来作为中转，不同的邮箱对应的服务器也不一样，所以就有了邮件服务器的概念，然后就是邮件本身，要有主题、收件人、抄送、正文、附件等。这样一来我们的程序比如实现发送一个简单的文本邮件给我想要发送的对象就可以将需要的邮件在程序中定义好，静态或者动态地组装，然后将邮件推送到远程邮件服务器的端口，由远程的邮件服务器推送给我们想要让邮件被接收到的对象邮箱中去。这一套代码省掉了我们与邮箱服务器的现实交互，而让代码作为了一个邮件推送的客户端，来和远程邮件服务器进行沟通。

### Jasypt 加密包

为什么要加密包呢？因为我们在使用邮件服务时，需要用到邮件服务器的授权码或者密码，这些属于敏感信息，通过加密的方式使用会相对安全很多。所以这里采用Jasyot配置文件加加解密的方式，相关的依赖如下：

```xml
<!-- https://mvnrepository.com/artifact/com.github.ulisesbocchio/jasypt-spring-boot-starter -->
<dependency>
    <groupId>com.github.ulisesbocchio</groupId>
    <artifactId>jasypt-spring-boot-starter</artifactId>
    <version>3.0.4</version>
</dependency>
```

Jasypt作为一个为项目增加加密功能实现的Java类包，主要包括的内容有:

- 密码Digest认证；
- 文本和对象加密；
- 集成`Hibernate`、`Spring Security(Acegi)`来增强密码管理。

### POP3、SMTP 及 IMAP 的介绍

#### POP3

POP3 是 Post Office Protocol 3 的简称，即邮局协议，它做的事情是规定如何将个人计算机连接到 Internet 的邮件服务器和下载电子邮件的电子协议。它是因特网电子邮件的第一个离线协议标准，POP3 允许用户从服务器上把邮件存储到本地主机，即自己的计算机上，同时删除保存在邮件服务器上的邮件，而 POP3 服务器则是遵循 POP3 协议的接收邮件服务器，用来接收电子邮件的。

#### SMTP

SMTP 是 Simple Mail Transfer Protocol 的简称，即简单邮件传输协议。它是一组用于从源地址到目的地址传输邮件的规范，通过它来控制邮件的中转方式。需要注意的是，SMTP 协议属于 TCP/IP 协议簇，它帮助每台计算机在发送或中转信件时找到下一个目的地。SMTP 服务器就是遵循 SMTP 协议的发送邮件服务器。另外一个大家需要注意的概念是 SMTP 认证，简单地说就是要求必须在提供了账户名和密码之后才可以登录 SMTP 服务器，它提供的这个机制就可以在很大程度上避免垃圾邮件等不安全邮件的接收。这里的账户名是你的邮箱账号名，而密码就是刚刚那个只出现了一次的授权码。

![图片描述](https://b3logfile.com/file/2022/08/solo-fetchupload-17455862594931618658-e545e0e3.png)

#### IMAP

IMAP 是 Internet Mail Access Protocol 的简称，即交互式邮件存取协议，它是跟 POP3 类似邮件访问标准协议之一。不同的是开启了 IMAP 后，你在电子邮件客户端收取的邮件仍然保留在服务器上，同时在客户端上的操作都会反馈到服务器上，如：删除邮件，标记已读等，服务器上的邮件也会做相应的动作。所以无论从浏览器登录邮箱或者客户端 软件登录邮箱，看到的邮件以及状态都是一致的。

### 新浪邮箱端的配置

前面我们提到过了，作为发送方我们需要一个第三方的邮箱服务器平台，有很多可以选择，比如 新浪邮箱、QQ 邮箱、Gmail 谷歌邮箱等等。这里选择新浪邮箱作为演示。然后需要注意的是我们需要做一些改动在邮箱设置里面，需要将 IMAP/SMTP 服务和 POP3/SMTP 服务打开，这里按照它的流程简单做完之后会生成一个授权码，它提示的授权码只会出现一次，所以这个时候大家一定要做好这个授权码的备份。开启这个主要是为了让这个邮件服务器能够发现我们的客户端，我们需要将邮件推给它转发就需要和它约定好交互的规范。

![](https://b3logfile.com/file/2022/08/solo-fetchupload-6931029966253997293-08929772.png)

### 演示demo

> 通过一个简单的项目来实际操作一下吧。

#### 创建SpringBoot项目

> 我这里以spring-boot-demo-mail为名创建一个项目。

将上面提到的两个依赖添加到pom.xml中，文件内容如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.6.7</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>
    <groupId>com.example</groupId>
    <artifactId>spring-boot-demo-mail</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>spring-boot-demo-mail</name>
    <description>spring-boot-demo-mail</description>
    <properties>
        <java.version>11</java.version>
    </properties>
    <dependencies>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>

        <!-- https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-mail -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-mail</artifactId>
            <version>2.6.7</version>
        </dependency>

        <!-- https://mvnrepository.com/artifact/com.github.ulisesbocchio/jasypt-spring-boot-starter -->
        <dependency>
            <groupId>com.github.ulisesbocchio</groupId>
            <artifactId>jasypt-spring-boot-starter</artifactId>
            <version>3.0.4</version>
        </dependency>
      
        <dependency>
            <groupId>cn.hutool</groupId>
            <artifactId>hutool-all</artifactId>
        </dependency>

        <!-- Spring Boot 模板依赖 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-thymeleaf</artifactId>
        </dependency>
      
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

### spring-boot-starter-mail

我们在 `pom.xml` 文件中引入了核心的依赖模块，spring-boot-demo-mail，从外部来看我们开发的程序代码是实现了将我们程序定制化的 Email 邮件发送给了外部的邮箱服务器比如我们本次实验选择的网易邮箱服务器 smtp.sina.com，但是具体是怎么实现的呢，这就得依仗这个模块了，该模块提供给我们了一个核心的抽象接口 MailSender，我们可以看下它的源码：

```java
package org.springframework.mail;

public interface MailSender {
    void send(SimpleMailMessage var1) throws MailException;

    void send(SimpleMailMessage... var1) throws MailException;
}
```

在这里面定义了两个 send 方法，其中第二个为可变长参数方法。都用于发送邮件给远程的邮箱服务器，而且我们看到每个邮件被封装为了 SimpleMailMessage 类，这个类是简单邮件类，它实现了 MailMessage 接口，我们来看看一个规范的邮件应该包含哪些属性。

```java
package org.springframework.mail;

import java.util.Date;

public interface MailMessage {
    void setFrom(String var1) throws MailParseException;

    void setReplyTo(String var1) throws MailParseException;

    void setTo(String var1) throws MailParseException;

    void setTo(String... var1) throws MailParseException;

    void setCc(String var1) throws MailParseException;

    void setCc(String... var1) throws MailParseException;

    void setBcc(String var1) throws MailParseException;

    void setBcc(String... var1) throws MailParseException;

    void setSentDate(Date var1) throws MailParseException;

    void setSubject(String var1) throws MailParseException;

    void setText(String var1) throws MailParseException;
}
```

所以我们在“定制”一封邮件的时候要注意 set 这些属性，包括来源、发给谁的、文本内容是什么具体的信息等等。定制好之后我们就可以调用 JavaMailSender 的 send 方法把这个邮件发给中转服务器了，这就是 Spring Boot 集成邮件服务的一个发送实现原理，可以简化为下图所示。

![](https://b3logfile.com/file/2022/08/solo-fetchupload-7085835425988572170-0fa3366b.png)

观察项目的其他几个依赖，先说明一下 Jasypt 配置文件加解密我们刚刚在上面提到过了，另外我们也引入了 hutool-all 这个工具包，方便于我们使用很多的工具类，另外我们需要重点介绍一下有关 Spring Boot 模板依赖的 thymeleaf。

首先说明一下业务需求，我们希望每个邮件的生成不是刻板的，生硬的，每一个邮件都是全字段编辑的话在代码上看起来就没有一个灵活性，所以我们希望能够定制化一个模板以填充的方式去定义一些可改变的字段属性，而一些额外标准的字段我们就不需要进行改动了，那么就使用模板化的思想来解决这个问题。

Thymeleaf 是一个开源的 Java 库，是一个基于 XML/XHTML/HTML5 的模板引擎，可用于在 Web 和非 Web 环境中的应用开发，我们在项目开发过程中完全可以使用它来代替 JSP 或其他的模板引擎。Thymeleaf 的主要目标是提供一种可被浏览器正确显示、格式良好的模板创建方式，相对于编写逻辑或者代码开发者只需要将标签属性添加到模板中即可，然后这些标签属性就会在 DOM（文档对象模型）上执行预先指定好的逻辑。

Thymeleaf 主要以属性的方式加入到 html 标签中，浏览器在解析 html 时，当检查到没有的属性时候会忽略，所以 Thymeleaf 的模板可以通过浏览器直接打开展现，这样非常有利于前后端的分离。

### 修改项目结构

- 我们在 `src/main` 下新建 resources 文件夹，并在这一级目录下新建三个文件夹，分别是 email、static、templates，并且在 resources 文件夹下新建我们的配置文件 `appliction.yml` 。
- 在 email 文件夹下新建 `test.html` 文件，在 static 文件夹中存一张图片，你可以从你电脑的本地选择一张放进去，然后在 templates 文件夹下新建一个 `welcome.html` 文件。
- 然后我们在 `src/main/java/com/example` 路径下新建 service 文件夹，并在 service 下面新建 impl 文件夹，在 service 目录下新建 `MailService.java` 文件，在 impl 文件夹下新建 `MailServiceImpl.java` 文件。
- 接下来到 test 路径下去修改项目结构，我们在 `test/java/com/example/` 路径下面新建 `PasswordTest.java` 文件。并在 `test/java/com/example` 路径下新建 service 文件夹，在里面新建 `MailServiceTest.java` 文件。 先把这些文件和文件夹新建起来了，我们可以对比一下现在项目结构是否如下图所示：

> 这里要说明的是，创建SpringBoot项目的方式有很多种，不同的方式创建之后的项目结构会有所不同，所以上面的步骤仅仅是作为一个参考，具体根据自己的项目来就好了。下面是我的项目目录结构：

```java
├─.idea
│  ├─inspectionProfiles
│  ├─libraries
│  └─ZeppelinRemoteNotebooks
├─.mvn
│  └─wrapper
├─src
│  ├─main
│  │  ├─java
│  │  │  └─com
│  │  │      └─example
│  │  │          └─springbootdemomail
│  │  │              └─service
│  │  │                  └─Impl
│  │  └─resources
│  │      ├─Mail
│  │      ├─static
│  │      └─templates
│  └─test
│      └─java
│          └─com
│              └─example
│                  └─springbootdemomail
│                      └─service
└─target
    ├─classes
    │  ├─com
    │  │  └─example
    │  │      └─springbootdemomail
    │  │          └─service
    │  │              └─Impl
    │  ├─Mail
    │  ├─static
    │  └─templates
    ├─generated-sources
    │  └─annotations
    ├─generated-test-sources
    │  └─test-annotations
    └─test-classes
        └─com
            └─example
                └─springbootdemomail
                    └─service
```

![](https://b3logfile.com/file/2022/08/solo-fetchupload-14789571986782229996-6617b660.png)

![](https://b3logfile.com/file/2022/08/solo-fetchupload-17067873850569313732-1ce8f5f3.png)

我们主要是要做一些测试任务在本次demo中，分有两个大类的方向，一个是密码的测试，上面提到了将邮箱服务器平台提供给我们的授权码加密处理，这部分做加密的测试，另外一个 `MailService.java` 要做的是邮件发送的测试，我们要测试简单邮件、HTML 邮件、附件邮件、静态资源邮件的发送，所以我们在项目的主目录的 resources 下新建了三个包，分别装测试邮件、附件还有静态资源文件。我们将与邮件发送相关的一些逻辑还有不同类型邮件发送的方法放到了主路径 service 包里面，当然整体项目的配置信息我们要在 `application.yml` 中去配置。

### 配置application.yml

> 由于需要测试加密功能，所以先在配置文件中添加Jasypt的解密密钥。也可以顺便把邮件集成的信息配置好：

```yaml
spring:
  mail:
    host: smtp.sina.com
    #默认端口号465
    port: 465
    username: workcoder@sina.com
    # 使用 jasypt 加密密码，使用com.xkcoding.email.PasswordTest.testGeneratePassword 生成加密密码，替换 ENC(加密密码)
    password: ENC(加密后的授权码)
    protocol: smtp
    properties:
      mail.smtp.starttls.enable: true
      mail.smtp.ssl.enable: true
#      mail.display.sendmail: spring-boot-demo

# 为 jasypt 配置解密秘钥
jasypt:
  encryptor:
    password: spring-boot-demo
```

> 注意，我使用的是新浪邮箱，如果你的邮箱和我同一个炮台，那么跟着作应该没问题，否则可能会有一些差异。

### 测试加密

![](https://b3logfile.com/file/2022/08/solo-fetchupload-11893196081874573876-9c4e1beb.png)

![](https://b3logfile.com/file/2022/08/solo-fetchupload-6595419376637815685-0b2d2d8d.png)

接下来我们编写各种类型邮件的业务接口 `MailService.java` 和实现类 `MailServiceImpl.java` 以及各种相关的测试类。

- 编写方法接口

> 下面可以看到我们的业务类里面的邮件类型具体有：文本邮件也可以说是普通邮件、HTML 邮件、带附件的邮件（在本次实验中我们传送的附件是图片类型）、带有静态资源的邮件。

```java
package com.example.service;

import org.jasypt.encryption.StringEncryptor;
import org.springframework.beans.factory.annotation.Autowired;

import javax.mail.MessagingException;

/**
 * @author: Tisox
 * @date: 2022/5/9 22:05
 * @description: 邮件发送工具业务接口
 * @blog:www.waer.ltd
 */
public interface MailService {

    /**
     * 发送普通文本邮件
     * @param to 收件人地址
     * @param subject 邮件主题
     * @param content 邮件内容
     * @param cc 抄送地址
     */
    void sendSimpleMail(String to,String subject,String content,String... cc);

    /**
     * 发送HTML邮件
     * @param to 收件人地址
     * @param subject 邮件主题
     * @param content 邮件内容
     * @param cc 抄送地址
     */
    void sendHtmlMail(String to,String subject,String content,String... cc);

    /**
     * 发送带附件的邮件
     * @param to 收件人
     * @param subject 邮件主题
     * @param content 邮件内容
     * @param filePath 附件地址
     * @param cc 抄送地址
     * @throws MessagingException 邮件发送异常
     */
    void sendAttachmentsMail(String to, String subject, String content, String filePath, String... cc) throws MessagingException;


    /**
     * 发送正文中有静态资源的邮件
     * @param to 收件人地址
     * @param subject 邮件主题
     * @param content 邮件内容
     * @param rscPath 静态资源地址
     * @param rscId 静态资源ID
     * @param cc 抄送地址
     * @throws MessagingException 发送异常
     */
    void sendResourceMail(String to, String subject, String content, String rscPath, String rscId, String... cc) throws MessagingException;


}
```

- 编写对应的接口实现类

```java
package com.example.service.Impl;

import cn.hutool.core.util.ArrayUtil;
import com.example.service.MailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.util.ArrayUtils;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import java.io.File;

/**
 * @author: Tisox
 * @date: 2022/5/9 22:05
 * @description: 邮件发送接口实现类
 * @blog:www.waer.ltd
 */
@Service
public class MailServiceImpl implements MailService {
    @Autowired
    private JavaMailSender mailSender;
    @Value("${speing.mail.username}")
    private String from;


    /**
     * 实现普通文本邮件发送
     * @param to 收件人地址
     * @param subject 邮件主题
     * @param content 邮件内容
     * @param cc 抄送地址
     */
    @Override
    public void sendSimpleMail(String to, String subject, String content, String... cc) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(content);
        if(ArrayUtil.isNotEmpty(cc)){
            message.setCc(cc);
        }
        mailSender.send(message);
    }

    /**
     * 实现发送HTML类型邮件
     * @param to 收件人地址
     * @param subject 邮件主题
     * @param content 邮件内容
     * @param cc 抄送地址
     */
    @Override
    public void sendHtmlMail(String to, String subject, String content, String... cc) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setFrom(from);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(content,true);
        if(ArrayUtil.isNotEmpty(cc)){
            helper.setCc(cc);
        }
        mailSender.send(message);
    }

    /**
     * 实现发送带附件的邮件
     * @param to 收件人
     * @param subject 邮件主题
     * @param content 邮件内容
     * @param filePath 附件地址
     * @param cc 抄送地址
     * @throws MessagingException
     */
    @Override
    public void sendAttachmentsMail(String to, String subject, String content, String filePath, String... cc) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setFrom(from);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(content);
        if(ArrayUtil.isNotEmpty(cc)){
            helper.setCc(cc);
        }
        FileSystemResource file = new FileSystemResource(new File(filePath));
        String fileName = filePath.substring(filePath.lastIndexOf(File.separator)+1);
        helper.addAttachment(fileName, file);
        mailSender.send(message);
    }

    /**
     * 实现发送正文中有静态资源的邮件
     * @param to 收件人地址
     * @param subject 邮件主题
     * @param content 邮件内容
     * @param rscPath 静态资源地址
     * @param rscId 静态资源ID
     * @param cc 抄送地址
     * @throws MessagingException
     */
    @Override
    public void sendResourceMail(String to, String subject, String content, String rscPath, String rscId, String... cc) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setFrom(from);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(content, true);
        if (ArrayUtil.isNotEmpty(cc)) {
            helper.setCc(cc);
        }
        FileSystemResource res = new FileSystemResource(new File(rscPath));
        helper.addInline(rscId, res);
        mailSender.send(message);
    }
}
```

其中，下面的代码是将我们在配置文件中配置好的邮箱的用户名，也就是邮件的发送者注入到该类中，方便后面的方法使用。

```java
@Value("${spring.mail.username}")
private String from;
```

### 发送普通文本邮件

````java
/**
     * 实现普通文本邮件发送
     * @param to 收件人地址
     * @param subject 邮件主题
     * @param content 邮件内容
     * @param cc 抄送地址
     */
    @Override
    public void sendSimpleMail(String to, String subject, String content, String... cc) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(content);
        if(ArrayUtil.isNotEmpty(cc)){
            message.setCc(cc);
        }
        mailSender.send(message);
    }
````

这几个发送邮件的方法都没有返回值，我们看 sendSimpleMail 这个方法传入的参数，包含的有 to、subject、content 等几个参数，表明我们这封邮件要发给的具体的对应邮箱是谁、抄送邮件的主题是什么以及具体的这封邮件的文本内容。普通类型的邮件是 SimpleMailMessage 这个类，另外如果还有多个参数传入的话，就会设置 SimpleMailMessage 的 Cc 属性，这是一个字符串的数组。最后封装好了这个普通文本邮件的对象之后，message 对象调用 send 方法就可以实现邮件的发送。

另外我们需要注意的是，除了这种普通文本类的邮件的发送封装的是 SimpleMailMessage 对象，其他几种类型的邮件的发送都是使用的 MimeMessage 这个对象，而且在发送之前我们是在 MimeMessage 这个的基础上再封装了一层 MimeMessageHelper，利用这个 Helper 来进行邮件的 From、To 等这些属性的封装以及最后邮件的发送。可以看一下这个 MimeMessageHelper 的属性有哪些，很明显的会比 SimpleMailMessage 这个类的属性多。所以在普通的文本邮件的基础上，MimeMessageHelper 对邮件封装的功能进行了拓展。

> SimpleMailMessage 的属性

```java
@Nullable
    private String from;
    @Nullable
    private String replyTo;
    @Nullable
    private String[] to;
    @Nullable
    private String[] cc;
    @Nullable
    private String[] bcc;
    @Nullable
    private Date sentDate;
    @Nullable
    private String subject;
    @Nullable
    private String text;
```

> MimeMessageHelper 的属性

```java
public static final int MULTIPART_MODE_NO = 0;
public static final int MULTIPART_MODE_MIXED = 1;
public static final int MULTIPART_MODE_RELATED = 2;
public static final int MULTIPART_MODE_MIXED_RELATED = 3;
private static final String MULTIPART_SUBTYPE_MIXED = "mixed";
private static final String MULTIPART_SUBTYPE_RELATED = "related";
private static final String MULTIPART_SUBTYPE_ALTERNATIVE = "alternative";
private static final String CONTENT_TYPE_ALTERNATIVE = "text/alternative";
private static final String CONTENT_TYPE_HTML = "text/html";
private static final String CONTENT_TYPE_CHARSET_SUFFIX = ";charset=";
private static final String HEADER_PRIORITY = "X-Priority";
```

> MimeMessage 属性

```java
protected DataHandler dh;
protected byte[] content;
protected InputStream contentStream;
protected InternetHeaders headers;
protected Flags flags;
protected boolean modified;
protected boolean saved;
protected Object cachedContent;
private static final MailDateFormat mailDateFormat = new MailDateFormat();
private boolean strict;
private boolean allowutf8;
private static final Flags answeredFlag;
```

### 测试发送邮件

- 测试普通邮件

```java
@Autowired
public MailService mailService ;

@Test
public void sendSimpleMail() {
    mailService.sendSimpleMail("邮件接收人的邮箱地址","邮件测试内容","这是一封简单的文本邮件测试！！");
}
```

- 测试Html邮件

> 我们在 sendHtmlMail 方法中，使用了 thym eleaf 包中的 Context 来包装需要在模板中填充的内容，下面是 Context 继承的关系图，顶级接口是 IContext 这个接口，大家可以去本地看看源码学习一下，这里就不展开说明了，通过 context 这个对象我们主要完成的任务就是将需要填充进模板的变量进行属性赋值。

![](https://b3logfile.com/file/2022/08/solo-fetchupload-2473606172296197290-b1ec6412.png)

> 我们之前在 `resources/templates` 路径下面新建了 `welcome.html` 这个文件的，那么我们在使用 templateEngine 模板引擎调用它的 process 方法的时候就会去我们的模板默认模板路径下面去找这个文件，并根据 Context 对象设置的几个 variable 变量对应着模板中的内容去填充，可以对应着 sendHtmlMail 方法和 `welcome.html` 中的内容来看，所以接下来我们修改一下那几个资源文件的内容。

- welcome.html

```html
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8" />
    <title>SpringBootDemo</title>
    <style>
        body {
            text-align: center;
            margin-left: auto;
            margin-right: auto;
        }

        #welcome {
            text-align: center;
        }
    </style>
</head>
<body>
<div id="welcome">
    <h2>
        <span th:text="${title}"></span>
    </h2>
    <h3>
        欢迎使用 <span th:text="${blog}"></span> - Powered By
        <span th:text=" ${author}"></span>
    </h3>
    <span th:text="${url}"></span>
    <div style="text-align: center; padding: 10px">
        <a
                style="text-decoration: none;"
                href="#"
                th:href="@{${url}}"
                target="_bank"
        >
        </a>
        <strong>送你一张精美壁纸</strong>
    </div>
    <div style="width: 100%;height: 100%;text-align: center;display: flex">
        <div style="flex: 1;"></div>
        <div style="display: flex;width: 400px;">
            <div style="flex: 1;text-align: center;">
                <div>
                    <img
                            width="180px"
                            height="180px"
                            src="https://images.waer.ltd/img/1170880.jpg"
                    />
                </div>
            </div>
        </div>
        <div style="flex: 1;"></div>
    </div>
</div>
</body>
</html>
```

- testHtmlMail

```java
@Test
public void testHtmlMail() throws MessagingException {
    Context context = new Context();
    context.setVariable("title","博客发福利啦！！");
    context.setVariable("blog","Tisxo'Blog");
    context.setVariable("auther","Tisox");
    context.setVariable("url","https://www.waer.ltd");
    String emailTemplate = templateEngine.process("welcome", context);
    mailService.sendHtmlMail(to_A,"这是一封HTML邮件",emailTemplate);
}
```

![](https://b3logfile.com/file/2022/08/solo-fetchupload-13099055579681014271-c84c51c3.png)

上面这种方式在发送邮件时，会寻找默认的th模板，我们也可以通过自定义的方式，指定自己的模板位置。比如指定模板为/resouces/Mail/test.hml作为模板，测试代码如下：

```java
/**
     * 测试HTML邮件，自定义模板目录
     * @throws MessagingException
     */
    @Test
    public void sendHtmlMail2() throws MessagingException {

        SpringResourceTemplateResolver templateResolver = new SpringResourceTemplateResolver();
        templateResolver.setApplicationContext(context);
        templateResolver.setCacheable(false);
        templateResolver.setPrefix("classpath:/Mail/");
        templateResolver.setSuffix(".html");

        templateEngine.setTemplateResolver(templateResolver);
        Context context = new Context();
        context.setVariable("title","博客发福利啦！！");
        context.setVariable("blog","Tisxo'Blog");
        context.setVariable("auther","Tisox");
        context.setVariable("url","https://www.waer.ltd");
        String emailTemplate = templateEngine.process("test", context);
        mailService.sendHtmlMail(to_B, "这是一封自定义模板HTML邮件", emailTemplate);
    }
```

> 由于我在两个模板中定义的内容是相同的，所以发送的邮件自然也是一样的内容，你可以根据需要自定义这些模板内容。

> to_B是我自定义的一个final全局变量，就是指定邮件接收人的邮箱。

- 测试带附件的邮件

> 测试中，我们以一张图片作为邮件的附件发送进行测试，具体的图片可以自己指定。

> 注意，我的附件存放路径在/resource/static下面。这张名为m.jpg的图片文件。

![](https://b3logfile.com/file/2022/08/solo-fetchupload-10344237892265447668-db28d8f0.png)

```java
/**
     * 测试附件邮件
     *
     * @throws MessagingException 邮件异常
     */
@Test
public void sendAttachmentsMail() throws MessagingException {
    URL resource = ResourceUtil.getResource("static/m.jpg");
    mailService.sendAttachmentsMail(to_B, "这是一封带附件的邮件", "邮件中有附件，请注意查收！", resource.getPath());
}
```

![](https://b3logfile.com/file/2022/08/solo-fetchupload-1578226897700230303-d2009321.png)

- 测试静态资源邮件发送

```java
/**
     * 测试静态资源邮件
     *
     * @throws MessagingException 邮件异常
     */
@Test
public void sendResourceMail() throws MessagingException {
    String rscId = "m";
    String content = "<html><body>这是带静态资源的邮件<br/><img src=\'cid:" + rscId + "\' ></body></html>";
    URL resource = ResourceUtil.getResource("static/m.jpg");
    mailService.sendResourceMail(to_A, "你好，送你一张漂亮的桌面壁纸", content, resource.getPath(), rscId);
}
```

![](https://b3logfile.com/file/2022/08/solo-fetchupload-15512903232934872692-869eaa2a.png)

---

**以上就是本文的所有内容，所用到的图片文件我会放在下面：**

![](https://b3logfile.com/file/2022/08/solo-fetchupload-16071057243062038356-1c76fa09.jpeg)

![](https://b3logfile.com/file/2022/08/solo-fetchupload-10282255732781960597-ee3d5d35.jpeg)

**【声明】：**

*文章中的演示的demo，部分源码参考来自 [xkcoding/spring-boot-demo](https://github.com/xkcoding/spring-boot-demo)，该项目使用 [MIT License](https://github.com/xkcoding/spring-boot-demo/blob/master/LICENSE) 开源协议。*

