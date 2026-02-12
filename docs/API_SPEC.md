# API_SPEC: microCMS スキーマ設計

## 概要

microCMS で管理する API の一覧とフィールド定義。
全テキストフィールドは `_ja` / `_en` サフィックスで多言語対応する。

---

## API 一覧

| API ID | 表示名 | 型 | 用途 |
|---|---|---|---|
| `site-meta` | サイト情報 | オブジェクト型 | SEO メタ情報・OGP |
| `hero` | ヒーロー | オブジェクト型 | ヒーローセクション |
| `catchcopy` | キャッチコピー | オブジェクト型 | キャッチコピーセクション |
| `about` | 当店について | オブジェクト型 | About セクション |
| `menu-items` | メニュー | リスト型 | メニュー一覧 |
| `store-info` | 店舗情報 | オブジェクト型 | 店舗情報セクション・フッター住所 |
| `footer` | フッター | オブジェクト型 | SNS リンク |

## CMS 管理対象外（コードにハードコード）

以下はコード内で管理し、microCMS では扱わない。

- ナビリンクテキスト（「トップ」「お品書き」/ "Top", "Menu" 等）
- セクション見出し（「お品書き」/ "Menu"、「店舗情報」/ "Store Information"）
- メニューカテゴリ見出し（「おすすめ料理」/ "Top 3 Recommended Dishes" 等）
- コピーライト文
- ロゴ画像（`public/images/` で管理）

---

## 1. site-meta（オブジェクト型）【NEW】

SEO メタ情報（title, description, OGP）。

| フィールド ID | 表示名 | 種類 | 必須 | 説明 |
|---|---|---|---|---|
| `title_ja` | ページタイトル（日） | テキスト | Yes | `<title>` タグ |
| `title_en` | ページタイトル（英） | テキスト | Yes | `<title>` tag |
| `description_ja` | ディスクリプション（日） | テキストエリア | Yes | meta description |
| `description_en` | ディスクリプション（英） | テキストエリア | Yes | meta description |
| `ogImage` | OGP 画像 | 画像 | Yes | og:image / twitter:image |

### レスポンス例

```json
{
  "title_ja": "祇園だいきち牧場 | 祇園で味わうA5近江牛",
  "title_en": "Gion Daikichi Ranch | A5 Omi Beef in Gion, Kyoto",
  "description_ja": "祇園だいきち牧場は、自社牧場で育てたA5ランク近江牛を祇園で楽しめるお店です。名物ひつまぶしやステーキ重、すき焼き御膳など、こだわりのメニューをご用意しています。",
  "description_en": "Gion Daikichi Ranch is a restaurant where you can enjoy A5-grade Omi beef raised on our own satoyama ranch. Enjoy our signature hitsumabushi, steak bowls, sukiyaki set meals, and more.",
  "ogImage": {
    "url": "https://images.microcms-assets.io/assets/.../og-image.webp",
    "width": 1200,
    "height": 630
  }
}
```

---

## 2. hero（オブジェクト型）

ヒーローセクションのスライド画像。

| フィールド ID | 表示名 | 種類 | 必須 | 説明 |
|---|---|---|---|---|
| `slides` | スライド画像 | 繰り返し | Yes | スライドショー画像（複数） |
| `slides.image` | 画像 | 画像 | Yes | スライド画像 |
| `slides.alt_ja` | ALT（日本語） | テキスト | Yes | 画像の代替テキスト |
| `slides.alt_en` | ALT（英語） | テキスト | Yes | 画像の代替テキスト |

### レスポンス例

```json
{
  "slides": [
    {
      "image": {
        "url": "https://images.microcms-assets.io/assets/.../hero1.webp",
        "width": 1920,
        "height": 1080
      },
      "alt_ja": "近江だいきち牛 ステーキ重",
      "alt_en": "Omi Daikichi Beef Steak Bowl"
    },
    {
      "image": {
        "url": "https://images.microcms-assets.io/assets/.../hero2.webp",
        "width": 1920,
        "height": 1080
      },
      "alt_ja": "近江だいきち牛 ひつまぶし",
      "alt_en": "Omi Daikichi Beef Hitsumabushi"
    }
  ]
}
```

---

## 3. catchcopy（オブジェクト型）

