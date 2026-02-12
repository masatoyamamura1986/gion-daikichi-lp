# CLAUDE.md - 祇園だいきち牧場 LP

## プロジェクト概要

祇園だいきち牧場のランディングページ。Astro + Cloudflare Pages + microCMS で構築。
日本語（`/`）と英語（`/en/`）の2言語対応。

## 技術スタック

- **Astro 5.x** - SSG フレームワーク
- **TypeScript** - strict モード
- **microCMS** - ヘッドレス CMS（テキスト・画像管理）
- **Cloudflare Pages** - ホスティング

## ドキュメント

実装前に以下を必ず参照:

- `docs/PRD.md` - 要件定義
- `docs/ARCHITECTURE.md` - 技術構成・ディレクトリ構造
- `docs/API_SPEC.md` - microCMS API スキーマ・型定義
- `docs/DEVELOPMENT_GUIDE.md` - 開発手順書

## コーディング規約

### TypeScript

- `any` 禁止、strict モード必須
- microCMS の型は `src/lib/microcms.ts` に集約
- `import.meta.env` で環境変数にアクセス

### Astro コンポーネント

- 全コンポーネントは `lang: "ja" | "en"` prop を受け取る
- データ取得は pages（`src/pages/`）で行い、components には props で渡す
- CSS は Astro scoped style を使用
- 1コンポーネント 200行以内目安

### 多言語対応

- microCMS フィールドは `_ja` / `_en` サフィックスで管理
- `localized()` ヘルパーで言語別テキスト取得
- 使い方: `localized(data, "fieldName", lang)`

### CSS

- デザイントークン:
  - テキスト色: `#585858`
  - 背景色: `#FFFFFF`（メイン）、`#F7F7F7`（About セクション）
  - ボーダー: `#E8E8E8`
- 日本語フォント: `'Noto Serif JP', serif`
- 英語フォント: `'Cormorant Garamond', 'Noto Serif JP', serif`
- ブレークポイント: `768px`（SP）

## ディレクトリ構造

```
src/
├── components/    # UI コンポーネント（.astro）
├── layouts/       # 共通レイアウト
├── lib/           # microCMS クライアント・型定義
├── pages/         # ルーティング（/ と /en/）
└── styles/        # グローバル CSS
public/images/     # 静的画像（ロゴのみ）
```

## 開発コマンド

```bash
npm run dev       # 開発サーバー（localhost:4321）
npm run build     # ビルド
npm run preview   # ビルド結果プレビュー
npx astro check   # 型チェック
```

## 環境変数（.env）

```
MICROCMS_SERVICE_DOMAIN=xxx
MICROCMS_API_KEY=xxx
```

**注意: `.env` は絶対にコミットしない。**

## microCMS API 一覧

| API ID | 型 | 用途 |
|---|---|---|
| `site-meta` | オブジェクト | SEO メタ情報・OGP |
| `hero` | オブジェクト | ヒーロースライダー |
| `catchcopy` | オブジェクト | キャッチコピー |
| `about` | オブジェクト | About セクション |
| `menu-items` | リスト | メニュー一覧（category: recommended / collaboration） |
| `store-info` | オブジェクト | 店舗情報 + フッター住所・TEL |
| `footer` | オブジェクト | SNS リンク・その他メニューURL |

## ヘルパー関数

- `localized(obj, field, lang)` - 言語別テキスト取得
- `formatPrice(price, lang)` - 価格表示フォーマット
- `isSafeUrl(url)` - URL プロトコルチェック

## 禁止事項

- `console.log` のコミット
- 未使用 import の放置
- `any` 型の使用
- `.env` ファイルのコミット
- microCMS API キーのハードコード
- 画像の直接 URL 埋め込み（必ず microCMS 経由）
- CMS 由来の URL を未検証で `href` に出力（`isSafeUrl()` でチェック）

## Git運用ルール

- Trunk-Based Development を採用
- main に直接こまめに commit + push
- ローカルで確認後、本番デプロイ
- デプロイ後に軽く動作確認
- エラー対応は基本 Fix Forward（修正コードを書く）
- 本番影響がある緊急時のみ revert で一旦戻す
- 並列開発は agent team で対応、マージ前に差分確認
- reset は禁止

## Commit規則

- 1つの変更につき 1 commit
- メッセージは日本語で簡潔に（例:「ログインフォームを追加」）
