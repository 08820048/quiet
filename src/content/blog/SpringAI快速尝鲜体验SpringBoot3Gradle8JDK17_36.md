# SpringAI快速尝鲜体验(SpringBoot3+Gradle8+JDK17) 

**摘要**：自从OpenAI的ChatGPT爆火之后，各种AI大模型开始席卷互联网，作为知名框架的Spring官方也是小小的顺应了一波潮流，

**分类**：Spring Boot

**标签**：Spring Boot, Java, 后端

**发布时间**：2025-08-14T17:31:17

---


## SpringAI

自从`OpenAI`的`ChatGPT`爆火之后，各种AI大模型开始席卷互联网，作为知名框架的`Spring`官方也是小小的顺应了一波潮流，就在不久前官方推出了针对`AI`的部分，称为`SpringAI`目前最新版本为`0.8.1`,下面是官网的截图。

直通车[https://spring.io/projects/spring-ai](https://spring.io/projects/spring-ai)

![image-20240416200020731](https://images.waer.ltd/notes/image-20240416200020731.png)

根据官方的介绍，这个`Spring AI` 是一个人工智能工程应用框架。其目标是将 Spring 生态系统的设计原则（如可移植性和模块化设计）应用于人工智能领域，并推广使用 POJO 作为人工智能领域应用程序的构建模块。之前我们开发一个AI项目，都是自己找`API`，写接口，零开始一步一步开发，但是现在有了`SpringAI`，它可以帮我们快速整合各大主流的`AI`模型，并支持常规方式和流式输出以及图片处理等基本功能，快速开发一个`AI`项目可谓是有手手就行了，降低了一定的门槛；

目前支持的AI模型有：

![image-20240416200746080](https://images.waer.ltd/notes/image-20240416200746080.png)

想要了解更多相关的信息可以去官网看看，下面就以`OpenAI`模型为例，快速体验一把`SpringAI`；对于模型的支持上，对国内玩家来说，美中不足的大概就是还不支持国内的一些模型，比如阿里的通义千问，百度的文心一言等等；

---

## 快速尝鲜

### 项目创建

使用`SpringBoot`初始化器创建一个`SpringBoot`项目，记得添加对应的`AI`依赖；

![image-20240416202013313](https://images.waer.ltd/notes/image-20240416202013313.png)

我的项目配置信息参考:

- `JDK:17`
- `Gradle:8.7`
- `SpringBoot:3.2.4`

> 注意，如果你要使用`Snapshot`版本，可能需要做一些小变动，具体看官方文档:[https://docs.spring.io/spring-ai/reference/getting-started.html](https://docs.spring.io/spring-ai/reference/getting-started.html)

---

### 属性配置

> 由于这里需要用到`OpenAI`的`key`,所以默认你已经拥有了这个前提；

确定使用的`AI`模型之后，我们需要在配置文件中添加一些必要的配置，比如`OpenAi`的`key`等信息；不同的模型配置会有差异，这里始终以`OpenAI`为例，其他模型请自行移步官网，后文就不再赘述。

```yaml
spring:
  application:
    name: DemonSpringAI
  ai:
    openai:
      api-key: #你的key
      chat:
        options:
          model: gpt-3.5-turbo
          temperature: 0.7
```

---

### 接口开发

在`controller`包下直接创建一个`ChatController`,内容如下:

```java
/**
 * ===================我亦无它================================
 * project name: SortingAlgorithms
 * author: Gemini48
 * date: 2024/4/10
 * blog: <a href="https://www.ilikexff.cn/">八尺妖剑</a>
 * description default
 * ====================唯手熟尔===============================
 **/


package cn.ilikexff.demonspringai.controller;

import org.springframework.ai.chat.ChatResponse;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

import java.util.Map;

@RestController
public class ChatController {
    
    @GetMapping("/hello")
    public String hello() {
        return "hello！";
    }
    
    private final OpenAiChatClient chatClient;

    @Autowired
    public ChatController(OpenAiChatClient chatClient) {
        this.chatClient = chatClient;
    }

   @GetMapping("/ai/generate")
    public Map generate(@RequestParam(value = "message",defaultValue = "自我介绍并给我讲个笑话。") String message) {
        return Map.of("AI的回答:",chatClient.call(message));
    }
    @GetMapping("/ai/streams")
    public Flux<ChatResponse> generateStream(@RequestParam(value = "message",defaultValue = "请自我介绍并给我讲个笑话。") String message) {
        Prompt prompt = new Prompt(new UserMessage(message));
        return chatClient.stream(prompt);
    }
}

```

注意，上面的接口中，除了第一个`/hello`是我写的测试接口，其他两个分别是`SpringAI`提供的`controller`，分别支持一般的文本内容输出(即请求会等待所有响应完毕之后再将回答一次性打印出来返回)与流式输出，这个就不用过多解释了吧，`AI`回答的每一个字都会实时的打印，这也是如今很常见的响应模式，比如`OpenAI`的官方提供的`ChatGPT`就是基于这种流的形式进行输出的；

下面我们使用`postman`分别对两个接口进行简单的测试，看看是否可以正常得到`AI`的回答：

####  常规接口测试

![image-20240416225738515](https://images.waer.ltd/notes/image-20240416225738515.png)

#### 流式接口测试

由于是流式的实时输出，因此无法通过截图的方式很好的展现，因此这里直接使用内置的`http`请求来进行测试并展现一部分截图：

![image-20240416230239741](https://images.waer.ltd/notes/image-20240416230239741.png)

![image-20240416230152465](https://images.waer.ltd/notes/image-20240416230152465.png)

到此为止，我们就完成了使用`SpringAI`快速体验，有一说一，确实节约了不少的开发时间；

### 注意

关于代理，由于国内访问`openai`成功的概率几乎为0，所以如果想成功走完这整个流程，提供两种方式：

- 使用国内镜像站代替官方默认的[ api.openai.com](https://api.openai.com/)

  如果使用这种方式，请在`.yml`配置文件中新增一个`base-url`字段，修改后的内容如下：

  ```yaml
  spring:
    ai:
      openai:
        api-key: # 你的 key
        chat:
          options:
            model: gpt-3.5-turbo
            temperature: 0.7
        base-url: # 镜像站地址
  ```

  

- 使用代理访问

我这里采用的是代理的方式进行的，下面是参考代码:当然，至于如何处理代理，那就不是这篇文章讨论的重点了，靠自己的野路子去摸索吧。

![image-20240417000048657](https://images.waer.ltd/notes/image-20240417000048657.png)



---

## Vue3前端部分

时间不早了，看评论区各位同学的需求吧，如果需要前端实现的呼声够多，再抽时间补齐这部分，感谢阅读!

> 项目源码公众号回复:SpringAI 获取