キャッチコピーセクション。

| フィールド ID | 表示名 | 種類 | 必須 | 説明 |
|---|---|---|---|---|
| `mainCopy_ja` | メインコピー（日） | テキスト | Yes | メインキャッチコピー |
| `mainCopy_en` | メインコピー（英） | テキスト | Yes | Main catchcopy |
| `subCopy_ja` | サブコピー（日） | テキスト | Yes | サブキャッチコピー |
| `subCopy_en` | サブコピー（英） | テキスト | Yes | Sub catchcopy |

### レスポンス例

```json
{
  "mainCopy_ja": "祇園で味わう、里山育ちのA5近江牛",
  "mainCopy_en": "A5 Omi Beef Raised in the Satoyama, Savored in Gion",
  "subCopy_ja": "自社牧場で育てた近江だいきち牛を、名物ひつまぶしから夜のコースまで",
  "subCopy_en": "From our signature hitsumabushi to evening course menus, enjoy Omi Daikichi Beef raised on our own ranch."
}
```

---

## 4. about（オブジェクト型）

About セクション。

| フィールド ID | 表示名 | 種類 | 必須 | 説明 |
|---|---|---|---|---|
| `image` | 外観画像 | 画像 | Yes | 店舗外観写真 |
| `imageAlt_ja` | 画像ALT（日） | テキスト | Yes | 画像の代替テキスト |
| `imageAlt_en` | 画像ALT（英） | テキスト | Yes | Image alt text |
| `heading_ja` | 見出し（日） | テキスト | Yes | セクション見出し |
| `heading_en` | 見出し（英） | テキスト | Yes | Section heading |
| `body_ja` | 説明文（日） | テキストエリア | Yes | 説明文 |
| `body_en` | 説明文（英） | テキストエリア | Yes | Description |
| `links` | リンクボタン | 繰り返し | Yes | 外部リンクボタン |
| `links.label_ja` | ラベル（日） | テキスト | Yes | ボタンラベル |
| `links.label_en` | ラベル（英） | テキスト | Yes | Button label |
| `links.url_ja` | URL（日） | テキスト | Yes | 日本語版リンク先 |
| `links.url_en` | URL（英） | テキスト | Yes | 英語版リンク先 |

> **注意**: リンクURLは日英で異なるサイトを指すため `url_ja` / `url_en` で分離。
> Astro 側で URL 出力時にプロトコルチェック（`http://` or `https://` のみ許可）を行うこと。

### レスポンス例

```json
{
  "image": {
    "url": "https://images.microcms-assets.io/assets/.../exterior.webp",
    "width": 800,
    "height": 1067
  },
  "imageAlt_ja": "祇園だいきち牧場 外観",
  "imageAlt_en": "Gion Daikichi Ranch Exterior",
  "heading_ja": "祇園だいきち牧場について",
  "heading_en": "Gion Daikichi Ranch",
  "body_ja": "祇園だいきち牧場は、里山の自社牧場で育てたA5ランク近江牛を楽しめるお店です。...",
  "body_en": "Gion Daikichi Ranch is a restaurant where you can enjoy A5-grade Omi beef raised on our own satoyama ranch. ...",
  "links": [
    {
      "label_ja": "大吉商店株式会社について",
      "label_en": "Daikichi Shoten Co., Ltd.",
      "url_ja": "http://1129.co.jp/company/",
      "url_en": "http://www.omibeef.asia/strongpoint/"
    },
    {
      "label_ja": "近江だいきち牛について",
      "label_en": "Omi Daikichi Beef",
      "url_ja": "https://daikichibeef.jp/farm",
      "url_en": "http://www.omibeef.asia/premium/"
    }
  ]
}
```

---

