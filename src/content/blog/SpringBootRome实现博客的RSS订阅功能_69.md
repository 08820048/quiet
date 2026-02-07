#  SpringBoot+Rome实现博客的RSS订阅功能

**摘要**：RSS（Really Simple Syndication）是一种用于内容发布和订阅的简易格式，广泛应用于博客、新闻网站、视频平台等内容更新的推送。用户可以通过 RSS 订阅，自动获取网站的最新内容，避免手动访问网站。

**分类**：Spring Boot

**标签**：Spring Boot, Java, 后端

**发布时间**：2025-08-14T18:31:43

---



![rss](https://images.waer.ltd/notes/202504141235204.png)

`RSS（Really Simple Syndication）`是一种用于内容发布和订阅的简易格式，广泛应用于博客、新闻网站、视频平台等内容更新的推送。用户可以通过 `RSS` 订阅，自动获取网站的最新内容，避免手动访问网站。

在这篇博客中，我将介绍如何在 `Spring Boot` 中实现一个基本的 `RSS` 订阅功能，并通过 `Nginx` 配置将其部署到生产环境中。

---

## 什么是RSS

`RSS` 订阅通过一种结构化的 XML 格式来提供网站的最新内容更新。用户可以使用 RSS 阅读器订阅这些内容，在更新时实时获取推送。每个 `RSS Feed` 都包含一个标题、描述和若干个条目（Entry），每个条目通常包含文章的标题、链接、摘要和发布时间等信息。

> 不要看到XML就觉得这是个落伍的老东西了,RSS订阅在很多现代网站上都被广泛使用,比如国内的CSDN,国外很多技术大牛的博客也都提供了这个功能,他的好处在于,我只要订阅了你博客的RSS,就可以通过一些专门的RSS订阅工具自动获取你博客的最新内容,而不需要每次阅读你的文章必须打开浏览器,然后再输入你的域名进行访问。

![image-20250414144624890](https://images.waer.ltd/notes/202504141446089.png)

---

## 实现思路

> 注意,我的博客也是刚刚新增的`RSS`订阅功能,因此这里直接就以博客的后端`SpringBoot`后端进行实例讲解,而不是`demo`  

为了实现 `RSS` 功能，我们需要完成以下几个步骤：

- 设计`RSS`数据结构
- 后端生成`RSS Feed`
- 前端提供展示`RSS`订阅的入口
- 通过`Nginx`代理,将`RSS`接口暴露给公网访问
- 收工!

### 代码实现

> 这里只展示核心代码,至于具体的`SQL`怎么写,`service`怎么封装,这些都是根据实际项目来决定的 

在 `Spring Boot` 中生成 `RSS Feed`，我们可以使用 **Rome** 库，它可以帮助我们创建符合 RSS 标准的 XML 文档。下面是如何通过 `Spring Boot` 服务生成并返回 RSS 格式的 Feed。

- 导入`maven`依赖:

```xml
   <dependency>
          <groupId>org.jsoup</groupId>
          <artifactId>jsoup</artifactId>
          <version>1.15.4</version>
      </dependency>

      <dependency>
          <groupId>com.rometools</groupId>
          <artifactId>rome</artifactId>
          <version>1.18.0</version>
      </dependency>
```

- Controller实现

```java
package com.aurora.controller;

import com.aurora.model.vo.ArticleRssVO;
import com.aurora.service.ArticleService;
import com.rometools.rome.feed.synd.*;
import com.rometools.rome.io.FeedException;
import com.rometools.rome.io.SyndFeedOutput;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.StringWriter;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/rss")
public class RssController {

    @Autowired
    private ArticleService articleService;

    @GetMapping(produces = MediaType.APPLICATION_XML_VALUE)
    @ResponseBody
    public ResponseEntity<String> getRssFeed() throws IOException, FeedException {
        // 获取文章列表
        List<ArticleRssVO> articles = articleService.getLatestArticleRssList();
        StringWriter stringWriter = new StringWriter();

        // 创建 RSS Feed
        SyndFeed feed = new SyndFeedImpl();
        feed.setFeedType("rss_2.0");
        feed.setTitle("八尺妖剑");
        feed.setLink("https://www.ilikexff.cn");
        feed.setDescription("一个爱玩马超的游戏程序员");
        feed.setPublishedDate(new Date());

        // 填充条目
        List<SyndEntry> entries = new ArrayList<>();
        for (ArticleRssVO article : articles) {
            SyndEntry entry = new SyndEntryImpl();
            entry.setTitle(article.getArticleTitle());
            entry.setLink("https://www.ilikexff.cn/articles/" + article.getId());
            entry.setPublishedDate(Date.from(article.getCreateTime().atZone(ZoneId.systemDefault()).toInstant()));
            SyndContent description = new SyndContentImpl();
            description.setType("text/html");
            description.setValue(article.getSummary());
            entry.setDescription(description);
            entries.add(entry);
        }

        feed.setEntries(entries);

        // 输出 RSS Feed
        SyndFeedOutput output = new SyndFeedOutput();
        output.output(feed, stringWriter);

        // 返回 RSS 内容
        return ResponseEntity
                .ok()
                .contentType(MediaType.APPLICATION_XML)
                .body(stringWriter.toString());
    }
}
```

- `articleService.getLatestArticleRssList()` 获取最新的文章列表。这部分逻辑你可以根据需求进行修改，确保返回的数据格式符合你需要的 RSS 条目。

- 设置 `feed.setFeedType("rss_2.0")` 来定义为 RSS 2.0 格式。
- 设置 `feed.setTitle, feed.setLink, feed.setDescription` 分别为 Feed 的标题、链接和描述。
- 遍历文章列表，为每篇文章创建一个 `SyndEntry` 条目，设置其标题、链接、发布时间和摘要。

- 使用 `SyndFeedOutput` 输出 `RSS Feed` 的 `XML` 格式，最后将其作为字符串返回。

然后可以使用`API`工具访问本地进行测试:

![image-20250414145834468](https://images.waer.ltd/notes/202504141458598.png)

如果你浏览器安装了支持RSS解析的插件,那么你可以把这个请求地址直接放到浏览器测试,测试出来的效果就是解析后的样子了,比如:

![image-20250414150001084](https://images.waer.ltd/notes/202504141500153.png)

---

## 前端处理

接口测试通过后,前端的处理就相对简单很多了,只需要在你的网站合适的位置贴一个支持链接跳转的标签,用户点击之后能正常访问到RSS接口就可以了。

比如我的:

```html
      <a href="https://www.ilikexff.cn/rss" target="_blank" title="RSS订阅">
        <svg-icon icon-class="rss" />RSS订阅
      </a>
```

![image-20250414151011404](https://images.waer.ltd/notes/202504141510488.png)

但是如果你仅仅做到你这一步,并且你的线上博客使用了域名和nginx代理功能,那么这样的操作还是无法访问正常的订阅接口的,我们需要进一步对`nginx.conf`进行调整,添加/rss接口的转发访问。

---

## Nginx配置

```nginx
location /rss {
    proxy_pass http://你的IP地址:8080/rss;  # 将请求转发到 Spring Boot 后端
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

这里的配置会将 `https://你的域名/rss` 的请求转发到 `http://你的IP:8080/rss`，确保你的 `RSS` 服务可以正常提供给外部用户访问。

---

## RSS 阅读器

- **在线工具**：
  - [Feedly](https://feedly.com/)：一个非常流行的 RSS 阅读器，可以在浏览器中使用，也有移动应用。
  - [The Old Reader](https://theoldreader.com/)：提供传统 RSS 阅读体验的服务，界面简洁。
- **桌面应用**：
  - [RSSOwl](http://www.rssowl.org/): 一款支持多平台的桌面应用，功能非常强大。
- **移动应用**：
  - [Flipboard](https://flipboard.com/): 一款受欢迎的新闻聚合应用，支持 RSS 订阅。
  - [Reeder](https://reederapp.com/): 专为 macOS 和 iOS 设计的 RSS 阅读器，界面简洁且好用。

选择一个适合你的工具后，你就可以开始使用 RSS 订阅功能了。