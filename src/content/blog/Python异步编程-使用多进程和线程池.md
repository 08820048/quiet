# Python异步编程-使用多进程和线程池

**摘要**：深入理解 Python 多进程与线程池的使用，探讨异步编程中的并发机制与性能优化。

**分类**：Python

**标签**：Python, 异步编程, 多进程, 线程池, 并发

**发布时间**：2026-04-20

### 理解进程的概念

进程是操作系统在执行中的程序以及其资源的容器,管理程序的数据区域、子进程、通信和所有资产。 
进程(`processes`)具有相关的信息和资源。可以对其进行操作和控制,操作系统有一个成为 **进程控制块(PCB)** 的结构,它存储有关进程的信息:

- **Process ID(PID):** 这是唯一的整数值（无符号），用于标识操作系统中的进程。
- 程**序计数器(Program counter):** 这包含要执行的下一条程序指令的地址。
- **I/O信息(I/O information):** 这是与进程相关联的打开文件和设备的列表
- **内存分配(Memory allocation):** 这存储有关进程使用和保留的内存空间以及分页表的信息。
- **CPU调度(CPU scheduling)**: 这存储有关进程优先级的信息并指向交错队列。(staggering queues)。
- **优先级(Priority:):** 这定义了进程在获取 CPU 时的优先级
- **当前状态(Current state):** 这表明进程是就绪(ready)、等待(waiting)还是正在运行(running)
- **CPU 注册表(CPU registry):** 这存储堆栈指针和其他信息。![image-1776592867763](https://img.xuyi.dev/20260419-100107782-image-1776592867763.png)
  **进程在整个生命周期内会经历三种状态,并在他们之间不断切换**,看图
  ![image-1776593081540](https://img.xuyi.dev/20260419-100441568-image-1776593081540.png)

---

### 多进程的通信

由于多进程没有共享内存,进程之间只能通过 **消息传递数据副本)** 的方式进行通信,在Python中,提供了两种方式:
![image-1776593730388](https://img.xuyi.dev/20260419-101530407-image-1776593730388.png)

> Manager().dict() —— 跨进程共享字典
> 普通 dict 在子进程中只是副本，主进程看不到修改。Manager().dict() 通过后台代理进程中转，实现真正的跨进程共享。代价是每次读写都有 IPC 开销。

---

#### Pipe管道-点对点通信

使用multiprocessing.Pipe模块可以完成pipe管道通信的实现。 管道由在两个端点之间建立通信的机制组成。官方建议每两个端点使用一个管道,因为不能保证多端同时读取安全。 
示例:进程A发送随机数、进程B接收并打印

1. 导入模块

```python
import os,random
form multiprocessing import Process,Pipe 
```

2. 生产者

```python
def producer_task(conn):
  value = random.randint(1,10)
  conn.send(value)
  print("Value [%d] send by PID [%d]" %(value,os.getpid()))
  conn.close() 
```

注意:使用conn.send(value)发送完消息之后,必须及时调用conn.close()释放资源。

3. 消费者

```python
# 使用 conn.recv() 阻塞等待并接收数据。
def consumer_task(conn):
  print('Value [%d] recevied by PID [%d]' % (conn.recv(),os.getpid()))
```

4. 主程序

```python
# Pipe()返回两个链接对象,分别传给生产者和消费者
if __name__ == '__main__':
  producer_conn,consumer_conn = Pipe()
  consumer = Process(target=consumer_task(),args=(consumer_conn,))
  producer = Process(target=producer_task,args=(producer_conn,))

  consumer.start()
  producer.start()

  consumer.join()
  consumer.join()
```

![image-1776602231637](https://img.xuyi.dev/20260419-123711671-image-1776602231637.png)

----

#### Queue队列-多对多通信

> multiprocessing.Queue的接口与queue.Queue相似。但是内部使用呢feeder线程间数据从缓冲区传输到目标进程对应的管道。用户无需手动使用Lock等同步机制,从而节省了同步开销。

![image-1776647076357](https://img.xuyi.dev/20260420-010436388-image-1776647076357.png)

 **Manager().dict()是一个跨进程的共享字典**

普通的dict{}在子进程中只是副本,主进程无法看到子进程的写入。 Manager().dict()通过代理中转,实现真正共享。

```python
# 正确：跨进程共享
fibo_dict = Manager().dict()

# 错误：各进程只操作自己的副本，主进程看到的是空字典
fibo_dict = {}
```

---

### 进程实战练习:使用多进程计算斐波那契数列

**关键导入**

```python
import sys,time,random

import concurrent.fetures

From multiprocessing import cpu_count,current_process,Manager,Process,Queu
```

- `cpu_count`：获取机器 CPU 数量
- current_process:获取当前进程信息(比如名称等)
- Manager:通过代理在不同进程之间共享Python对象,这里会用到共享字典.

**生产者-producer_task**

生成 15 个随机整数作为任务，写入共享队列和共享字典。

```python
def producer_task(q,fibo_dict):
  """
  生产者任务：生成 15 个随机整数作为任务，写入共享队列和共享字典。
  :param q:         multiprocessing.Queue，进程间共享的任务队列
  :param fibo_dict: Manager().dict()，进程间共享的结果字典（此处用于提前占位，值为 None）
  """
  for i in range(15):
    value = random.randint(1,20)
    fibo_dict[value] = None
    
    print("Producer [%s] putting value [%d] into queue...")
    q.put(value)
```

**消费者-consumer_task**

这个函数用于计算`fibo_dict`字典中每一个键的斐波那契数列的值。

```python
def consumer_task(q,fibo_dict):
  """
  消费者任务：从共享队列中取出整数，计算对应的 Fibonacci 值，写入共享字典。

  :param q:         multiprocessing.Queue，进程间共享的任务队列
  :param fibo_dict: Manager().dict()，进程间共享的结果字典
  """
  while not empty():
    value = q.get(True,0.05)
    a,b = 0,1
    for item in range(value):
      a,b = b,a + b
    fibo_dict[value] = a
    time.sleep(random.randint(1,3))
    print("consumer [%s] getting value [%d] from queue..." %(current_process().name,value))
```

**主程序**

```python
if __name__ == '__main__':
  fibo_dict = Manager().dict() # 跨进程共享字典
  data_queue = Queue()
  
  # 阶段一:生产者启动,确保队列已满
  producer = Process(target=producer_task,args=(data_queue,fibo_dict))
  producer.start()
  producer.join()
  
  # 阶段二:按CPU数量启动消费者,全部start后再统一join
  consumer_list = []
  number_of_cpus = cpu_count()
  for i in range(number_of_cpus):
    consumer = Process(target=consumer_task,args=(consumer_list,fibo_dict))
    consumer.start()
    consumer_list.append(consumer)
  
  # 注意:这里的循环join必须在外for循环之外
  [consumer.join() for consumer in consumer_list] 

  print(fibo_dict)
```

![image-20260420094628484](https://images.waer.ltd/notes/202604200946373.png)

---

**一些优化和建议**

- consumer_task中的优化,函数中使用了while循环判空和队列的get操作的写法:

```python
while not q.empty():
      value = q.get(True, 0.05)
      # 用迭代法计算第 value 个 Fibonacci 数（从 F(0)=0 开始）
      # 例如：value=6 → 0,1,1,2,3,5,8 → a=8
      a, b = 0, 1
      for item in range(value):
          a, b = b, a + b
      fibo_dict[value] = a
      time.sleep(
          random.randint(1, 3)
      )  
```

在使用`q.empty()`判断队列是否为空的时候存在竞态条件(`race condition`),多个消费者并发运行的时候,在这个判空方法返回`True`的瞬间

另一个进程可能尚未完成`put()`操作,导致部分任务被漏处理。

应该使用`try/except`来代替`while not q.empty()`这种写法:

```python
def consumer_task(q,fibo_dict):
  while True:
    try:
      value = q.get(timeout=0.05) # 超时抛出queue.Empty
    except Exception:
      brek # 空队列,消费者正常退出
    a,b = 0,1
    for _ in range(value):
      a,b = b, a + b
    fibo_dict[value] = a
    ## print .....
```

- **`producer_task` 里没必要提前写 `fibo_dict[value] = None`**

  消费者会覆盖这个值，提前占位只增加 IPC 开销，可以删掉。

最终的完整代码:

```python
import random
from multiprocessing import Manager, Queue, cpu_count, current_process
from multiprocessing.context import Process


def producer_task(q, fibo_dict):
    """
    生产者任务：生成 15 个随机整数作为任务，写入共享队列和共享字典。
    :param q:         multiprocessing.Queue，进程间共享的任务队列
    :param fibo_dict: Manager().dict()，进程间共享的结果字典（此处用于提前占位，值为 None）
    """
    for i in range(15):
        value = random.randint(1, 20)
        # fibo_dict[value] = None
        print(
            "Producer [%s] putting value [%d] into queue.."
            % (current_process().name, value)
        )
        q.put(value)


def consumer_task(q, fibo_dict):
    while True:
        try:
            value = q.get(timeout=0.05)  # 超时抛出 queue.Empty
        except Exception:
            break  # 队列为空，消费者正常退出
        a, b = 0, 1
        for _ in range(value):
            a, b = b, a + b
        fibo_dict[value] = a
        print(
            "consumer [%s] computed fibo(%d) = %d" % (current_process().name, value, a)
        )


if __name__ == "__main__":
    """
    # 创建跨进程共享的字典（底层由 Manager 服务进程代理）
    # ⚠️ 若换成普通 dict {}，各子进程只能操作自己的副本，主进程看不到修改结果
    """
    fibo_dict = Manager().dict()
    data_queue = Queue()  # 创建跨进程共享队列，用于生产者 → 消费者的任务传递

    producer = Process(target=producer_task, args=(data_queue, fibo_dict))
    producer.start()
    producer.join()

    consumer_list = []
    number_of_cpus = cpu_count()
    for i in range(number_of_cpus):
        consumer = Process(target=consumer_task, args=(data_queue, fibo_dict))
        consumer.start()
        consumer_list.append(consumer)

        # 等待所有消费者完成
    [consumer.join() for consumer in consumer_list]

    # print(fibo_dict)
    print("\nFinal Fibonacci results:")
    for k in sorted(fibo_dict.keys()):
        print(f"fibo({k}) = {fibo_dict[k]}")

```

---

### 进程池实战

在开始之前,先回顾一下,使用线程池完成相同功能的代码:

```python
import logging
import queue
import re
import sys
import threading
from concurrent.futures import ThreadPoolExecutor

import requests

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)
formatter = logging.Formatter("%(asctime)s - %(message)s")

ch = logging.StreamHandler()
ch.setLevel(logging.DEBUG)
ch.setFormatter(formatter)
logger.addHandler(ch)

html_link_regex = re.compile(r"<a\s(?:.*?\s)*?href=['\"](.*?)['\"].*?>")

urls = queue.Queue()
urls.put("https://waer.ltd")
urls.put("https://ornata.app")
urls.put("https://calcfocus.cc")
urls.put("https://xuyi.dev")
urls.put("https://ilikexff.cn")

result_dict = {}


# ====================== 任务函数1：分组URL（把URL放入字典） ======================
def group_urls_task(urls):
    """
    消费者任务：从队列中取出一个URL，并将其作为key放入 result_dict 中
    使用线程池提交多个该任务，实现快速把所有URL登记到字典
    """
    try:
        url = urls.get(True, 0.05)  # 从队列中取出一个url,阻塞等待最多0.05秒
        result_dict[url] = (
            None  # 把URL作为key存入字典,初始值为None,后续会被爬虫结果覆盖
        )
        logger.info(
            "[%s] putting url[%s] in dictionary..."
            % (threading.current_thread().name, url)
        )

    except queue.Empty:
        logging.error("Nothing to be done,queue os empty!")


# ====================== 任务函数2：爬虫任务 ======================
def crawl_task(url):
    """
    爬取单个网页，提取页面中所有的 <a> 标签链接
    返回 (url, links) 元组
    """
    links = []
    try:
        # 发送HTTP GET请求获取网页内容
        requests_data = requests.get(url)
        logger.info(
            "[%s] crawling url [%s] ..." % (threading.current_thread().name, url)
        )
        # 使用正则表达式从HTML文本中提取所有href链接
        links = html_link_regex.findall(requests_data.text)
    except:
        logger.error(sys.exc_info()[0])
        raise
    finally:
        return (url, links)


# ==== 主程序 ====
if __name__ == "__main__":
    # 第一阶段:使使用线程池把所有的url快速登记到result_dict中
    with ThreadPoolExecutor(max_workers=3) as group_link_threads:
        for i in range(urls.qsize()):
            # 提交 group_urls_task 任务，参数是 urls 队列
            group_link_threads.submit(group_urls_task, urls)

    # 此时 result_dict 中应该已经有5个URL作为key，值暂时为None

    # 第二个阶段:使用了一个线程池并发爬取这些URL
    with ThreadPoolExecutor(max_workers=3) as crawler_link_threads:
        # 构建future 与url的映射关系,方便后续获取结果
        future_tasks = {
            crawler_link_threads.submit(crawl_task, url): url
            for url in result_dict.keys()
        }

```

正如`concurrent.futures`模块提供了`ThreadPoolExecutor`，方便创建和操作多个线程，进程属于`ProcessPoolExecutor`类。 `ProcessPoolExecutor` 类也包含在 `concurrent.futures` 包中，用于实现我们的并行 `Web` 爬虫。

> `concurrent.futures` 同时提供 `ThreadPoolExecutor` 和 `ProcessPoolExecutor`，API 完全一致，将类名从 Thread 改为 Process 即可切换，无需改动任何业务逻辑。

**函数签名**

```python
# 阶段一：将 URL 登记进共享字典
def group_urls_task(urls, result_dict, html_link_regex):
    ...

# 阶段二：抓取单个 URL 的所有链接
def crawl_task(url, html_link_regex):
    ...
```

**主程序 —— 使用 Manager 共享队列和字典**

```python
if __name__ == '__main__':
    manager = Manager()
    urls = manager.Queue()          # 注意：用 manager.Queue，非直接 Queue()
    urls.put("https://waer.ltd")
    urls.put("https://ornata.app")
    urls.put("https://calcfocus.cc")
    urls.put("https://xuyi.dev")
    urls.put("https://ilikexff.cn")
    result_dict = manager.dict()

    html_link_regex = re.compile('<a\s(?:.*?\s)*?href=[\'"](.*?)[\'"].*?>')
    number_of_cpus = cpu_count()
```

**阶段一：ProcessPoolExecutor 分组 URL**

```python
# 提交 group_urls_task，将队列中的 URL 登记到 result_dict（值为 None）
with concurrent.futures.ProcessPoolExecutor(
        max_workers=number_of_cpus) as group_link_processes:
    for i in range(urls.qsize()):
        group_link_processes.submit(
            group_urls_task, urls, result_dict, html_link_regex)
```

**阶段二：ProcessPoolExecutor 并发抓取**

```python
# 对每个已登记的 URL 提交 crawl_task，as_completed 实时收集结果
with concurrent.futures.ProcessPoolExecutor(
        max_workers=number_of_cpus) as crawler_link_processes:
    future_tasks = {
        crawler_link_processes.submit(crawl_task, url, html_link_regex): url
        for url in result_dict.keys()
    }
    for future in concurrent.futures.as_completed(future_tasks):
        result_dict[future.result()[0]] = future.result()[1]

```

**网站代码**

```python
import queue
import re
import sys
from concurrent.futures import ProcessPoolExecutor, as_completed
from multiprocessing import Manager, cpu_count, current_process

import requests

result_dict = {}


def group_urls_task(urls, result_dict, html_link_regex):
    try:
        url = urls.get(
            True, 0.05
        )  # true表示阻塞其他线程访问这个队列，0.05表示阻塞的超时时间
        result_dict[url] = None
        print("[%s] putting url [%s] in dictionary..." % (current_process().name, url))
    except queue.Empty:
        print("Nothing to be done, queue is empty")


def crawl_task(url, html_link_regex):
    links = []
    try:
        request_data = requests.get(url)
        print("[%s] crawling url [%s] ..." % (current_process().name, url))
        links = html_link_regex.findall(request_data.text)
    except:
        print(f"error: {sys.exc_info()[0]}")
        raise
    finally:
        return (url, links)


if __name__ == "__main__":
    manager = Manager()
    urls = manager.Queue()
    urls.put("https://waer.ltd")
    urls.put("https://ornata.app")
    urls.put("https://calcfocus.cc")
    urls.put("https://xuyi.dev")
    urls.put("https://ilikexff.cn")
    result_dict = manager.dict()

    html_link_regex = re.compile(r"<a\s(?:.*?\s)*?href=['\"](.*?)['\"].*?>")
    number_of_cpus = cpu_count()

    with ProcessPoolExecutor(max_workers=number_of_cpus) as group_link_processes:
        for i in range(urls.qsize()):
            group_link_processes.submit(
                group_urls_task, urls, result_dict, html_link_regex
            )

    with ProcessPoolExecutor(max_workers=number_of_cpus) as crawler_link_processes:
        future_tasks = {
            crawler_link_processes.submit(crawl_task, url, html_link_regex): url
            for url in result_dict.keys()
        }
        for future in as_completed(future_tasks):
            result_dict[future.result()[0]] = future.result()[1]

    for url, links in result_dict.items():
        print(f"[{url}] with links: [{links[0]}...")
```
