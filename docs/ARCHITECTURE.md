# ARCHITECTURE: 祇園だいきち牧場 LP

## 技術スタック

| カテゴリ | 技術 | バージョン | 用途 |
|---|---|---|---|
| フレームワーク | Astro | 5.x | SSG（静的サイト生成） |
| ホスティング | Cloudflare Pages | - | デプロイ・CDN配信 |
| CMS | microCMS | - | コンテンツ管理（テキスト・画像） |
| 言語 | TypeScript | 5.x | 型安全な開発 |
| CSS | Astro Scoped CSS | - | コンポーネントスコープCSS |

## ディレクトリ構造

```
gion-daikichi-lp/
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   └── API_SPEC.md
├── public/
│   └── images/              # 静的画像（ロゴ等、CMS管理外）
│       ├── logo.webp
│       └── logo-footer.webp
├── src/
│   ├── components/
│   │   ├── Header.astro         # ヘッダーナビ + 言語切替
│   │   ├── NavPanel.astro       # ハンバーガーメニューパネル
│   │   ├── Hero.astro           # ヒーロースライダー
│   │   ├── Catchcopy.astro      # キャッチコピー
│   │   ├── About.astro          # About セクション
│   │   ├── MenuItem.astro       # メニューアイテム（共通）
│   │   ├── Menu.astro           # メニューセクション
│   │   ├── StoreInfo.astro      # 店舗情報セクション
│   │   └── Footer.astro         # フッター
│   ├── layouts/
│   │   └── Layout.astro         # 共通レイアウト（head, meta, fonts）
│   ├── lib/
│   │   └── microcms.ts          # microCMS クライアント・型定義
│   ├── pages/
│   │   ├── index.astro          # 日本語版 LP
│   │   └── en/
│   │       └── index.astro      # 英語版 LP
│   └── styles/
│       └── global.css           # グローバルCSS（リセット, 共通変数）
├── astro.config.mjs
├── package.json
├── tsconfig.json
└── wrangler.toml                # Cloudflare Pages 設定（任意）
```

## アーキテクチャ図

```
┌──────────────┐    Webhook     ┌───────────────────┐
│   microCMS   │ ──────────────▶│  Cloudflare Pages │
│  (コンテンツ)  │                │    (ビルド実行)     │
└──────┬───────┘                └─────────┬─────────┘
       │                                  │
       │  API (ビルド時取得)                │  静的ファイル配信
       │                                  │
       ▼                                  ▼
┌──────────────┐                ┌───────────────────┐
│  Astro SSG   │ ──ビルド成果物──▶│     CDN Edge      │
│  (ビルド時)   │                │   (閲覧者に配信)    │
└──────────────┘                └───────────────────┘
```

## データフロー

1. **ビルド時**: Astro が microCMS API からコンテンツを取得
2. **ビルド**: コンテンツを埋め込んだ静的 HTML を生成
3. **配信**: Cloudflare Pages CDN から配信
4. **更新時**: microCMS でコンテンツ更新 → Webhook → 自動リビルド

## 多言語対応方針

### 方式: microCMS 多言語フィールド

各テキストフィールドに `_ja` / `_en` サフィックスを付与して管理する。

```
例: catchcopy API
├── mainCopy_ja: "祇園で味わう、里山育ちのA5近江牛"
├── mainCopy_en: "A5 Omi Beef Raised in the Satoyama, Savored in Gion"
├── subCopy_ja: "自社牧場で育てた近江だいきち牛を、..."
└── subCopy_en: "From our signature hitsumabushi to..."
```

### ページルーティング

| URL | ファイル | 言語 |
|---|---|---|
| `/` | `src/pages/index.astro` | `ja` |
| `/en/` | `src/pages/en/index.astro` | `en` |

各ページで `lang` prop を渡し、コンポーネント側で対応言語のフィールドを参照する。

```astro
---
// src/pages/index.astro
const lang = "ja";
---
<Layout lang={lang}>
  <Catchcopy lang={lang} />
  ...
</Layout>
```

