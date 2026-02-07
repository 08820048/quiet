# Slf4j与Logback实用指南(基于Gradle)

**摘要**：在当今软件开发领域，日志记录是一项至关重要的任务，它不仅帮助开发人员跟踪应用程序的运行状态和行为，还有助于故障排查、性能优化和安全监控。在日志记录领域，s

**分类**：开发工具

**标签**：日志管理, slf4j, 后端

**发布时间**：2025-08-14T17:44:06

---


## 1. 引盐

在当今软件开发领域，日志记录是一项至关重要的任务，它不仅帮助开发人员跟踪应用程序的运行状态和行为，还有助于故障排查、性能优化和安全监控。在日志记录领域，slf4j（Simple Logging Facade for Java）和logback是两个备受推崇的工具，它们为 Java 应用程序提供了强大而灵活的日志记录功能。

slf4j作为一个简单的日志门面，提供了统一的日志记录接口，使开发人员能够轻松切换不同的日志实现框架，而无需修改应用程序的代码。而logback则是slf4j的一个实现，它提供了高性能、灵活性强的日志框架，可以满足各种日志记录需求。

本文将深入探讨slf4j和logback日志框架的核心概念、使用方法、最佳实践以及高级技巧。我们将介绍如何配置日志记录器、如何使用标记（Markers）来区分日志消息、如何进行日志级别的动态调整以及如何利用logback的各种功能来优化日志记录体验。

通过本文的阐述，读者将能够更好地理解和利用slf4j与logback这两个强大的日志记录工具，从而提升应用程序的日志记录质量、效率和可维护性。让我们一起深入探索日志记录的世界，掌握slf4j与logback的精髓，为我们的软件开发之路增添一份技术的光彩。

先简单看一下本文的大纲：

