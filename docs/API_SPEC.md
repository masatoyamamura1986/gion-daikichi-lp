# API_SPEC: microCMS スキーマ設計

## 概要

microCMS で管理する API の一覧とフィールド定義。
全テキストフィールドは `_ja` / `_en` サフィックスで多言語対応する。

**無料プラン制約により API を 2 つに統合（旧 7 API → 新 2 API）。**

---

## API 一覧

| API ID | 表示名 | 型 | 用途 |
|---|---|---|---|
| `site-data` | サイトデータ | オブジェクト型 | SEO・ヒーロー・キャッチコピー・About・店舗情報・フッター（旧6APIを統合） |
| `menu-items` | メニュー | リスト型 | メニュー一覧 |

## CMS 管理対象外（コードにハードコード）

以下はコード内で管理し、microCMS では扱わない。

- ナビリンクテキスト（「トップ」「お品書き」/ "Top", "Menu" 等）
- セクション見出し（「お品書き」/ "Menu"、「店舗情報」/ "Store Information"）
- メニューカテゴリ見出し（「おすすめ料理」/ "Top 3 Recommended Dishes" 等）
- コピーライト文
- ロゴ画像（`public/images/` で管理）

---

## 1. site-data（オブジェクト型）

旧 site-meta・hero・catchcopy・about・store-info・footer を1つに統合。
全フィールドがフラットに並ぶ。

### SEO メタ情報（旧 site-meta）

| フィールド ID | 表示名 | 種類 | 必須 | 説明 |
|---|---|---|---|---|
| `title_ja` | SEO タイトル（日） | テキスト | Yes | `<title>` タグ |
| `title_en` | SEO タイトル（英） | テキスト | Yes | `<title>` tag |
| `description_ja` | SEO ディスクリプション（日） | テキストエリア | Yes | meta description |
| `description_en` | SEO ディスクリプション（英） | テキストエリア | Yes | meta description |
| `ogImage` | OGP 画像 | 画像 | Yes | og:image / twitter:image |

### ヒーロー（旧 hero）

| フィールド ID | 表示名 | 種類 | 必須 | 説明 |
|---|---|---|---|---|
| `slides` | ヒーロースライド | 繰り返し | Yes | スライドショー画像（複数） |
| `slides.image` | 画像 | 画像 | Yes | スライド画像 |
| `slides.alt_ja` | ALT（日本語） | テキスト | Yes | 画像の代替テキスト |
| `slides.alt_en` | ALT（英語） | テキスト | Yes | 画像の代替テキスト |

### キャッチコピー（旧 catchcopy）

| フィールド ID | 表示名 | 種類 | 必須 | 説明 |
|---|---|---|---|---|
| `mainCopy_ja` | メインコピー（日） | テキスト | Yes | メインキャッチコピー |
| `mainCopy_en` | メインコピー（英） | テキスト | Yes | Main catchcopy |
| `subCopy_ja` | サブコピー（日） | テキスト | Yes | サブキャッチコピー |
| `subCopy_en` | サブコピー（英） | テキスト | Yes | Sub catchcopy |

### About（旧 about）

| フィールド ID | 表示名 | 種類 | 必須 | 説明 |
|---|---|---|---|---|
| `image` | About 外観画像 | 画像 | Yes | 店舗外観写真 |
| `imageAlt_ja` | About 画像ALT（日） | テキスト | Yes | 画像の代替テキスト |
| `imageAlt_en` | About 画像ALT（英） | テキスト | Yes | Image alt text |
| `heading_ja` | About 見出し（日） | テキスト | Yes | セクション見出し |
| `heading_en` | About 見出し（英） | テキスト | Yes | Section heading |
| `body_ja` | About 説明文（日） | テキストエリア | Yes | 説明文 |
| `body_en` | About 説明文（英） | テキストエリア | Yes | Description |
| `links` | About リンク | 繰り返し | Yes | 外部リンクボタン |
| `links.label_ja` | ラベル（日） | テキスト | Yes | ボタンラベル |
| `links.label_en` | ラベル（英） | テキスト | Yes | Button label |
| `links.url_ja` | URL（日） | テキスト | Yes | 日本語版リンク先 |
| `links.url_en` | URL（英） | テキスト | Yes | 英語版リンク先 |

> **注意**: リンクURLは日英で異なるサイトを指すため `url_ja` / `url_en` で分離。
> Astro 側で URL 出力時にプロトコルチェック（`http://` or `https://` のみ許可）を行うこと。

### 店舗情報（旧 store-info）