```astro
---
// src/pages/en/index.astro
const lang = "en";
---
<Layout lang={lang}>
  <Catchcopy lang={lang} />
  ...
</Layout>
```

## コンポーネント設計

### Layout.astro

- `lang` prop に応じて `<html lang="ja">` / `<html lang="en">` を切替
- `site-meta` API のデータで meta タグ（title, description, OG）を言語別に設定
- `hreflang` の相互リンク（以下を必ず出力）

```html
<link rel="alternate" hreflang="ja" href="https://1129kyoto.jp/">
<link rel="alternate" hreflang="en" href="https://1129kyoto.jp/en/">
<link rel="alternate" hreflang="x-default" href="https://1129kyoto.jp/">
```

**フォント読み込み戦略（言語別出し分け）:**

| 言語 | 読み込むフォント | body の font-family |
|---|---|---|
| `ja` | Noto Serif JP のみ | `'Noto Serif JP', serif` |
| `en` | Cormorant Garamond + Noto Serif JP | `'Cormorant Garamond', 'Noto Serif JP', serif` |

```astro
---
const fontUrl = lang === "ja"
  ? "https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;500;600;700&display=swap"
  : "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Noto+Serif+JP:wght@400;500;600;700&display=swap";
---
<link href={fontUrl} rel="stylesheet">
```

### Hero.astro

- microCMS からスライド画像リスト取得
- クライアントサイド JS でスライダー動作（5秒間隔）

### MenuItem.astro

- 再利用可能な単一メニューアイテムコンポーネント
- props: `image`, `name`, `price`, `description`, `movieUrl`

## 画像管理方針

| 種別 | 管理場所 | 理由 |
|---|---|---|
| ロゴ | `public/images/` | 変更頻度が極めて低い |
| ヒーロー画像 | microCMS | 季節・キャンペーンで差替え可能性あり |
| 料理画像 | microCMS | メニュー変更時に画像も更新 |
| 内観・外観 | microCMS | リニューアル時に更新可能 |

microCMS の画像 API でリサイズ・フォーマット変換を活用。

```
https://images.microcms-assets.io/assets/xxx/yyy.webp?w=800&q=80
```

## デプロイ設定

### Cloudflare Pages

| 設定項目 | 値 |
|---|---|
| ビルドコマンド | `npm run build` |
| 出力ディレクトリ | `dist` |
| Node.js バージョン | 20.x |

### 環境変数

| 変数名 | 説明 |
|---|---|
| `MICROCMS_SERVICE_DOMAIN` | microCMS サービスドメイン |
| `MICROCMS_API_KEY` | microCMS API キー |

### Webhook（自動デプロイ）

microCMS の Webhook 設定で、コンテンツ更新時に Cloudflare Pages の Deploy Hook URL を呼び出す。

## データ共有方針

フッターで表示する住所・TEL は `store-info` API のデータを再利用する。

```astro
---
// pages/index.astro
// storeInfo を Footer コンポーネントにも渡す
---
<StoreInfo lang="ja" data={storeInfo} />
<Footer lang="ja" storeInfo={storeInfo} sns={footer} />
```

## セキュリティ対策

### URL 出力時のバリデーション

CMS から取得した URL を `href` に出力する際は、必ずプロトコルチェックを行う。

```typescript
import { isSafeUrl } from "../lib/microcms";

// テンプレート側
{isSafeUrl(link.url) && <a href={link.url}>...</a>}
```

### Google Maps 埋め込み

`store-info` API の `mapEmbedUrl` は完全な iframe URL として保存する。
`mapQuery` のようなパーツ入力ではなく、完全 URL を管理することで URL インジェクションを防止する。

## パフォーマンス最適化

- SSG による静的配信（TTFB 最小化）
- Cloudflare CDN のエッジキャッシュ
- 画像: microCMS 画像 API で WebP + リサイズ
- フォント: `font-display: swap` + `preconnect`、言語別出し分け
- CSS: Astro scoped CSS でコンポーネント単位の最小化
- API 呼び出し: `Promise.all` で全 API を並列取得
