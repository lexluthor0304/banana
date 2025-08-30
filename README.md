# Image Editor on Cloudflare Pages

A multi-language image editing web app using Google's Gemini model. Users buy credits via Stripe Checkout and spend one credit per edit. Built to run entirely on **Cloudflare Pages** with Pages Functions.

## Features
- Upload an image and optional prompt, edit via `gemini-2.5-flash-image-preview`.
- Preview and download the edited PNG.
- Anonymous users identified by `uid` cookie; credits stored in KV.
- Stripe Checkout selling 10 or 50 credit packs; webhook adds credits.
- Internationalisation (en/ja/zh) with auto‑detection and manual switch.
- Tailwind UI, TypeScript strict, ESLint + Prettier.
- Designed for future R2/D1 expansion.

## Stack
```
Browser --fetch--> Cloudflare Pages ----> Google Gemini API
          |                    |\
          |                    | \--> Stripe API / Webhooks
          |                    \--> KV (credits)
```

## Local Development
1. `cp .env.sample .env` and fill secrets.
2. Install deps: `pnpm install`.
3. Start dev server: `pnpm dev` (runs Vite + Pages Functions).
4. Visit http://localhost:8788.

### Simulating services
- **KV**: wrangler provides in‑memory KV during `pages dev`.
- **Stripe**: use test mode in dashboard; set webhook endpoint to `/api/stripe-webhook`.
- **Gemini**: requires real API key from Google AI Studio.

## Environment Variables
| name | description |
|------|-------------|
| `GEMINI_API_KEY` | Google Generative Language API key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_PRICE_ID_10` | Price ID selling 10 credits |
| `STRIPE_PRICE_ID_50` | Price ID selling 50 credits |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |

KV Binding: create namespace `CREDITS_KV` and bind in Pages project.

## Deployment
1. Push repo to GitHub and connect to Cloudflare Pages.
2. In Pages project settings:
   - Build command: `pnpm build`.
   - Build output: `dist`.
   - Add environment variables above.
   - Bind KV namespace `CREDITS_KV`.
3. Set Stripe webhook to `https://<your-domain>/api/stripe-webhook`.

## Troubleshooting
- **402 from /api/edit**: no credits; buy via Stripe.
- **Webhook 400**: check `STRIPE_WEBHOOK_SECRET`.
- **Image too large**: must be <10MB and `image/*` MIME type.

## Testing
Minimal script: after `pnpm dev` run, visit UI, buy credits using Stripe test card `4242 4242 4242 4242`, upload an image and prompt, verify result downloads.

## Future Work
- Store original/edited images in R2.
- Persist transactions in D1.
- Durable Objects for rate limiting.

---
# Cloudflare Pages 上的图像编辑器

一个使用 Google 的 Gemini 模型的多语言图像编辑 Web 应用。用户通过 Stripe Checkout 购买积分，每次编辑消耗一个积分。该应用完全运行在 **Cloudflare Pages** 上，并使用 Pages Functions。

## 功能
- 上传图像和可选提示，通过 `gemini-2.5-flash-image-preview` 完成编辑。
- 预览并下载编辑后的 PNG。
- 匿名用户通过 `uid` cookie 标识；积分存储在 KV 中。
- Stripe Checkout 销售 10 或 50 积分套餐；webhook 用于增加积分。
- 支持国际化（英语/日语/中文），可自动检测并手动切换。
- 使用 Tailwind UI、TypeScript 严格模式、ESLint + Prettier。
- 为未来的 R2/D1 扩展进行设计。

## 技术栈
```
Browser --fetch--> Cloudflare Pages ----> Google Gemini API
          |                    |\
          |                    | \--> Stripe API / Webhooks
          |                    \--> KV (credits)
```

## 本地开发
1. `cp .env.sample .env` 并填写密钥。
2. 安装依赖：`pnpm install`。
3. 启动开发服务器：`pnpm dev`（运行 Vite + Pages Functions）。
4. 访问 http://localhost:8788。

### 模拟服务
- **KV**：`pages dev` 期间 wrangler 提供内存 KV。
- **Stripe**：在仪表板中使用测试模式；将 webhook 端点设为 `/api/stripe-webhook`。
- **Gemini**：需要来自 Google AI Studio 的真实 API 密钥。

## 环境变量
| 名称 | 描述 |
|------|------|
| `GEMINI_API_KEY` | Google Generative Language API key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_PRICE_ID_10` | 10 积分价格 ID |
| `STRIPE_PRICE_ID_50` | 50 积分价格 ID |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook 签名密钥 |

KV 绑定：创建命名空间 `CREDITS_KV` 并在 Pages 项目中绑定。

## 部署
1. 将仓库推送到 GitHub 并连接到 Cloudflare Pages。
2. 在 Pages 项目设置中：
   - 构建命令：`pnpm build`。
   - 构建输出：`dist`。
   - 添加上述环境变量。
   - 绑定 KV 命名空间 `CREDITS_KV`。
3. 将 Stripe webhook 设置为 `https://<your-domain>/api/stripe-webhook`。

## 常见问题
- **从 /api/edit 返回 402**：没有积分；请通过 Stripe 购买。
- **Webhook 返回 400**：检查 `STRIPE_WEBHOOK_SECRET`。
- **图像过大**：必须小于 10MB 且 MIME 类型为 `image/*`。

## 测试
简易脚本：在运行 `pnpm dev` 后访问界面，使用 Stripe 测试卡 `4242 4242 4242 4242` 购买积分，上传图像和提示，验证结果可以下载。

## 后续工作
- 在 R2 中存储原始和编辑后的图像。
- 在 D1 中持久化交易记录。
- 使用 Durable Objects 进行限流。

