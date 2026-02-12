# 開発手順書: 祇園だいきち牧場 LP

## 前提条件

- Node.js 20.x 以上
- npm または pnpm
- microCMS アカウント（サービス作成済み）
- Cloudflare アカウント

---

## Phase 1: Astro プロジェクト初期化

### 1-1. プロジェクト作成

```bash
# 既存ディレクトリで Astro を初期化
npm create astro@latest . -- --template minimal --typescript strict

# microCMS SDK インストール
npm install microcms-js-sdk
```

> **注意**: 本プロジェクトは SSG（静的サイト生成）のため、Cloudflare アダプタ（SSR用）は不要です。
> Astro のデフォルト `output: 'static'` のまま使用し、ビルド成果物（`dist/`）を Cloudflare Pages にデプロイします。

### 1-2. 環境変数設定

```bash
# .env ファイル作成（.gitignore に追加済みであること）
touch .env
```

```env
MICROCMS_SERVICE_DOMAIN=your-service-domain
MICROCMS_API_KEY=your-api-key
```

### 1-3. TypeScript 設定確認

`tsconfig.json` で strict モードが有効であることを確認。

---

## Phase 2: microCMS セットアップ

### 2-1. API 作成（microCMS 管理画面）

以下の順で API を作成する。詳細は [API_SPEC.md](./API_SPEC.md) を参照。

| 順番 | API ID | 型 | 作成後の確認 |
|---|---|---|---|
| 1 | `hero` | オブジェクト | スライド画像を登録 |
| 2 | `catchcopy` | オブジェクト | 日英テキストを登録 |
| 3 | `about` | オブジェクト | 画像+日英テキストを登録 |
| 4 | `menu-items` | リスト | メニュー4品を登録 |
| 5 | `store-info` | オブジェクト | 店舗情報を登録 |
| 6 | `footer` | オブジェクト | SNSリンクを登録 |

### 2-2. コンテンツ投入

現在の HTML から各 API にコンテンツを移行する。

**画像のアップロード手順:**

1. `images/` 配下の画像を microCMS メディアにアップロード
2. 各 API のフィールドに画像を設定
3. ロゴ（`logo.webp`, `logo-footer.webp`）は `public/images/` に残す

### 2-3. API 疎通確認

```bash
# curl で確認（API キーを設定）
curl "https://YOUR_DOMAIN.microcms.io/api/v1/catchcopy" \
  -H "X-MICROCMS-API-KEY: YOUR_API_KEY"
```

---

## Phase 3: Astro 実装

### 3-1. 依存関係図

```
Step 0: 基盤（順次実行・必須）
─────────────────────────────────────────────────────
  microcms.ts ──→ global.css ──→ Layout.astro
  （型定義）       （CSS変数）      （共通レイアウト）

Step 1: コンポーネント（並列実行可能）
─────────────────────────────────────────────────────
  ┌─ Agent A: Header.astro + NavPanel.astro
  │    依存: Layout.astro, microcms.ts（型のみ）
  │    担当: ヘッダーナビ、言語切替、ハンバーガーメニュー
  │
  ├─ Agent B: Hero.astro + Catchcopy.astro
  │    依存: Layout.astro, microcms.ts（HeroResponse, CatchcopyResponse）
  │    担当: スライダー、キャッチコピー
  │
  ├─ Agent C: About.astro + MenuItem.astro + Menu.astro
  │    依存: Layout.astro, microcms.ts（AboutResponse, MenuItem）
  │    担当: About セクション、メニュー一覧
  │
  └─ Agent D: StoreInfo.astro + Footer.astro
       依存: Layout.astro, microcms.ts（StoreInfoResponse, FooterResponse）
       担当: 店舗情報、フッター（住所TELはstore-info共用）

Step 2: ページ統合（順次実行・Step 1 完了後）
─────────────────────────────────────────────────────
  pages/index.astro ──→ pages/en/index.astro
  （日本語版）            （英語版）
```

### 3-2. Agent Team 構成