## 5. menu-items（リスト型）

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
| `collaborationLabel_ja` | コラボ先名（日） | テキスト | No | コラボ先の表示名 |
| `collaborationLabel_en` | コラボ先名（英） | テキスト | No | Collaboration partner name |
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
      "image": {
        "url": "https://images.microcms-assets.io/assets/.../hitsumabushi.webp",
        "width": 800,
        "height": 600
      },
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
      "image": {
        "url": "https://images.microcms-assets.io/assets/.../sukiyaki-udon.webp",
        "width": 800,
        "height": 600
      },
      "name_ja": "近江だいきち牛すきやきカレーうどん",
      "name_en": "Omi Daikichi Beef Sukiyaki Curry Udon",
      "price": 2500,
      "description_ja": "昆布と鰹の旨味を引き出した「旨みだし」に...",
      "description_en": "\"Kyoto Curry Udon\" is finished as a thick, glossy sauce...",
      "movieUrl": null,
      "category": "collaboration",
      "collaborationLabel_ja": "祇園味味香",
      "collaborationLabel_en": "Gion Mimiko",
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

## 6. store-info（オブジェクト型）

店舗情報セクション。フッターの住所・TEL もこの API から取得する。

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
| `mapEmbedUrl` | Google Map 埋め込みURL | テキスト | Yes | iframe src 用の完全URL |
| `affiliatedUrl` | 系列店舗 URL | テキスト | No | 系列店舗リンク |

> **変更点**:
> - `hours` → `hours_ja` / `hours_en` に分離（日英で記号が異なるため）
> - `mapQuery` → `mapEmbedUrl` に変更（URL インジェクション防止のため完全 URL を格納）
> - フッターの住所・TEL は本 API のデータを共用する（データ重複を避ける）

### レスポンス例

```json
{
  "interiorImages": [
    {
      "image": {
        "url": "https://images.microcms-assets.io/assets/.../interior-1f.webp",
        "width": 800,
        "height": 1067
      },
      "alt_ja": "祇園だいきち牧場 内観1F",
      "alt_en": "Gion Daikichi Ranch Interior 1F"
    }
  ],
  "address_ja": "京都府京都市東山区祇園町南側528番地6",
  "address_en": "528-6 Gionmachi Minamigawa, Higashiyama-ku, Kyoto-shi, Kyoto 605-0074, Japan",
  "postalCode": "605-0074",
  "tel": "075-746-4129",
  "hours_ja": "11:00〜15:00、17:00〜20:00",
  "hours_en": "11:00 – 15:00, 17:00 – 20:00",
  "closedDay_ja": "日曜日",
  "closedDay_en": "Sundays",
  "payment_ja": "※確認中",
  "payment_en": "TBD",
  "reservation_ja": "承っておりません",
  "reservation_en": "Unavailable",
  "mapEmbedUrl": "https://www.google.com/maps?q=528-6+Gionmachi+Minamigawa,+Higashiyama-ku,+Kyoto&output=embed",
  "affiliatedUrl": "https://daikichibeef.jp/shop"
}
```

---

## 7. footer（オブジェクト型）

フッターの SNS リンク・その他メニューリンク。

> **注意**: フッターの住所・TEL は `store-info` API から取得する。本 API には含めない（データ重複防止）。

| フィールド ID | 表示名 | 種類 | 必須 | 説明 |
|---|---|---|---|---|
| `snsLinks` | SNS リンク | 繰り返し | Yes | SNS リンク一覧 |
| `snsLinks.platform` | プラットフォーム | セレクト（単一） | Yes | `instagram` / `tiktok` / `youtube` |
| `snsLinks.url` | URL | テキスト | Yes | SNS プロフィール URL |
| `otherMenuUrl` | その他メニュー URL | テキスト | No | メニューセクションの「その他のメニュー」リンク（PDF 等） |

> **`otherMenuUrl` について**: メニューセクション内のボタンで使用するが、
> メニュー単体の API（リスト型）に含めるよりフッター API で一元管理する方が運用しやすいため、ここに配置する。

### プラットフォーム選択肢（単一選択）

| 値 | 表示名 |
|---|---|
| `instagram` | Instagram |
| `tiktok` | TikTok |
| `youtube` | YouTube |

### レスポンス例

```json
{
  "snsLinks": [
    {
      "platform": "instagram",
      "url": "https://www.instagram.com/gion.daikichibeef?igsh=a2FzNGtiY210aHhk"
    },
    {
      "platform": "tiktok",
      "url": "https://www.tiktok.com/@gion.daikichibeef?_r=1&_t=ZS-93UkS1kX9HR"
    },
    {
      "platform": "youtube",
      "url": "https://youtube.com/channel/UCylR4wY3H3f3yQqHagrWZjQ?si=tIQ2c3DS_SpcBdck"
    }
  ],
  "otherMenuUrl": null
}
```