![image-20240424222613795](https://images.waer.ltd/notes/image-20240424222613795.png)

---

## 2. SLF4J框架

`SLF4J`（**Simple Logging Facade for Java**）是一个为 Java 应用程序提供日志功能的简单日志门面框架。它的设计目的是通过提供一个统一的日志接口，使得应用程序能够在不同的日志实现（如`Logback`、`Log4j`、`java.util.logging`等）之间进行切换，而无需修改应用程序的代码。

看重点，他是一个统一接口的实现规范，而不是具体的实现提供者，基于此，很多具体的日志实现工具都可以在在这个条件下进行自己的实现，最常用的有`Logback、Log4j`。

![image-20240424170420302](https://images.waer.ltd/notes/image-20240424170420302.png)

使用`slf4j`的几点理由:

1. 灵活性高：`SLF4J `提供了一个统一的日志门面，使得应用程序可以轻松地切换和配置不同的日志实现框架，而无需修改应用程序的代码。
2. 丰富的可选实现: 他提供与所有流行的日志框架的支持，如上面的提到的`log4j,logback`等等，可以在其中根据需求无缝切换；
3. 由于 `SLF4J `将应用程序和日志框架解耦，因此可以轻松地编写独立于日志框架的应用程序。无需为用于编写应用程序的日志记录框架而烦恼。
4. `SLF4J `支持参数化日志记录消息，且不受限于你使用哪一种具体实现；

---

### 2.1 基本组件

![image-20240424171738737](https://images.waer.ltd/notes/image-20240424171738737.png)

一款日志记录框架一般由以下三种解构构成：

- 记录
  - 用于捕获数据和记录消息
- 格式化
  - 可以讲记录的消息也就是我们所谓的日志信息进行格式化，规范输出；
- 处理方式
  - 将日志信息通过控制台、文件、数据库等载体进行输出处理；

---

### 2.2 日志级别

根据日志消息的重要程度，或者说对项目影响程度的不同，日志一般有不同的级别:

![image-20240424172222270](https://images.waer.ltd/notes/image-20240424172222270.png)

- **TRACE：** **最低级别的日志**，通常用于记录程序执行过程中的详细信息，如方法调用、变量值等。`TRACE `级别的日志对于排查问题和调试非常有用，但**通常不会在生产环境中启用，因为会产生大量输出**。
- **DEBUG：** 用于**记录调试信息**。`DEBUG `级别的日志通常用于记录程序执行过程中的详细信息，但相**比 TRACE 级别更加精简**。在**开发和测试阶段**启用 `DEBUG `日志有助于定位问题和调试代码。
- **INFO：** 用于记录程序**运行时的重要信息**。`INFO `级别的日志通常用于记录程序的运行状态、重要事件等，可以帮助了解程序的运行情况，但不会产生过多的输出。
- **WARN：** 用于**记录警告信息**。`WARN `级别的日志通常表示一些**潜在的问题或异常情况**，虽然不会导致程序出错，但可能需要注意或处理。
- **ERROR：** 用于**记录错误信息**。`ERROR `级别的日志表示程序发生了**错误或异常情况**，需要引起关注并可能需要进行处理或修复。
- **FATAL：** **最高级别的日志，用于记录严重错误**。`FATAL `级别的日志表示程序遇到了无法恢复的严重错误，**可能会导致程序崩溃或无法继续运行。**

> 虽然这里列出了6中级别，但日常使用过程中`fatal`和`trace`用的不是很多。

---

###  2.3 Slf4J基本使用

> 演示项目基于：
>
> - `SpringBoot 3.2.10`
> - `Gradle:8.7`
> - `JDK 17`

- 添加依赖

```groovy
// https://mvnrepository.com/artifact/org.slf4j/slf4j-api
implementation 'org.slf4j:slf4j-api:2.0.13'
```

我们可以通过`slf4j`提供的工厂方法创建一个简单日志对象,导包的时候注意看是`import org.slf4j.Logger;`，因为还有一个同名的`Logger`来自`java.util*`包下，注意区分。

```java
Logger logger = LoggerFactory.getLogger("SampleLogger");
```

> 1. **`Logger `接口：**
>    - `Logger` 是 `SLF4J `框架中定义的一个接口，用于记录日志消息。通过 Logger 接口，可以使用不同的日志级别（如 INFO、DEBUG、ERROR 等）记录日志消息。
>
> 2. **`LoggerFactory `类：**
>    - `LoggerFactory` 是 `SLF4J `框架中的一个工厂类，用于获取 `Logger `实例。开发人员可以使用 `LoggerFactory `类的静态方法 `getLogger()` 来获取一个特定名称的 Logger 实例。
>
> 3. **"`SampleLogger`" 参数：**
>    - 在 `getLogger()` 方法中传入的参数是一个字符串，用于指定要获取的 `Logger `实例的名称。通常，这个名称可以是类名、包名或者任何描述性的字符串。

通过这个方法，我们获得了一个`Logger`实例，通过源码可知，他包含了上面提到的几种日志级别的各种常用方法：

![image-20240424180736466](https://images.waer.ltd/notes/image-20240424180736466.png)

```java
public static void main(String[] args) {
    // 创建日志Logger对象
     Logger logger = LoggerFactory.getLogger("SampleLogger");

     // 几种日志级别方法的级别使用
    logger.trace("这条日志来自[trace]级别...");
    logger.debug("这条日志来自[debug]级别...");
    logger.info("这条日志来自[info]级别...");
    logger.warn("这条日志来自[warn]级别...");
    logger.error("这条日志来自[error]级别...");
}
```

运行上面的代码

![image-20240424181420177](https://images.waer.ltd/notes/image-20240424181420177.png)

从控制台来看，这里少打印了`debug`和`trace`级别的内容，这是因为`SLF4J `和 `Logback `默认的日志级别是 INFO，这意味着只有 INFO 级别及以上的日志会被输出到控制台。代码中使用了 INFO、WARN 和 ERROR 三种日志级别，因此只有这三种级别的日志会被输出，而 TRACE 和 DEBUG 级别的日志不会显示在控制台上。

也可以使用占位符的形式进行日志的打印，这也是比较常用的：

```java
 // 使用占位符的形式
    String str = "这是占位符的数据";
    logger.info("{}",str);
```

除此之外，我们还可以通过使用类名获取实例化`Logger`实例的方式：

```java
public class LogMain {
    private static final Logger LOGGER  =LoggerFactory.getLogger(LogMain.class);
    public static void main(String[] args) {
         // 几种日志级别方法的级别使用
        LOGGER.info("这条日志来自[info]级别...");
        LOGGER.warn("这条日志来自[warn]级别...");
        LOGGER.error("这条日志来自[error]级别...");
        // 使用占位符的形式
        String str = "这是占位符的数据";

        LOGGER.info("{}",str);
    }
}
```

下面是两种方式的简单对比:

1. **使用类名获取 Logger 实例**：

   ```java
   private static final Logger LOGGER = LoggerFactory.getLogger(LogMain.class);
   ```

   这种方式是通过类名 `LogMain.class` 来获取 Logger 实例，这样可以确保每个类都有自己的 Logger 实例，并且可以更容易地追踪日志信息的来源。这种方式在实践中是比较常见的，特别是在类的静态方法中使用。

2. **使用自定义名称获取 Logger 实例**：

   ```java
   Logger logger = LoggerFactory.getLogger("SampleLogger");
   ```

   这种方式是通过自定义的名称 "`SampleLogger`" 来获取 Logger 实例。使用自定义名称可以将多个类的日志信息归类到同一个 Logger 实例中，从而方便对日志信息进行管理和过滤。这种方式适用于需要对多个类的日志进行统一管理的情况。

两种方式都可以获取 Logger 实例，选择哪种方式取决于具体的需求和场景。如果你想要每个类有自己的 Logger 实例并且更容易追踪日志来源，可以使用类名获取；如果需要对多个类的日志进行统一管理，可以使用自定义名称获取。

---

## 3. Logback

### 3.1 导入依赖

在上面的内容中，简单体验了一些`slf4j`框架的基本使用流程以及常用的方法，在日常的调试开发中，对于控制台输出信息来说，确实也够用了，但就实际的项目需求来讲还是差点意思，所以本章节还是介绍一下他的一款具体实现，那就是`logback`；

**导入依赖：** 我们需要导入下面两个依赖，当然前面导入的`slf4j`的核心依赖还是要的，什么意思，咱不说，你品，你细品(😎)！！！！

```groovy
// https://mvnrepository.com/artifact/ch.qos.logback/logback-core
implementation 'ch.qos.logback:logback-core:1.5.6'
// https://mvnrepository.com/artifact/ch.qos.logback/logback-classic
implementation 'ch.qos.logback:logback-classic:1.5.6'
```

欧克，依赖导入之后别忘了刷新一下，完成构建再继续。

依赖加载完成后，还是基于之前的代码，我们什么也不做配置，看看日志的打印有什么区别：

![image-20240424191527626](https://images.waer.ltd/notes/image-20240424191527626.png)

> 测试结果主打一个一成不变！！

---

### 3.2 配置logback

要配置 `Logback`，我们可以使用 `XML `文件以及 `Groovy `文件。这里将使用 XML 方法。在项目的 `resources `文件夹中创建 `logback.xml` 文件，其中包含 以下内容并给出详细的注释以及解释，兄台不必多言！

```xml
<configuration>
    <!-- 配置一个名为 "STDOUT" 的 appender，使用 AsyncAppender 异步输出日志 -->
    <appender name="STDOUT" class="ch.qos.logback.classic.AsyncAppender">
        <!-- 配置日志输出的格式 -->
        <encoder>
            <!-- 指定日志输出的格式，包括时间、日志级别、logger 名称、日志消息 -->
            <pattern>%d{HH:mm.SSS} %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    
    <!-- 配置根日志级别为 INFO -->
    <root level="info">
        <!-- 将名为 "STDOUT" 的 appender 引用到根日志中 -->
        <appender-ref ref="STDOUT"/>
    </root>
</configuration>
```

> - `<appender>` 元素用于配置日志输出的目标，这里配置了一个名为 "`STDOUT`" 的 `appender`，使用 `AsyncAppender` 异步输出日志。
> - `<encoder>` 元素用于配置日志输出的格式，这里指定了输出格式的模式，包括时间 `%d{HH:mm.SSS}`、日志级别 `%-5level`、logger 名称 `%logger{36}`、日志消息 `%msg` 等。
> - `<pattern>` 元素定义了日志输出的格式模式，`%d{HH:mm.SSS}` 表示输出时间，`%-5level` 表示输出日志级别（左对齐，最多占5个字符），`%logger{36}` 表示输出 logger 名称（最多36个字符），`%msg` 表示输出日志消息，`%n` 表示换行。
> - `<root>` 元素定义了根日志的配置，这里将根日志级别设置为 `INFO`。
> - `<appender-ref>` 元素用于将指定的 appender 引用到根日志中，这里将名为 "`STDOUT`" 的 `appender `引用到根日志中，表示使用这个 `appender` 输出根日志的日志信息。

#### 3.2.1  **Logback appender**

`Logback appender` 是 `Logback `用于写入日志事件的组件。`Logback`提供了多种类型的`Appenders`，每种`Appender`都有不同的功能和用途,下面列一些常见的吧

> 1. **ConsoleAppender**：将日志消息输出到控制台。
> 2. **FileAppender**：将日志消息输出到文件。
> 3. **RollingFileAppender**：将日志消息输出到文件，并支持日志文件的滚动（即按照一定条件切分日志文件，如按日期、文件大小等）。
> 4. **SMTPAppender**：通过邮件发送日志消息。
> 5. **SocketAppender**：将日志消息通过网络发送到远程服务器。
> 6. **DBAppender**：将日志消息写入数据库。
> 7. **AsyncAppender**：异步地将日志消息输出到其他`Appender`，可以提高日志系统的性能。
> 8. **SyslogAppender**：将日志消息发送到`Syslog`服务器。

#### 3.2.2 **logback-classic**

在本章节的开始，我们还引如了这个`logback-classic`的依赖，这是`Logback`框架中的一个模块，它提供了一个功能强大且灵活的日志系统，可以用于Java应用程序中进行日志记录。一些`logback-classic`模块中的重要组件包括：

> 1. **Logger（日志记录器）**：Logger用于记录日志消息。在`Logback`中，`Logger`是最核心的组件之一，负责生成和处理日志消息。
> 2. **Appender（输出目的地）**：Appender用于定义日志消息的输出目的地，比如控制台、文件、数据库等。`logback-classic`提供了多种类型的Appenders来满足不同的输出需求。
> 3. **Layout（日志格式化）**：Layout用于定义日志消息的格式，包括日志消息的时间戳、日志级别、日志内容等。通过Layout，可以自定义日志消息的输出格式。
> 4. **Level（日志级别）**：Level用于定义日志消息的级别，如`DEBUG、INFO、WARN、ERROR`等。可以通过Level来控制日志消息的输出级别。
> 5. **配置文件**：`logback-classic`使用XML或Groovy等格式的配置文件来配置日志系统的行为，包括配置日志级别、`Appenders、Layou`t等。

由于`logback`提供的功能实在很多，这里也不可能一一列举，下面就以将日志信息写入控制台和文件为例，也就是`RollingFileAppender`;

- 代码还是这点内容

```java
public class LogMain {
    private static final Logger LOGGER  =LoggerFactory.getLogger(LogMain.class);
    public static void main(String[] args) {
        LOGGER.info("这是一条INFO级别的日志....");
        LOGGER.error("这是一条ERROR级别的日志...");
    }
}
```

- 配置文件就有些变化了

```xml
<configuration>
    <!-- 配置一个名为 "STDOUT" 的 appender，使用 AsyncAppender 异步输出日志 -->
    <appender name="STDOUT" class="ch.qos.logback.classic.AsyncAppender">
        <!-- 配置目标 Appender 为 ConsoleAppender，即输出到控制台 -->
        <appender-ref ref="CONSOLE" />
        <encoder>
            <!-- 指定日志输出的格式，包括时间、日志级别、logger 名称、日志消息 -->
            <pattern>%d{HH:mm.SSS} %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- 定义一个名为 "CONSOLE" 的 ConsoleAppender，用于将日志消息输出到控制台 -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- 定义一个名为 "file" 的 FileAppender，用于将日志消息输出到文件 -->
    <appender name="file" class="ch.qos.logback.core.FileAppender">
        <!-- 指定日志文件的路径 -->
        <file>src/main/resources/mylogs.log</file>
        <!-- 如果为 true，则日志消息将追加到文件末尾；如果为 false，则会覆盖已有的文件内容 -->
        <append>true</append>
        <!-- 如果为 true，则每次写入日志消息后会立即刷新输出流；如果为 false，则可能会缓冲一段时间后再刷新 -->
        <immediateFlush>true</immediateFlush>
        <!-- 配置日志消息的输出格式，包括时间戳、线程名、日志级别、Logger名称、日志消息内容等 -->
        <encoder>
            <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- 定义一个名为 "cn.ilikexff.springsecuritydemo2.controller.LogMain" 的 Logger -->
    <!-- 注意这里要正确指定你的日志信息的来源路径 -->
    <logger name="cn.ilikexff.springsecuritydemo2.controller.LogMain" level="INFO">
        <!-- 将 Logger 与名为 "STDOUT" 的 Appender 关联 -->
        <appender-ref ref="STDOUT"/>
    </logger>

    <!-- 配置根 Logger 的行为 -->
    <root level="info">
        <!-- 将根 Logger 与名为 "file" 的 Appender 关联，表示根 Logger 的日志消息将输出到文件 -->
        <appender-ref ref="file" />
    </root>
</configuration>
```

执行程序之后发现在指定的日志文件和控制台都打印了相关的日志信息:

![image-20240424202540003](https://images.waer.ltd/notes/image-20240424202540003.png)

---

#### 3.2.3 RollingFileAppender

`RollingFileAppender`是`Logback`框架中的一个`Appender`，用于将日志输出到文件，并支持日志文件的滚动（`rolling`）功能。其作用包括：

1. **日志文件滚动**：`RollingFileAppender`可以配置日志文件的滚动策略，例如按文件大小滚动、按时间滚动等。这样可以限制单个日志文件的大小，避免日志文件过大影响系统性能，同时保留一定数量的历史日志文件，方便查看和管理。

2. **日志文件管理**：`RollingFileAppender`可以管理日志文件的写入和切换，确保日志信息被正确记录到文件中。它可以自动创建新的日志文件、关闭旧的日志文件，并根据配置进行日志文件的滚动和清理。

3. **配置灵活**：`RollingFileAppender`提供了丰富的配置选项，可以根据需求定制日志文件的滚动策略、文件命名规则、文件大小限制等参数，以满足不同场景下的日志记录需求。

考虑下面的配置:

> 该配置将日志文件限制在单个文件最大10MB，保留30个历史日志文件，并限制所有历史日志文件总大小不超过1GB。

```xml
<configuration>

    <!-- 定义控制台输出的Appender -->
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- 定义RollingFileAppender，将日志输出到文件中，并支持日志文件的滚动 -->
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>logs/mylog.log</file> <!-- 日志文件的路径和名称 -->
        <encoder>
            <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>

        <!-- 配置日志文件的滚动策略 -->
        <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
            <fileNamePattern>logs/mylog-%d{yyyy-MM-dd}.%i.log</fileNamePattern> <!-- 日志文件的命名规则 -->
            <maxFileSize>2MB</maxFileSize> <!-- 单个日志文件的最大大小 -->
            <maxHistory>7</maxHistory> <!-- 保留的历史日志文件数量 -->
            <totalSizeCap>1GB</totalSizeCap> <!-- 所有历史日志文件的总大小上限 -->
        </rollingPolicy>
    </appender>

    <!-- 配置Logger，指定日志记录级别和Appender -->
    <logger name="cn.ilikexff.springsecuritydemo2.controller.LogMain" level="INFO">
        <appender-ref ref="STDOUT" /> <!-- 将日志输出到控制台 -->
        <appender-ref ref="FILE" /> <!-- 将日志输出到文件中 -->
    </logger>

    <!-- 配置根Logger，指定日志记录级别和Appender -->
    <root level="INFO">
        <appender-ref ref="STDOUT" /> <!-- 将日志输出到控制台 -->
        <appender-ref ref="FILE" /> <!-- 将日志输出到文件中 -->
    </root>

</configuration>
```

根据上面的配置，我们简单测试以下配置是否生效，比如多执行几次程序，不断的输出日志，看看单个文件最大大小达到`2M`时会怎样。

![image-20240424205922590](https://images.waer.ltd/notes/image-20240424205922590.png)

截至上图`mylog.log`的大小为`2KB`,为了加快测试，简单修改代码如下:

```java
public class LogMain {
    private static final Logger LOGGER  =LoggerFactory.getLogger(LogMain.class);
    public static void main(String[] args) {
        for (int i = 0; i < 1000; i++) {
            LOGGER.info("这是一条INFO级别的日志....");
            LOGGER.error("这是一条ERROR级别的日志...");
        }
    }
}
```

不断测试之后发现当我们的原日志文件大小超过`2M`时，就发生了滚动，将原日志信息放到了一个新的日志文件中，并且这个文件的命名也是按照配置文件指定的规则创建的，成功发生了滚动，说明配置是生效了的。

![image-20240424211105513](https://images.waer.ltd/notes/image-20240424211105513.png)

![image-20240424210815077](https://images.waer.ltd/notes/image-20240424210815077.png)

关于`RollingFileAppender`就到这了，建议自己动手修改配置多操作几次，加深印象和理解，下面提一嘴`Logback`编码器；

---

#### 3.2.4 Logback Encoders

这玩意有什么用呢，不妨通过名称大胆猜测，这是用来作日志格式转换的模块。没错，`Encoder`用于将日志事件转换为特定格式的文本，以便输出到目标`Appender`。`Encoder`负责将日志事件转换为字符串形式，以便日志系统能够将其输出到适当的目标，比如控制台、文件或者其他地方。

Logback提供了多种Encoder，常见的有：

> 1. **PatternLayoutEncoder**：通过指定的模式（pattern）将日志事件格式化为文本。可以自定义日志输出的格式，包括日期、日志级别、线程名等信息。
> 2. **JsonEncoder**：将日志事件输出为`JSON`格式的字符串，适用于结构化日志。
> 3. **EchoEncoder**：将日志事件输出到控制台，类似于System.out.println()。
> 4. **RawFileAppender**：将日志事件以原始格式输出到文件，不进行任何格式化。

但是大部分情况下，我们其实不太需要修改这个配置，最常用的就是上面配置中写的格式：

```xml
<configuration>
    <appender name="console" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{HH:mm:ss.SSS} %-5level %logger{36} - %msg%n</pattern>
            <outputPatternAsHeader>true</outputPatternAsHeader>
        </encoder>
    </appender>
    <root level="info">
        <appender-ref ref="console" />
    </root>
</configuration>
```

---

#### 3.2.5 Logback Filters

在`Logback`中，Filters（过滤器）用于过滤日志事件，只有符合特定条件的日志事件才会被处理和记录。Filters可以帮助您控制哪些日志事件应该被记录，哪些应该被忽略，从而提高日志系统的效率和可控性。

`Logback`提供了多种内置的`Filters`，以及支持**自定义Filters**。下面是一些常见的内置Filters：

> 1. **LevelFilter**：根据日志级别过滤日志事件，只处理符合指定级别范围的日志事件。
> 2. **ThresholdFilter**：类似于`LevelFilter`，根据指定的阈值级别过滤日志事件。
> 3. **TurboFilter**：高性能的过滤器，可以根据更复杂的条件过滤日志事件。
> 4. **MarkerFilter**：根据Marker标记过滤日志事件，只处理带有特定`Marker`的日志事件。

比如我们需要过滤`ERROR`级别的日志信息，可以参考下面的配置:

```xml
<!-- Logback 配置文件 -->
<configuration>

    <!-- 定义一个输出到控制台的 appender -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <!-- 定义日志输出格式 -->
            <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
        
        <!-- 添加 LevelFilter 过滤器 -->
        <filter class="ch.qos.logback.classic.filter.LevelFilter">
            <!-- 指定过滤级别为 ERROR -->
            <level>ERROR</level>
            <!-- 匹配到 ERROR 级别的日志时拒绝 -->
            <onMatch>DENY</onMatch>
            <!-- 不匹配时不进行处理 -->
            <onMismatch>NEUTRAL</onMismatch>
        </filter>
    </appender>

    <!-- 配置根节点的日志级别为 INFO -->
    <root level="INFO">
        <!-- 引用 CONSOLE appender -->
        <appender-ref ref="CONSOLE" />
    </root>
</configuration>
```

除了使用这种配置文件的方式进行过滤之外，`logback`也提供了代码方式的过滤，比如依旧实现上面的需求，用代码可以这样写。

```java
public class SampleFilter extends Filter<ILoggingEvent> {
    @Override
    public FilterReply decide(ILoggingEvent event) {
        if (event.getMessage().contains("ERROR")) {
            return FilterReply.ACCEPT;
        }
        return FilterReply.DENY;
    }
}
```

再配置文件中将上面编写好的过滤规则添加进去:

```xml
<!-- Logback 配置文件 -->
<configuration>

    <!-- 定义一个输出到控制台的 appender -->
    <appender name="console" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <!-- 定义日志输出格式 -->
            <pattern>%d{HH:mm:ss.SSS} %-5level %logger{36} - %msg%n</pattern>
        </encoder>

        <!-- 添加自定义的 SampleFilter 过滤器 -->
        <filter class="cn.ilikexff.springsecuritydemo2.filter.SampleFilter" />
    </appender>

    <!-- 配置根节点的日志级别为 INFO -->
    <root level="info">
        <!-- 引用 console appender -->
        <appender-ref ref="console" />
    </root>
</configuration>

```

执行程序，发现控制台和日志文件中都只有`ERROR`级别的日志信息了，`Ojbk!`；

![image-20240424214719787](https://images.waer.ltd/notes/image-20240424214719787.png)

---

## 4. 小结一下

这篇文章从`Slf4J`入手，梳理了这个日志框架的基本概念和用法，随之引出了基于`Slf4j`实现的`logback`，并详细讲解了相关的使用方法，当然，文章至此已将近6700字，而这不是`typora`的上限，也不是`CSDN`的上限，自然也不是你我的上限，只是确实夜太深，有些寂寞了...溜了溜了。

> 后续内容将逐步在[我的博客](https://www.ilikexff.cn)端进行不定期更新，因为`CSDN`文章更新后并没有任何提示，我的博客有订阅功能，这一点来说，在博客端更新确实是不错的选择，感谢阅读!

---