| Agent | 役割 | 担当ファイル | 依存先 |
|---|---|---|---|
| **Lead** | 基盤構築 + 統合 | microcms.ts, global.css, Layout.astro, pages/* | なし |
| **Agent A** | ナビゲーション | Header.astro, NavPanel.astro | Step 0 完了 |
| **Agent B** | ファーストビュー | Hero.astro, Catchcopy.astro | Step 0 完了 |
| **Agent C** | コンテンツ | About.astro, MenuItem.astro, Menu.astro | Step 0 完了 |
| **Agent D** | 情報・フッター | StoreInfo.astro, Footer.astro | Step 0 完了 |

### 3-3. 実行フロー

```
[Lead] Step 0: 基盤構築
  │
  ├── microcms.ts を作成（型定義・ヘルパー関数）
  ├── global.css を作成（リセット・CSS変数）
  ├── Layout.astro を作成（共通レイアウト）
  └── commit + push
  │
  ▼ Step 0 完了 → Agent A〜D を並列起動
  │
  ├── [Agent A] Header + NavPanel を実装 → commit
  ├── [Agent B] Hero + Catchcopy を実装 → commit
  ├── [Agent C] About + MenuItem + Menu を実装 → commit
  └── [Agent D] StoreInfo + Footer を実装 → commit
  │
  ▼ 全 Agent 完了 → Lead が差分確認・マージ
  │
[Lead] Step 2: ページ統合
  │
  ├── pages/index.astro（日本語版）を作成
  ├── pages/en/index.astro（英語版）を作成
  ├── ローカルで全体動作確認
  └── commit + push
```

### 3-4. 並列開発ルール

- 各 Agent は担当ファイルのみ編集する（ファイル競合を防止）
- `microcms.ts` の型・ヘルパーは Lead が管理し、Agent は参照のみ
- 各 Agent は実装完了後に単体で動作確認可能な状態にする
- マージ前に Lead が差分を確認する（CLAUDE.md の Git 運用ルールに準拠）

### 3-5. 各コンポーネントの実装方針

**共通:**
- 全コンポーネントは `lang: "ja" | "en"` prop を受け取る
- microCMS データは pages で取得し、props でコンポーネントに渡す
- CSS は Astro scoped style（`<style>` タグ）で記述
- 現行 HTML の CSS を移植（デザイン踏襲）

**データ取得パターン（Promise.all で並列取得）:**
```astro
---
// pages/index.astro で一括並列取得（ビルド時間短縮）
import { client } from "../lib/microcms";
import type {
  SiteMetaResponse, HeroResponse, CatchcopyResponse,
  AboutResponse, MenuItem, StoreInfoResponse, FooterResponse
} from "../lib/microcms";

const [siteMeta, hero, catchcopy, about, recommended, collaboration, storeInfo, footer] =
  await Promise.all([
    client.get<SiteMetaResponse>({ endpoint: "site-meta" }),
    client.get<HeroResponse>({ endpoint: "hero" }),
    client.get<CatchcopyResponse>({ endpoint: "catchcopy" }),
    client.get<AboutResponse>({ endpoint: "about" }),
    client.getList<MenuItem>({ endpoint: "menu-items", queries: { filters: "category[equals]recommended", orders: "sortOrder" } }),
    client.getList<MenuItem>({ endpoint: "menu-items", queries: { filters: "category[equals]collaboration", orders: "sortOrder" } }),
    client.get<StoreInfoResponse>({ endpoint: "store-info" }),
    client.get<FooterResponse>({ endpoint: "footer" }),
  ]);
---
```

> **注意**: microCMS API がダウンしている場合、ビルドは失敗します。
> Cloudflare Pages はビルド失敗時に前回成功時のデプロイを維持するため、サイトが表示されなくなることはありません。

### 3-3. ローカル開発

```bash
# 開発サーバー起動
npm run dev

# ブラウザで確認
# 日本語: http://localhost:4321/
# 英語:   http://localhost:4321/en/
```

---

## Phase 4: デプロイ設定

### 4-1. Cloudflare Pages 設定

1. Cloudflare Dashboard → Pages → Create a project
2. Git リポジトリを接続
3. ビルド設定:

| 項目 | 値 |
|---|---|
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node.js version | `20` |

4. 環境変数を設定:
   - `MICROCMS_SERVICE_DOMAIN`
   - `MICROCMS_API_KEY`

### 4-2. Webhook 設定（自動デプロイ）

1. Cloudflare Pages → Settings → Builds & deployments → Deploy hooks
2. Deploy Hook URL を生成
3. microCMS → API 設定 → Webhook に URL を登録
4. トリガー: コンテンツの「作成」「更新」「削除」

> **セキュリティ注意**: Deploy Hook URL が漏洩すると第三者がビルドをトリガーできます。
> URL は環境変数やシークレット管理で扱い、外部に公開しないでください。

### 4-3. カスタムドメイン設定

1. Cloudflare Pages → Custom domains
2. `1129kyoto.jp` を追加
3. DNS レコードを設定

---

## Phase 5: テスト・確認

### 5-1. 表示確認チェックリスト

- [ ] 日本語版（`/`）の全セクションが正しく表示される
- [ ] 英語版（`/en/`）の全セクションが正しく表示される
- [ ] 言語切替リンクが正しく動作する
- [ ] ハンバーガーメニューが開閉する
- [ ] ヒーロースライダーが自動切替する
- [ ] スムーズスクロールが動作する
- [ ] 全外部リンクが正しいURLで開く
- [ ] Google Map が表示される
- [ ] SP（768px以下）でレイアウトが崩れない

### 5-2. パフォーマンス確認

```bash
# Lighthouse CI（ローカル）
npx lighthouse http://localhost:4321/ --output=json
```

目標:
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

### 5-3. microCMS 更新テスト

1. microCMS でテキストを変更
2. Webhook が発火し、Cloudflare Pages でリビルドが実行される
3. 本番サイトに変更が反映されることを確認

---

## トラブルシューティング

### ビルドエラー: microCMS API 接続失敗

```
Error: fetch failed
```

→ 環境変数 `MICROCMS_SERVICE_DOMAIN` と `MICROCMS_API_KEY` が正しく設定されているか確認。

### 画像が表示されない

→ microCMS の画像 URL が HTTPS であること、CORS 設定を確認。

### Webhook が発火しない

→ microCMS Webhook 設定で対象 API とトリガーイベントが正しく設定されているか確認。

---

## コマンド一覧

| コマンド | 用途 |
|---|---|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | プロダクションビルド |
| `npm run preview` | ビルド結果のプレビュー |
| `npx astro check` | TypeScript 型チェック |
