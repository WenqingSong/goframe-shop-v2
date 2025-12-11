# goframe-shop-v2

A modern e‑commerce system built with GoFrame v2.9.5. The project demonstrates production‑ready backend practices and decoupled frontends.

## Features

- Products, options & inventory, orders & addresses, coupons, articles/CMS
- File uploads (Qiniu optional), configurable local upload path
- JWT auth for frontend, RBAC for admin, unified middleware & responses
- Swagger/OpenAPI auto‑generated docs
- Seckill demo and optimizations (benchmarks & SQL tuning examples)
- Optional Docker/K8s manifests for enterprise deploymentsome`

## Quick Start

### Prerequisites

- `Go >= 1.23` (module `goframe-shop-v2`, see `go.mod`)
- GoFrame `v2.9.5`
- MySQL & Redis available locally
- Optional: `gf` CLI for hot reload and code generation

### Get the code

```bash
git clone https://github.com/wangzhongyang007/goframe-shop-v2
cd goframe-shop-v2
```

### Initialize database

- Import SQL: `hack/shop.sql`

### Configure application

- Copy example config and adjust DB/Redis/Qiniu:
  - `manifest/config/example_config.yaml` → `manifest/config/config.yaml`
  - DB password: `manifest/config/config.yaml` → `database.default.pass`
  - Redis: `manifest/config/config.yaml` → `redis.default`
  - Qiniu (optional): fill `qiniu.bucket/accessKey/secretKey/url`
- Optional: `hack/example_config.yaml` for `gf gen dao` during development

### Run

```bash
# Direct run
go run main.go

# Hot reload via GoFrame CLI
gf run main.go
```

Swagger: `http://127.0.0.1:8000/swagger/`

### Frontends

- Web frontend: `frontend_web` (Vue)
  - See `frontend_web/README.md` for install & dev scripts
- Admin frontend: `frontend_manage` (Vue + ElementUI)

Test account (frontend): user `wangzhongyang`, password `111111` (see `frontend_web/README.md`)

## Deployment

### Docker

- Build binary: `gf build` produces `./temp/linux_amd64/main`
- Use `manifest/docker/Dockerfile` to build the image (bundles `resource` + binary)

### Kubernetes (Kustomize)

- Base: `manifest/deploy/kustomize/base`
- Develop overlay: `manifest/deploy/kustomize/overlays/develop`
- Adjust `configmap.yaml` and `deployment.yaml` for your environment

## Troubleshooting

- Go/GoFrame mismatch: use `Go >= 1.23` and GoFrame v2.9.x
- DB or config issues: verify credentials in `manifest/config/config.yaml`
- Qiniu not configured: service still starts; uploads disabled

## Contributing

- Issues and PRs are welcome
- Flow: Fork → feature branch → commit → Pull Request

## License

For learning and demo purposes. Add your preferred license for production use.
