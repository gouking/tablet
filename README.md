# 牌位打印系統 — Tablet Printing System

全端雲端牌位管理系統，支援多分院、線上存取。

## 技術架構

| 層級 | 技術 |
|------|------|
| 前端 | React 18 + Vite + TailwindCSS |
| 後端 | Node.js + Express |
| 資料庫 | PostgreSQL + Prisma ORM |
| PDF 產生 | PDFKit |
| 認證 | JWT + bcrypt |
| 部署 | Docker Compose（可部署至 Railway / Render / VPS） |

## 功能模組

- **認證系統** — 多寺院帳號、角色權限（管理員 / 一般用戶）
- **牌位登記** — 完整表單、即時預覽
- **牌位管理** — 搜尋、篩選、編輯、刪除
- **PDF 打印** — 精確排版、單張/批次匯出
- **統計報表** — 月報、類型分析
- **多分院** — 一套系統管理多個寺院

## 快速啟動

```bash
# 後端
cd backend
cp .env.example .env   # 填入資料庫連線字串
npm install
npx prisma migrate dev
npm run dev

# 前端
cd frontend
npm install
npm run dev
```

## 目錄結構

```
tablet-system/
├── backend/
│   ├── src/
│   │   ├── routes/        # API 路由
│   │   ├── models/        # 資料模型邏輯
│   │   ├── middleware/    # 認證、錯誤處理
│   │   └── utils/         # PDF 產生、工具函式
│   ├── prisma/
│   │   └── schema.prisma  # 資料庫結構定義
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # 共用元件
│   │   ├── pages/         # 頁面元件
│   │   ├── hooks/         # 自訂 React hooks
│   │   └── utils/         # API client 等
│   └── package.json
└── docker-compose.yml
```
