# Apex 轻量化博客系统部署教程

**摘要**：ApexBlog 是一个基于 Spring Boot 3.x 的现代化博客系统，支持前后端分离架构。

**分类**：学习笔记

**标签**：前端, Java, Vue.js, MySQL, Spring Boot

**发布时间**：2025-09-29T16:33:41

---

# ApexBlog 部署文档

## 📋 项目概述

ApexBlog 是一个基于 Spring Boot 3.x 的现代化博客系统，支持前后端分离架构。


---
开源地址： [apex](https://github.com/08820048/apex)

### 技术栈
- **后端**: Spring Boot 3.3.5 + Java 17
- **数据库**: MySQL 8.0
- **缓存**: 内存缓存 (Simple Cache)
- **认证**: JWT Token
- **API文档**: SpringDoc OpenAPI 3
- **前端**: 静态文件部署
- **构建工具**: Gradle

### 系统架构
```
前端静态文件 (Nginx) → 后端API (Spring Boot :8888/api) → MySQL 数据库
```

## ⚠️ 常见部署问题及解决方案

在部署过程中可能遇到以下问题，请参考对应解决方案：

### 1. 数据库连接被拒绝
**错误**: `Access denied for user 'root'@'localhost'`
**原因**: MySQL 8.0 认证方式兼容性问题
**解决**: 修改为 `mysql_native_password` 认证方式
```bash
mysql -u root -p -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';"
```

### 2. 应用启动后无法访问
**现象**: systemd显示服务运行，但8888端口无法访问
**排查**: 手动启动应用查看详细错误日志
```bash
sudo systemctl stop apexblog
java -jar /opt/apex/apex-blog-1.0.0.jar --spring.profiles.active=prod
```

### 3. Nginx配置选择
**方案1**: 路径分离 - 管理后台通过 `/admin` 路径访问
**方案2**: 子域名分离 - 管理后台通过 `admin.domain.com` 访问
根据需求选择合适的方案，详见第6步配置说明。

## 🔧 系统要求

### 硬件要求
- **CPU**: 2核心以上
- **内存**: 4GB RAM 以上
- **磁盘**: 20GB 可用空间
- **网络**: 稳定的互联网连接

### 软件要求
- **操作系统**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **Java**: OpenJDK 17
- **MySQL**: 8.0+
- **Nginx**: 1.18+

## 📦 部署准备

### 1. 构建项目

#### 后端构建
```bash
# 在项目根目录执行
./gradlew clean bootJar

# 生成的JAR文件位置
build/libs/apex-blog-1.0.0.jar
```

#### 前端构建
确保 `frontend/dist` 和 `admin/dist` 目录包含构建好的静态文件。

### 2. 准备部署文件

#### 2.1 本地准备文件
在本地项目目录中准备以下文件：
```
本地项目目录:
├── build/libs/apex-blog-1.0.0.jar    # 后端应用 (./gradlew bootJar 生成)
├── apex_blog.sql                      # 数据库备份文件 (包含完整的表结构和数据)
├── frontend/dist/                     # 前端静态文件
└── admin/dist/                        # 管理后台静态文件
```

#### 2.2 上传到服务器
将文件上传到服务器的部署目录 `/opt/apex/`：

```bash
# 在服务器上创建部署目录
mkdir -p /opt/apex

# 使用 scp 上传文件到服务器 (在本地执行)
scp build/libs/apex-blog-1.0.0.jar root@your-server-ip:/opt/apex/
scp apex_blog.sql root@your-server-ip:/opt/apex/
scp -r frontend/dist root@your-server-ip:/opt/apex/frontend/
scp -r admin/dist root@your-server-ip:/opt/apex/admin/

# 或者使用 SFTP 工具 (如 FileZilla, WinSCP 等) 上传到 /opt/apex/
```

**注意**: 项目已包含完整的配置文件：
- `src/main/resources/application.yml` - 主配置文件
- `src/main/resources/application-dev.yml` - 开发环境配置
- `src/main/resources/application-prod.yml` - 生产环境配置

## 🚀 部署步骤

### 步骤 1: 系统准备

#### 1.1 检查和开放端口
```bash
# 检查当前开放的端口
sudo netstat -tlnp

# 检查防火墙状态
sudo ufw status

# 开放必要的端口
sudo ufw allow 22      # SSH
sudo ufw allow 80      # HTTP
sudo ufw allow 443     # HTTPS
sudo ufw allow 3306    # MySQL (可选，仅本地访问可不开放)
sudo ufw allow 8888    # 应用端口 (可选，通过Nginx代理可不开放)

# 启用防火墙
sudo ufw enable

# 确认端口开放状态
sudo ufw status numbered
```

#### 1.2 检查端口占用
```bash
# 检查关键端口是否被占用
sudo lsof -i :80    # HTTP端口
sudo lsof -i :443   # HTTPS端口
sudo lsof -i :3306  # MySQL端口
sudo lsof -i :8888  # 应用端口

# 如果端口被占用，可以停止相关服务
# sudo systemctl stop service_name
```

### 步骤 2: 环境安装

#### 2.1 安装 Java 17
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install openjdk-17-jdk -y

# CentOS/RHEL
sudo yum install java-17-openjdk-devel -y

# 验证安装
java -version
```

#### 2.2 安装 MySQL 8.0
```bash
# Ubuntu/Debian
sudo apt install mysql-server -y

# CentOS/RHEL
sudo yum install mysql-server -y

# 启动服务
sudo systemctl start mysql
sudo systemctl enable mysql

# 安全配置
sudo mysql_secure_installation
```

#### 2.3 安装 Nginx
```bash
# Ubuntu/Debian
sudo apt install nginx -y

# CentOS/RHEL
sudo yum install nginx -y

# 启动服务
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 步骤 3: 数据库配置

#### 3.1 创建数据库
```bash
# 登录 MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE apex_blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 退出 MySQL
EXIT;
```

#### 3.2 导入数据库备份
```bash
# 导入表结构和数据到指定数据库
mysql -u root -p apex_blog < /opt/apex/apex_blog.sql
```

**注意**: `apex_blog.sql` 包含表结构和数据，但不包含数据库创建语句，需要先手动创建数据库。

### 步骤 4: 应用部署

#### 4.1 创建Web和日志目录
```bash
sudo mkdir -p /var/www/apexblog/frontend
sudo mkdir -p /var/www/apexblog/admin
sudo mkdir -p /var/log/apexblog
```

#### 4.2 部署应用文件
```bash
# JAR文件已在 /opt/apex/ 目录中，无需移动

# 复制前端文件到Web目录
sudo cp -r /opt/apex/frontend/dist/* /var/www/apexblog/frontend/
sudo cp -r /opt/apex/admin/dist/* /var/www/apexblog/admin/

# 设置权限
sudo chown -R www-data:www-data /var/www/apexblog
sudo chmod -R 755 /var/www/apexblog
```

#### 4.3 生产环境配置
项目已包含完整的 `application-prod.yml` 配置文件，配置与开发环境基本相同。

如需修改生产环境配置，可以：
1. **直接修改源码**: 编辑 `src/main/resources/application-prod.yml` 后重新构建
2. **外部配置文件**: 在部署目录创建 `application-prod.yml` 覆盖JAR包中的配置

主要可能需要修改的配置项：
- 数据库连接信息 (用户名、密码)
- 邮件服务配置
- 博客基本信息 (标题、作者、域名等)
- 日志文件路径

### 步骤 5: 系统服务配置

#### 5.1 创建系统服务
```bash
sudo tee /etc/systemd/system/apexblog.service << 'EOF'
[Unit]
Description=ApexBlog Application
After=network.target mysql.service
Requires=mysql.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/apex
ExecStart=/usr/bin/java -jar -Xms512m -Xmx1024m /opt/apex/apex-blog-1.0.0.jar --spring.profiles.active=prod
ExecStop=/bin/kill -15 $MAINPID
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

Environment=JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
Environment=SPRING_PROFILES_ACTIVE=prod

[Install]
WantedBy=multi-user.target
EOF
```

#### 5.2 启动应用服务
```bash
# 重新加载systemd配置
sudo systemctl daemon-reload

# 启用并启动服务
sudo systemctl enable apexblog
sudo systemctl start apexblog

# 检查服务状态
sudo systemctl status apexblog
```

### 步骤 6: Nginx 配置

#### 6.1 创建 Nginx 配置文件

**方案1: 路径分离（推荐）**
```bash
sudo tee /etc/nginx/sites-available/apexblog << 'EOF'
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # 前端静态文件
    location / {
        root /var/www/apexblog/frontend;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 管理后台
    location /admin {
        alias /var/www/apexblog/admin;
        index index.html;
        try_files $uri $uri/ /admin/index.html;
    }

    # API代理
    location /api/ {
        proxy_pass http://localhost:8888/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # 日志配置
    access_log /var/log/nginx/apexblog.access.log;
    error_log /var/log/nginx/apexblog.error.log;
}
EOF
```

**方案2: 子域名分离（推荐，支持HTTPS）**
```bash
sudo tee /etc/nginx/sites-available/apexblog << 'EOF'
# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name ilikexff.cn www.ilikexff.cn admin.ilikexff.cn;
    return 301 https://$server_name$request_uri;
}

# 主站 HTTPS
server {
    listen 443 ssl http2;
    server_name ilikexff.cn www.ilikexff.cn;

    # SSL 证书配置
    ssl_certificate /etc/letsencrypt/live/ilikexff.cn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ilikexff.cn/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # 前端静态文件 - 指向 dist 文件夹
    location / {
        root /var/www/apexblog/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API 代理到后端
    location /api/ {
        proxy_pass http://localhost:8888/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # 日志配置
    access_log /var/log/nginx/apexblog.access.log;
    error_log /var/log/nginx/apexblog.error.log;
}

# 管理后台 HTTPS
server {
    listen 443 ssl http2;
    server_name admin.ilikexff.cn;

    # SSL 证书配置
    ssl_certificate /etc/letsencrypt/live/ilikexff.cn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ilikexff.cn/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # 管理后台静态文件 - 指向 dist 文件夹
    location / {
        root /var/www/apexblog/admin/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API 代理到后端
    location /api/ {
        proxy_pass http://localhost:8888/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # 日志配置
    access_log /var/log/nginx/admin.access.log;
    error_log /var/log/nginx/admin.error.log;
}
EOF
```

**注意**:
- 方案1访问地址: 前台 `http://your-domain.com`，管理后台 `http://your-domain.com/admin`
- 方案2访问地址: 前台 `https://ilikexff.cn`，管理后台 `https://admin.ilikexff.cn`
- 使用方案2时需要确保DNS解析中配置了子域名 `admin.ilikexff.cn`
- **重要**: 配置中的 `root` 路径指向 `dist` 文件夹，前端上传时直接上传 `dist` 文件夹即可

#### 6.1.1 前端环境变量配置

在重新构建前端之前，需要修改环境变量配置：

**主站前端配置** (`frontend/.env.production`):
```bash
# 生产环境配置
VITE_APP_TITLE=八尺妖剑
VITE_API_BASE_URL=https://ilikexff.cn/api
VITE_SERVER_HOST=ilikexff.cn
VITE_DEBUG=false
VITE_ENABLE_QUERY_STATS=true
```

**管理后台配置** (`admin/.env.production`):
```bash
# 生产环境配置
VITE_APP_TITLE=八尺妖剑 - 管理后台
VITE_API_BASE_URL=https://admin.ilikexff.cn/api
VITE_SERVER_HOST=admin.ilikexff.cn
VITE_DEBUG=false
VITE_ENABLE_QUERY_STATS=true
```

**前端重新部署流程**:
```bash
# 1. 修改环境变量配置文件
# 2. 重新构建前端
cd frontend && npm run build
cd ../admin && npm run build

# 3. 直接上传 dist 文件夹到服务器
scp -r frontend/dist root@server:/var/www/apexblog/frontend/
scp -r admin/dist root@server:/var/www/apexblog/admin/

# 4. 设置权限
sudo chown -R www-data:www-data /var/www/apexblog
sudo chmod -R 755 /var/www/apexblog
```

#### 6.1.2 后端更新部署流程

当后端代码有更新时，按以下步骤操作：

**步骤1: 本地构建新的JAR包**
```bash
# 在本地项目根目录执行
./gradlew clean bootJar

# 构建完成后，JAR包位于：build/libs/apex-blog-1.0.0.jar
```

**步骤2: 上传新的JAR包到服务器**
```bash
# 上传新的JAR包（覆盖旧版本）
scp build/libs/apex-blog-1.0.0.jar root@server:/opt/apex/

# 或者备份旧版本后再上传
scp build/libs/apex-blog-1.0.0.jar root@server:/opt/apex/apex-blog-1.0.0.jar.new
```

**步骤3: 在服务器上重启应用**
```bash
# 停止当前运行的应用
sudo systemctl stop apexblog

# 备份当前JAR包（可选）
sudo cp /opt/apex/apex-blog-1.0.0.jar /opt/apex/apex-blog-1.0.0.jar.backup.$(date +%Y%m%d_%H%M%S)

# 如果使用了.new文件，重命名
sudo mv /opt/apex/apex-blog-1.0.0.jar.new /opt/apex/apex-blog-1.0.0.jar

# 启动应用
sudo systemctl start apexblog

# 检查服务状态
sudo systemctl status apexblog

# 查看启动日志
sudo journalctl -u apexblog -f --lines=50
```

**步骤4: 验证部署**
```bash
# 检查应用健康状态
curl -I https://ilikexff.cn/api/actuator/health

# 检查应用日志
sudo tail -f /var/log/apexblog/apex-blog.log
```

**快速重启脚本**（可选）:
```bash
# 创建快速部署脚本
sudo tee /opt/apex/restart-app.sh << 'EOF'
#!/bin/bash
echo "停止应用..."
sudo systemctl stop apexblog

echo "备份当前版本..."
sudo cp /opt/apex/apex-blog-1.0.0.jar /opt/apex/apex-blog-1.0.0.jar.backup.$(date +%Y%m%d_%H%M%S)

echo "启动应用..."
sudo systemctl start apexblog

echo "检查状态..."
sleep 5
sudo systemctl status apexblog

echo "检查健康状态..."
curl -I https://ilikexff.cn/api/actuator/health
EOF

# 设置执行权限
sudo chmod +x /opt/apex/restart-app.sh

# 使用方法：
# sudo /opt/apex/restart-app.sh
```

#### 6.2 启用配置并重启 Nginx
```bash
# 启用站点配置
sudo ln -s /etc/nginx/sites-available/apexblog /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

## � 更新部署

### 前端更新
当前端代码有更新时：

```bash
# 1. 本地重新构建
cd frontend && npm run build
cd ../admin && npm run build

# 2. 直接上传覆盖
scp -r frontend/dist root@server:/var/www/apexblog/frontend/
scp -r admin/dist root@server:/var/www/apexblog/admin/

# 3. 设置权限
sudo chown -R www-data:www-data /var/www/apexblog
sudo chmod -R 755 /var/www/apexblog

# 4. 清除浏览器缓存测试
```

### 后端更新
当后端代码有更新时：

```bash
# 1. 本地重新构建
./gradlew clean bootJar

# 2. 上传新JAR包
scp build/libs/apex-blog-1.0.0.jar root@server:/opt/apex/

# 3. 服务器上重启应用
sudo systemctl stop apexblog
sudo systemctl start apexblog

# 4. 验证部署
sudo systemctl status apexblog
curl -I https://ilikexff.cn/api/actuator/health
```

### 数据库更新
如果有数据库结构变更：

```bash
# 1. 备份当前数据库
mysqldump -u root -p apex_blog > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. 执行SQL更新脚本
mysql -u root -p apex_blog < update_script.sql

# 3. 重启应用以应用新的数据库结构
sudo systemctl restart apexblog
```

## �🔒 SSL 证书配置 (可选)

### 使用 Let's Encrypt 免费证书
```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 申请证书（包含所有子域名）
sudo certbot --nginx -d ilikexff.cn -d www.ilikexff.cn -d admin.ilikexff.cn

# 设置自动续期
sudo crontab -e
# 添加以下行
0 12 * * * /usr/bin/certbot renew --quiet

# 验证证书状态
sudo certbot certificates
```

## � 部署验证

### 检查服务和端口
```bash
# 检查所有服务状态
sudo systemctl status apexblog
sudo systemctl status mysql
sudo systemctl status nginx

# 检查端口监听状态
sudo netstat -tlnp | grep -E "(80|443|3306|8888)"

# 检查防火墙状态
sudo ufw status

# 测试本地连接
curl -I http://localhost:8888/api/actuator/health
curl -I http://localhost:80
```

## �📊 服务管理

### 常用命令
```bash
# 查看应用状态
sudo systemctl status apexblog

# 重启应用
sudo systemctl restart apexblog

# 查看应用日志
sudo journalctl -u apexblog -f

# 查看应用业务日志
sudo tail -f /var/log/apexblog/apex-blog.log

# 重启 Nginx
sudo systemctl restart nginx

# 查看 Nginx 日志
sudo tail -f /var/log/nginx/apexblog.access.log
```

## 🔧 故障排查

### 应用无法启动
```bash
# 查看详细日志
sudo journalctl -u apexblog -n 50

# 检查端口占用
sudo netstat -tlnp | grep 8888

# 检查配置文件
sudo cat /opt/apexblog/application-prod.yml
```

### 数据库连接失败

**常见错误**: `Access denied for user 'root'@'localhost'`

**原因**: MySQL 8.0 默认使用 `caching_sha2_password` 认证方式，Java应用可能不兼容

**解决步骤**:

1. **检查MySQL服务状态**:
```bash
sudo systemctl status mysql
```

2. **测试命令行连接**:
```bash
mysql -u root -p5247xff -e "SELECT 1;"
```

3. **如果命令行连接正常但应用连接失败，修改认证方式**:
```bash
mysql -u root -p5247xff -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '5247xff';"
```

4. **验证数据库和表是否存在**:
```bash
# 检查数据库
mysql -u root -p5247xff -e "SHOW DATABASES;" | grep apex_blog

# 检查数据表
mysql -u root -p5247xff apex_blog -e "SHOW TABLES;"
```

5. **手动启动应用测试**:
```bash
# 停止systemd服务
sudo systemctl stop apexblog

# 手动启动查看详细日志
cd /opt/apex
java -jar apex-blog-1.0.0.jar --spring.profiles.active=prod
```

6. **如果手动启动成功，重新启动systemd服务**:
```bash
# 按Ctrl+C停止手动启动
sudo systemctl start apexblog
sudo systemctl status apexblog
```

**其他数据库问题排查**:
```bash
# 查看数据库和用户
mysql -u root -p -e "SHOW DATABASES; SELECT user, host FROM mysql.user;"

# 检查用户权限
mysql -u root -p -e "SHOW GRANTS FOR 'root'@'localhost';"
```

### Nginx 502 错误
```bash
# 检查应用是否运行
curl -I http://localhost:8888/api/actuator/health

# 查看 Nginx 错误日志
sudo tail -20 /var/log/nginx/apexblog.error.log
```

## 🎯 访问地址

部署完成后，可以通过以下地址访问：

**方案1 (路径分离)**:
- **前端网站**: http://your-domain.com
- **管理后台**: http://your-domain.com/admin
- **API文档**: http://your-domain.com/api/swagger-ui.html
- **健康检查**: http://your-domain.com/api/actuator/health

**方案2 (子域名分离 + HTTPS) - 当前配置**:
- **前端网站**: https://ilikexff.cn
- **管理后台**: https://admin.ilikexff.cn
- **API文档**: https://ilikexff.cn/api/swagger-ui.html
- **健康检查**: https://ilikexff.cn/api/actuator/health

**注意**:
- 当前使用方案2，所有HTTP请求会自动重定向到HTTPS
- DNS解析已配置子域名 `admin.ilikexff.cn` 指向服务器IP
- SSL证书覆盖所有域名：`ilikexff.cn`, `www.ilikexff.cn`, `admin.ilikexff.cn`

## 📝 默认账号

数据库备份中包含的默认管理员账号：
- **用户名**: xuyi
- **密码**: 请查看数据库备份中的实际数据 (密码已加密存储)

**注意**: 首次登录后请及时修改密码！

---

**部署完成！** 🎉

记得根据实际情况修改配置文件中的数据库密码、JWT密钥、邮件配置等敏感信息。