---

## microCMS クライアント実装

### 型定義（`src/lib/microcms.ts`）

```typescript
import { createClient } from "microcms-js-sdk";
import type { MicroCMSImage, MicroCMSListContent } from "microcms-js-sdk";

// クライアント初期化
export const client = createClient({
  serviceDomain: import.meta.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: import.meta.env.MICROCMS_API_KEY,
});

// 型定義
export type Lang = "ja" | "en";

export interface SiteMetaResponse {
  title_ja: string;
  title_en: string;
  description_ja: string;
  description_en: string;
  ogImage: MicroCMSImage;
}

interface HeroSlide {
  image: MicroCMSImage;
  alt_ja: string;
  alt_en: string;
}

export interface HeroResponse {
  slides: HeroSlide[];
}

export interface CatchcopyResponse {
  mainCopy_ja: string;
  mainCopy_en: string;
  subCopy_ja: string;
  subCopy_en: string;
}

interface AboutLink {
  label_ja: string;
  label_en: string;
  url_ja: string;
  url_en: string;
}

export interface AboutResponse {
  image: MicroCMSImage;
  imageAlt_ja: string;
  imageAlt_en: string;
  heading_ja: string;
  heading_en: string;
  body_ja: string;
  body_en: string;
  links: AboutLink[];
}

export interface MenuItem extends MicroCMSListContent {
  image: MicroCMSImage;
  name_ja: string;
  name_en: string;
  price: number;
  description_ja: string;
  description_en: string;
  movieUrl?: string;
  category: "recommended" | "collaboration";
  collaborationLabel_ja?: string;
  collaborationLabel_en?: string;
  collaborationUrl?: string;
  sortOrder: number;
}

interface InteriorImage {
  image: MicroCMSImage;
  alt_ja: string;
  alt_en: string;
}

export interface StoreInfoResponse {
  interiorImages: InteriorImage[];
  address_ja: string;
  address_en: string;
  postalCode: string;
  tel: string;
  hours_ja: string;
  hours_en: string;
  closedDay_ja: string;
  closedDay_en: string;
  payment_ja?: string;
  payment_en?: string;
  reservation_ja: string;
  reservation_en: string;
  mapEmbedUrl: string;
  affiliatedUrl?: string;
}

interface SnsLink {
  platform: "instagram" | "tiktok" | "youtube";
  url: string;
}

export interface FooterResponse {
  snsLinks: SnsLink[];
  otherMenuUrl?: string;
}

// ヘルパー: 言語別フィールド取得（型安全）
export function localized<T extends Record<string, unknown>>(
  obj: T,
  field: string,
  lang: Lang,
): string {
  const key = `${field}_${lang}`;
  const value = obj[key];
  return typeof value === "string" ? value : "";
}

// ヘルパー: 価格フォーマット
export function formatPrice(price: number, lang: Lang): string {
  const formatted = price.toLocaleString("ja-JP");
  return lang === "ja"
    ? `¥${formatted}（税込）`
    : `¥${formatted} (tax included)`;
}

// ヘルパー: URL プロトコルチェック
export function isSafeUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}
```

---

## API 呼び出し例

```typescript
// ビルド時にデータ取得（pages/index.astro）- Promise.all で並列実行
const [siteMeta, hero, catchcopy, about, recommended, collaboration, storeInfo, footer] =
  await Promise.all([
    client.get<SiteMetaResponse>({ endpoint: "site-meta" }),
    client.get<HeroResponse>({ endpoint: "hero" }),
    client.get<CatchcopyResponse>({ endpoint: "catchcopy" }),
    client.get<AboutResponse>({ endpoint: "about" }),
    client.getList<MenuItem>({
      endpoint: "menu-items",
      queries: { filters: "category[equals]recommended", orders: "sortOrder" },
    }),
    client.getList<MenuItem>({
      endpoint: "menu-items",
      queries: { filters: "category[equals]collaboration", orders: "sortOrder" },
    }),
    client.get<StoreInfoResponse>({ endpoint: "store-info" }),
    client.get<FooterResponse>({ endpoint: "footer" }),
  ]);
```
