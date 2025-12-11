# goframe-shop-v2 电商系统

基于 GoFrame v2.9.5 构建的前后端分离电商系统，聚焦 GoFrame 最佳实践与中后台业务落地。

# 目录说明

1. 项目遵循 GoFrame 官方推荐的分层结构（`internal` 业务分层/服务注册在 `internal/cmd`）。
2. Web 前台目录：`frontend_web`
3. 管理后台前端目录：`frontend_manage`

# 特性

- 商品管理、规格与库存、订单与地址、优惠券、文章/CMS
- 文件上传（支持七牛云，可选），本地上传目录可配置
- JWT 前台认证、RBAC 后台权限、统一中间件与响应封装
- Swagger/OpenAPI 自动文档，接口开发体验友好
- 秒杀示例与优化（含基准测试与 SQL 优化示例）
- 可选 Docker/K8s 部署清单，支持企业级上线

# 快速开始

## 1. 环境要求

- `Go >= 1.23`（模块 `goframe-shop-v2`，参考 `go.mod`）
- GoFrame `v2.9.5`（项目已集成，参考依赖）
- MySQL、Redis 本地可用
- 可选：安装 `gf` CLI 以便热重载与代码生成

## 2. 获取代码

```bash
git clone https://github.com/wangzhongyang007/goframe-shop-v2
cd goframe-shop-v2
```

## 3. 初始化数据库

- 导入 SQL：`hack/shop.sql`

## 4. 配置文件

- 复制示例配置为正式配置，并按需修改数据库与存储：
  - `manifest/config/example_config.yaml` → `manifest/config/config.yaml`
  - 数据库密码修改：`manifest/config/config.yaml` 的 `database.default.pass`
  - Redis 可选修改：`manifest/config/config.yaml` 的 `redis.default`
  - 七牛云为可选，需填写 `qiniu` 的 `bucket/accessKey/secretKey/url`
- 可选：`hack/example_config.yaml` 为 `gf gen dao` 的生成配置（仅开发阶段）

## 5. 启动服务

```bash
# 直接运行
go run main.go

# 使用 GoFrame CLI 热重载
gf run main.go
```

启动后接口文档：`http://127.0.0.1:8000/swagger/`

## 6. 前端项目

- Web 前台：`frontend_web`（Vue）
  - 安装依赖与启动：见 `frontend_web/README.md`
- 管理后台：`frontend_manage`（Vue + ElementUI）

测试账号（前台）：账号 `wangzhongyang`，密码 `111111`（参考 `frontend_web/README.md`）

# 部署

## Docker

- 打包二进制：使用 `gf build` 生成 `./temp/linux_amd64/main`
- 镜像构建：使用 `manifest/docker/Dockerfile`
- 运行：镜像将加载 `resource` 与编译好的二进制

## Kubernetes（Kustomize）

- 基础清单：`manifest/deploy/kustomize/base`
- 开发环境覆盖：`manifest/deploy/kustomize/overlays/develop`
- 根据环境调整 `configmap.yaml` 与 `deployment.yaml`

# 常见问题

- Go/GoFrame 版本不匹配：请使用 `Go >= 1.23` 与 GoFrame v2.9.x
- 数据库或配置错误：检查 `manifest/config/config.yaml` 的账号密码
- 七牛云未配置：不影响项目启动，上传功能不可用

# 贡献

- 欢迎提交 Issue/PR，规范化分支与提交信息
- 推荐流程：Fork → 新建特性分支 → 提交代码 → 提 PR

# 社区与联系

- 博客：`https://juejin.cn/user/2189882892232029/posts`
- 公众号：王中阳
- 微信：`wangzhongyang1993`

# 交叉编译

## for Linux

```
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build
```

## for Windows

```
CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build
```

# 许可证

本仓库代码仅用于学习与交流，正式商用请依据自身合规要求配置许可证。

## 我的知识星球

https://wx.zsxq.com/dweb2/index/group/15528828844882

## 微信

wangzhongyang1993

## 我的博客

https://juejin.cn/user/2189882892232029/posts

## 我的公众号

王中阳

# 交叉编译

## for Linux

```
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build
```

## for windows

```
CGO_ENABLE=0 GOOS=windows GOARCH=amd64 go build
```

# 部署流程

1. 本地提交git
2. 远程服务器已经安装Go环境
3. 执行部署脚本：

```
setup.sh
```

# 热更新启动项目

```
gf run main.go
```