| フィールド ID | 表示名 | 種類 | 必須 | 説明 |
|---|---|---|---|---|
| `interiorImages` | 内観画像 | 繰り返し | Yes | 内観写真（複数） |
| `interiorImages.image` | 画像 | 画像 | Yes | 内観画像 |
| `interiorImages.alt_ja` | ALT（日） | テキスト | Yes | 代替テキスト |
| `interiorImages.alt_en` | ALT（英） | テキスト | Yes | Alt text |
| `address_ja` | 住所（日） | テキスト | Yes | 日本語住所 |
| `address_en` | 住所（英） | テキスト | Yes | English address |
| `postalCode` | 郵便番号 | テキスト | Yes | 605-0074 |
| `tel` | 電話番号 | テキスト | Yes | 075-746-4129 |
| `hours_ja` | 営業時間（日） | テキスト | Yes | 11:00〜15:00、17:00〜20:00 |
| `hours_en` | 営業時間（英） | テキスト | Yes | 11:00 – 15:00, 17:00 – 20:00 |
| `closedDay_ja` | 定休日（日） | テキスト | Yes | 日曜日 |
| `closedDay_en` | 定休日（英） | テキスト | Yes | Sundays |
| `payment_ja` | お支払い（日） | テキスト | No | ※確認中 |
| `payment_en` | お支払い（英） | テキスト | No | TBD |
| `reservation_ja` | 予約（日） | テキスト | Yes | 承っておりません |
| `reservation_en` | 予約（英） | テキスト | Yes | Unavailable |
| `mapEmbedUrl` | Google Map URL | テキスト | Yes | iframe src 用の完全URL |
| `affiliatedUrl` | 系列店舗 URL | テキスト | No | 系列店舗リンク |

### フッター（旧 footer）

| フィールド ID | 表示名 | 種類 | 必須 | 説明 |
|---|---|---|---|---|
| `snsLinks` | SNS リンク | 繰り返し | Yes | SNS リンク一覧 |
| `snsLinks.platform` | プラットフォーム | セレクト（単一） | Yes | `instagram` / `tiktok` / `youtube` |
| `snsLinks.url` | URL | テキスト | Yes | SNS プロフィール URL |
| `otherMenuUrl` | その他メニュー URL | テキスト | No | メニューセクションの「その他のメニュー」リンク |

### レスポンス例

```json
{
  "title_ja": "祇園だいきち牧場 | 祇園で味わうA5近江牛",
  "title_en": "Gion Daikichi Ranch | A5 Omi Beef in Gion, Kyoto",
  "description_ja": "祇園だいきち牧場は...",
  "description_en": "Gion Daikichi Ranch is...",
  "ogImage": { "url": "https://images.microcms-assets.io/...", "width": 1200, "height": 630 },
  "slides": [
    { "image": { "url": "..." }, "alt_ja": "...", "alt_en": "..." }
  ],
  "mainCopy_ja": "祇園で味わう、里山育ちのA5近江牛",
  "mainCopy_en": "A5 Omi Beef Raised in the Satoyama, Savored in Gion",
  "subCopy_ja": "...",
  "subCopy_en": "...",
  "image": { "url": "..." },
  "imageAlt_ja": "祇園だいきち牧場 外観",
  "heading_ja": "祇園だいきち牧場について",
  "body_ja": "...",
  "links": [{ "label_ja": "...", "url_ja": "...", "label_en": "...", "url_en": "..." }],
  "interiorImages": [{ "image": { "url": "..." }, "alt_ja": "...", "alt_en": "..." }],
  "address_ja": "京都府京都市東山区祇園町南側528番地6",
  "postalCode": "605-0074",
  "tel": "075-746-4129",
  "hours_ja": "11:00〜15:00、17:00〜20:00",
  "closedDay_ja": "日曜日",
  "reservation_ja": "承っておりません",
  "mapEmbedUrl": "https://www.google.com/maps?q=...&output=embed",
  "snsLinks": [{ "platform": "instagram", "url": "https://..." }],
  "otherMenuUrl": null
}
```

---

## 2. menu-items（リスト型）

メニューアイテム一覧。

| フィールド ID | 表示名 | 種類 | 必須 | 説明 |
|---|---|---|---|---|
| `image` | 料理画像 | 画像 | Yes | 料理写真 |
| `name_ja` | 料理名（日） | テキスト | Yes | 料理名（alt テキストとしても使用） |
| `name_en` | 料理名（英） | テキスト | Yes | Dish name (also used as alt text) |
| `price` | 価格 | 数値 | Yes | 税込価格（円）。表示時にフォーマット |
| `description_ja` | 説明（日） | テキストエリア | Yes | 料理説明 |
| `description_en` | 説明（英） | テキストエリア | Yes | Dish description |
| `movieUrl` | 動画 URL | テキスト | No | Instagram Reel 等の動画リンク |
| `category` | カテゴリ | セレクト（単一） | Yes | `recommended` or `collaboration` |
| `collabLabel_ja` | コラボ先名（日） | テキスト | No | コラボ先の表示名 |
| `collabLabel_en` | コラボ先名（英） | テキスト | No | Collaboration partner name |
| `collaborationUrl` | コラボ先 URL | テキスト | No | コラボ先リンク |
| `sortOrder` | 表示順 | 数値 | Yes | 表示順（昇順） |

