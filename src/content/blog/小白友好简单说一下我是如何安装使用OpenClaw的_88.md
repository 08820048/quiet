# 小白友好，简单说一下我是如何安装使用OpenClaw的

**摘要**：最近刷 X 的时候，推荐里面的帖子，一半以上都是和Clawdbot相关的话题。也看到很多大佬写的教程，对于有一定基础的人来说，这些教程很够用了，但其实对于更多的普通人，或者说并非这个领域的朋友，尽管教程足够清晰，但是在安装配置的过程中遇到的一点意外，或者某一个教程中尚未提及的问题，都足以将太多人拒之门外。

**分类**：学习笔记

**标签**：教程笔记

**发布时间**：2026-01-30T01:23:44

---

# 小白友好，简单说一下我是如何安装使用Moltbot的

![image-1769702388559](https://images.waer.ltd/notes/202601292359490.png)

最近刷 X 的时候，推荐里面的帖子，一半以上都是和Clawdbot相关的话题。也看到很多大佬写的教程，对于有一定基础的人来说，这些教程很够用了，但其实对于更多的普通人，或者说并非这个领域的朋友，尽管教程足够清晰，但是在安装配置的过程中遇到的一点意外，或者某一个教程中尚未提及的问题，都足以将太多人拒之门外。
>所以写这篇文章的目的，不是说我的教程天衣无缝，牛逼哄哄，相反，这是一个傻瓜式的使用教程，基本上只负责照做，不需要过多思考(不代表不带脑子)就可以成功建立你和Clawdbot之间友谊的文章。
---
## 热身活动-前置条件准备
![image-1769703340390](https://images.waer.ltd/notes/202601300015806.png)

事先说明一下，我这个教程不是一个全量无死角的配置使用教程。由于[clawd.bot/](https://clawd.bot/) 的配置项很多，意味着需要准备的各类条件也不一样，因此，没有特殊说明的情况下，本文默认的配置路径如下：
- 非本地部署，使用腾讯云服务器进行部署。
- AI 模型使用 GLM 模型。
- 聊天通讯使用 `Telegram`。

所以，在正式教程开始之前，你需要准备一台云服务器，我推荐使用腾讯云近期推出的 `Lighthouse`系列，专门为这个项目打造的镜像，直接购买服务器即可，省去安装步骤。至于，配置，可以根据自己的需求来选择，比如下面这个基础款2H2G 的也可以，才 20 一个月，尝鲜性价比很高了。
![image-1769703481242](https://images.waer.ltd/notes/202601300018496.png)
一个正常可用的纸飞机账号和一个 GML 模型密钥。
以上就绪之后，开始步入正题。

---
## 开始部署
### 配置模式选择
登录你购买的服务器，方式随意，我是使用[termius](https://termius.com/)通过ssh客户端 进行远程登录的。登录之后切换到 root 用户，执行下面的配置指令：
```shell
clawdbot onboard
```
指令执行之后，会自动进入Moltbot 的自动化交互配置脚本，按照提示一步步完成一些基础配置。第一项就是一个条款同意的配置，选择yes 即可，然后再是配置方式，分为快速版本和正常版本，我们选择快速配置版本开始配置流程。
![image-1769704298470](https://images.waer.ltd/notes/202601300031304.png)
### 模型选择
目前，Clawdbot 支持十余种 AI 模型厂商，本文中，我们通过方向键在模型列表中选择 **Z.AI（GLM-4.7）** 这个模型。
> 注意，Clawdbox 默认支持的GLM 国产模型是海外版本，所以，建议你前往智谱 AI 的[海外版官网](https://z.ai/manage-apikey/apikey-list)准备一个 4.7 模型的密钥备用。

选中模型之后，回车之后提示输入 GLM-4.7 的密钥进行授权验证。这就完成了模型选择配置的步骤。

---
### 配置Telegram机器人
在继续的步骤中，选择纸飞机之后，会出现类似下面图中的配置提示，里面就包含了纸飞机的API 获取步骤：
![image-1769705079771](https://images.waer.ltd/notes/202601300044837.png)
根据提示，我们需要打开Telegram。搜索“@botfather”。发送 /newbot。给你的机器人命名。命名成功被采用之后，在机器人回复的消息中复制bot token到终端输入。
![image-1769705300571](https://images.waer.ltd/notes/202601300048794.png)

---
### 配置skills和hooks
这是一个可选步骤，可以先跳过，不影响本文的目的。所以理论上，到这里，你的Clawdbox就已经配置完成了，但是你可能会遇到下面这样类似的问题，提示网关异常，无法正常建立连接。
![image-1769705509216](https://images.waer.ltd/notes/202601300051168.png)
错误码 1006 是 WebSocket 异常关闭（没有正常 close frame），几乎总是因为 Gateway 进程根本没启动、启动失败或立即崩溃，CLI 尝试连 ws://127.0.0.1:18789 时直接连不上或连接被服务器端粗暴断开。

主要原因是我们是使用 root 身份进行运行的，而在 Linux 服务器（尤其是云 VPS、容器、部分 Ubuntu/Debian minimal 镜像）上，默认 不启用 systemd user instance（--user 模式的 systemd）。
Onboarding 里的 --install-daemon 试图创建 user-level systemd service（moltbot-gateway.service），但因为 user systemd 没启用，所以跳过了 service 安装 → 后台 daemon 没起来 → gateway 没运行。

以上问题我选择的解决方法如下：

---
### 启动时网关1006异常的解决方案
解决这个问题的方法不唯一，我采用的是手动启用` systemd user mode`。在 root 环境下执行：
```shell
# 1. 启用当前用户（root）的 lingering + runtime dir
loginctl enable-linger root
export XDG_RUNTIME_DIR=/run/user/$(id -u root)   # 通常是 /run/user/0

# 2. 重新安装 daemon（会创建 user systemd service）
clawdbot daemon install    # 或 moltbot daemon install

# 3. 启动
clawdbot daemon start

# 4. 检查
clawdbot daemon status
clawdbot gateway status
journalctl --user -u moltbot-gateway.service -n 100 -f   # 看日志
```
正常情况下，上述代码中，执行完1,2,3步骤之后，服务会被自动重启，然后我们可以通过第4步中的指令检查服务启动的状态，当你看到下面这样的输出，说明moltbot服务成功启动并在后台运行。
![image-1769705897174](https://images.waer.ltd/notes/202601300058920.png)

---
### Telegram配对
确保服务正常启动运行之后，我们回到Telegram中，给创建的Telegram机器人随便发个消息，这时候机器人就会回复你一个配对码，你需要将这个配对码复制，然后回到服务器中执行下面的指令输入配对码进行配对。
```shell
clawdbot pairing approve telegram KN*****9
```
配对成功的输出大致如下：
![image-1769706244966](https://images.waer.ltd/notes/202601300104897.png)
ok，大功告成，现在回到Telegram中，给机器人发送消息，就可以收到AI的响应回复了，此时，clawdbot就成为了你的私人助理，你可以通过机器人给clawdbot下达指令，任务。比如，我之前用Manus进行的一个每日定时获取并整理成公众号文章的任务，由于我的Manus积分用完了，现在就可以使用clawdbot来完成这个工作。
![image-1769706499980](https://images.waer.ltd/notes/202601300108997.png)
通过聊天的方式就可以只会 AI 干活，简直不要太舒服。

---
### 控制面板的处理
clawdbot提供了一个网页版的控制台，下面我分享一下如何在自己本机浏览器中打开这个控制台页面，在本机终端中执行：
```shell
ssh -N -L 18789:127.0.0.1:18789 ubuntu@IP
```
其中的**IP**指的是我们刚才配置clawdbot的那台腾讯云服务器的公网 IP地址，可能需要输入密码，密码就是你连接的这台服务器的对应用户的登录密码，输入之后，我们在回到之前的配置流程中，其中的 **Dashboard ready**区域，会显示web 端的 UI 控制中心的访问地址。我们将这个地址复制到本机浏览器中直接访问即可进入 **CLAWDBOT** 控制台。
![image-1769706909352](https://images.waer.ltd/notes/202601300115524.png)
在网页版控制台中，我们建议通过可视化的方式，继续完成那些配置脚本中展示跳过的配置，比如 skills 的配置等更多的功能。
![image-1769707065911](https://images.waer.ltd/notes/202601300117873.png)
感谢阅读。