### カテゴリ選択肢（単一選択）

| 値 | 表示名 |
|---|---|
| `recommended` | おすすめ料理 |
| `collaboration` | コラボメニュー |

### 価格表示フォーマット

`price` は数値（例: `5455`）で保存。表示時にフロントエンドでフォーマットする。

```typescript
function formatPrice(price: number, lang: "ja" | "en"): string {
  const formatted = price.toLocaleString("ja-JP");
  return lang === "ja"
    ? `¥${formatted}（税込）`
    : `¥${formatted} (tax included)`;
}
// formatPrice(5455, "ja") → "¥5,455（税込）"
// formatPrice(5455, "en") → "¥5,455 (tax included)"
```

### 画像 alt テキスト

料理画像の alt テキストには `name_ja` / `name_en` を使用する（別途 alt フィールドは設けない）。

### レスポンス例

```json
{
  "contents": [
    {
      "id": "hitsumabushi",
      "image": { "url": "https://images.microcms-assets.io/..." },
      "name_ja": "近江だいきち牛 ひつまぶし（ロース1.5倍）",
      "name_en": "Omi Daikichi Beef Hitsumabushi — 1.5 Times Loin",
      "price": 5455,
      "description_ja": "だいきち近江牛を焼き上げた名物ひつまぶしで...",
      "description_en": "Our signature hitsumabushi features grilled Daikichi Omi beef...",
      "movieUrl": "https://www.instagram.com/reel/DRn6065jwec/?hl=ja",
      "category": "recommended",
      "sortOrder": 1
    },
    {
      "id": "sukiyaki-curry-udon",
      "image": { "url": "https://images.microcms-assets.io/..." },
      "name_ja": "近江だいきち牛すきやきカレーうどん",
      "name_en": "Omi Daikichi Beef Sukiyaki Curry Udon",
      "price": 2500,
      "description_ja": "昆布と鰹の旨味を引き出した...",
      "description_en": "\"Kyoto Curry Udon\" is finished as...",
      "movieUrl": null,
      "category": "collaboration",
      "collabLabel_ja": "祇園味味香",
      "collabLabel_en": "Gion Mimiko",
      "collaborationUrl": "https://mimikou.jp/kyoto-curry-udon-flavor/",
      "sortOrder": 1
    }
  ],
  "totalCount": 4
}
```

### クエリ例

```
# おすすめ料理を取得（表示順）
GET /api/v1/menu-items?filters=category[equals]recommended&orders=sortOrder

# コラボメニューを取得（表示順）
GET /api/v1/menu-items?filters=category[equals]collaboration&orders=sortOrder
```

---

## microCMS クライアント実装

### 型定義（`src/lib/microcms.ts`）

```typescript
// 個別セクション型（コンポーネントの Props 互換用に残す）
export interface SiteMetaResponse { ... }
export interface HeroResponse { ... }
export interface CatchcopyResponse { ... }
export interface AboutResponse { ... }
export interface StoreInfoResponse { ... }
export interface FooterResponse { ... }

// 統合型: site-data エンドポイント（6型の intersection）
export type SiteDataResponse = SiteMetaResponse &
  HeroResponse &
  CatchcopyResponse &
  AboutResponse &
  StoreInfoResponse &
  FooterResponse;
```

---

## API 呼び出し例

```typescript
// ビルド時にデータ取得（pages/index.astro）
const [siteData, recommended, collaboration] = await Promise.all([
  client.get<SiteDataResponse>({ endpoint: "site-data" }),
  client.getList<MenuItem>({
    endpoint: "menu-items",
    queries: { filters: "category[equals]recommended", orders: "sortOrder" },
  }),
  client.getList<MenuItem>({
    endpoint: "menu-items",
    queries: { filters: "category[equals]collaboration", orders: "sortOrder" },
  }),
]);

// siteData は全セクションのデータを含む
// 構造的部分型により、各コンポーネントにそのまま渡せる
// 例: <About data={siteData} />  ← AboutResponse 互換
// 例: <Footer storeInfo={siteData} footer={siteData} />
```
