# microCMS 運用ガイド

## 概要

本プロジェクトで使用する microCMS の運用に関するガイド。
スキーマ JSON のインポート/エクスポート形式、Write API によるコンテンツ投入、
メディアアップロード API の仕様をまとめる。

---

## 1. スキーマ JSON フォーマット

microCMS のスキーマは管理画面から JSON でエクスポート/インポートできる。
フォーマットは公式ドキュメントに記載がないため、エクスポート結果から逆引きした仕様。

### トップレベル構造

```json
{
  "apiFields": [ ... ],
  "customFields": [ ... ]
}
```

| キー | 説明 |
|---|---|
| `apiFields` | API のフィールド定義（配列） |
| `customFields` | 繰り返しフィールドで使うカスタムフィールド定義（配列） |

### apiFields の各要素

```json
{
  "fieldId": "title_ja",
  "name": "SEO タイトル（日）",
  "kind": "text",
  "required": true
}
```

| プロパティ | 型 | 必須 | 説明 |
|---|---|---|---|
| `fieldId` | string | Yes | フィールド ID（**20文字以内**、英数字 + `_`） |
| `name` | string | Yes | 管理画面の表示名 |
| `kind` | string | Yes | フィールドの種類（後述） |
| `required` | boolean | Yes | 必須フィールドかどうか |

#### 繰り返しフィールドの場合（追加プロパティ）

```json
{
  "fieldId": "slides",
  "name": "ヒーロースライド",
  "kind": "repeater",
  "required": true,
  "customFieldCreatedAtList": ["2026-02-12T09:00:01.000Z"]
}
```

| プロパティ | 型 | 説明 |
|---|---|---|
| `customFieldCreatedAtList` | string[] | 参照するカスタムフィールドの `createdAt` タイムスタンプ配列 |

#### セレクトフィールドの場合（追加プロパティ）

```json
{
  "fieldId": "category",
  "name": "カテゴリ",
  "kind": "select",
  "required": true,
  "selectItems": [
    { "id": "Ct1Re2Co3m", "value": "recommended" },
    { "id": "Ct4Co5Ll6a", "value": "collaboration" }
  ],
  "selectInitialValue": [],
  "multipleSelect": false
}
```

| プロパティ | 型 | 説明 |
|---|---|---|
| `selectItems` | `{ id: string, value: string }[]` | 選択肢。`id` は 10文字程度のランダム文字列 |
| `selectInitialValue` | string[] | 初期選択値（空配列 = 未選択） |
| `multipleSelect` | boolean | 複数選択を許可するか |

### kind の値一覧

| kind 値 | 管理画面での種類 | 備考 |
|---|---|---|
| `text` | テキストフィールド | 1行テキスト |
| `textArea` | テキストエリア | 複数行テキスト |
| `number` | 数値 | 整数 |
| `media` | 画像 | **`image` ではなく `media`** |
| `select` | セレクトボックス | 追加プロパティ必須 |
| `repeater` | 繰り返し | カスタムフィールド参照 |
| `richEditor` | リッチエディタ | HTML |
| `boolean` | 真偽値 | true/false |
| `date` | 日時 | ISO 8601 |
| `relation` | 参照 | 他 API への参照 |
| `relationList` | 複数参照 | 他 API への複数参照 |

> **注意**: 画像フィールドの kind は `"media"` であり `"image"` ではない。

### customFields の各要素

繰り返し（`repeater`）フィールドの中身を定義する。

```json
{
  "createdAt": "2026-02-12T09:00:01.000Z",
  "fieldId": "slides",
  "name": "スライド",
  "fields": [
    {
      "idValue": "Sl1Aa2Bb3c",
      "fieldId": "image",
      "name": "画像",
      "kind": "media",
      "required": true
    },
    {
      "idValue": "Sl4Dd5Ee6f",
      "fieldId": "alt_ja",
      "name": "ALT（日本語）",
      "kind": "text",
      "required": true
    }
  ],
  "position": [["Sl1Aa2Bb3c", "Sl4Dd5Ee6f"]],
  "updatedAt": "2026-02-12T09:00:01.000Z",
  "viewerGroup": "a1a"
}
```

| プロパティ | 型 | 必須 | 説明 |
|---|---|---|---|
| `createdAt` | string | Yes | ISO 8601 タイムスタンプ（apiFields の `customFieldCreatedAtList` と一致させる） |
| `fieldId` | string | Yes | カスタムフィールドの ID |
| `name` | string | Yes | 管理画面での表示名 |
| `fields` | array | Yes | フィールド定義配列 |
| `position` | string[][] | Yes | フィールドのレイアウト（各行の idValue 配列） |
| `updatedAt` | string | Yes | 通常 `createdAt` と同じ |
| `viewerGroup` | string | Yes | 3文字のランダム文字列 |

#### fields 内のプロパティ

通常の `apiFields` に `idValue` を追加した形式。

| プロパティ | 型 | 必須 | 説明 |
|---|---|---|---|
| `idValue` | string | Yes | 10文字程度のランダム ID（`position` から参照される） |
| `fieldId` | string | Yes | フィールド ID |
| `name` | string | Yes | 表示名 |
| `kind` | string | Yes | フィールドの種類 |
| `required` | boolean | Yes | 必須かどうか |

> カスタムフィールド内にセレクトフィールドがある場合は `selectItems`、`selectInitialValue`、`multipleSelect` も必要。

### apiFields と customFields の紐付け

```
apiFields[n].customFieldCreatedAtList[0]  ←→  customFields[m].createdAt
```

繰り返しフィールド（`kind: "repeater"`）の `customFieldCreatedAtList` に入っているタイムスタンプが、
対応する `customFields` の `createdAt` と一致している必要がある。

---

## 2. Write API（コンテンツ投入）

microCMS Write API を使ってスクリプトからコンテンツを投入できる。
スキーマ作成は管理画面で行う必要があるが、データ投入は API 経由で自動化可能。

### エンドポイント

```
Base URL: https://{SERVICE_DOMAIN}.microcms.io/api/v1/{ENDPOINT}
```

### オブジェクト型 API

| メソッド | パス | 説明 |
|---|---|---|
| `PUT` | `/api/v1/{endpoint}` | データを作成・上書き |
| `PATCH` | `/api/v1/{endpoint}` | 部分更新 |

### リスト型 API

| メソッド | パス | 説明 |
|---|---|---|
| `POST` | `/api/v1/{endpoint}` | 新規作成（ID 自動生成） |
| `PUT` | `/api/v1/{endpoint}/{id}` | 指定 ID で作成・上書き |
| `PATCH` | `/api/v1/{endpoint}/{id}` | 部分更新 |
| `DELETE` | `/api/v1/{endpoint}/{id}` | 削除 |

### ヘッダー

```
X-MICROCMS-API-KEY: {API_KEY}
Content-Type: application/json
```

> **注意**: Write API を使うには、microCMS 管理画面で API キーに書き込み権限を付与する必要がある。
> デフォルトの API キーは読み取り専用。

### リクエスト例

#### オブジェクト型（site-data）の書き込み

```typescript
const response = await fetch(
  `https://${SERVICE_DOMAIN}.microcms.io/api/v1/site-data`,
  {
    method: "PUT",
    headers: {
      "X-MICROCMS-API-KEY": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title_ja: "祇園だいきち牧場 | 祇園で味わうA5近江牛",
      title_en: "Gion Daikichi Ranch | A5 Omi Beef in Gion, Kyoto",
      // ... 全フィールドを含む
    }),
  },
);
```

#### リスト型（menu-items）の書き込み

```typescript
const response = await fetch(
  `https://${SERVICE_DOMAIN}.microcms.io/api/v1/menu-items`,
  {
    method: "POST",
    headers: {
      "X-MICROCMS-API-KEY": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name_ja: "近江だいきち牛 ステーキ重",
      name_en: "Omi Daikichi Beef Steak Bowl",
      price: 4290,
      description_ja: "自社牧場で育てた近江だいきち牛...",
      description_en: "Made with our farm-raised Omi Daikichi beef...",
      category: ["recommended"],
      sortOrder: 1,
    }),
  },
);
```

> **注意**: セレクトフィールドの値は配列で送る（単一選択でも `["recommended"]`）。

### 繰り返しフィールドの書き込み

繰り返しフィールドは配列として送信する。画像フィールドは事前にメディア API でアップロードし、返された URL を使う。

```typescript
{
  "slides": [
    {
      "fieldId": "slides",
      "image": "https://images.microcms-assets.io/assets/.../hero1.webp",
      "alt_ja": "近江だいきち牛 ステーキ重",
      "alt_en": "Omi Daikichi Beef Steak Bowl"
    }
  ]
}
```

> 繰り返しフィールドの各要素には `fieldId`（カスタムフィールドの fieldId）を含める。

---

## 3. メディアアップロード API

画像をプログラムからアップロードする。

### エンドポイント

```
POST https://{SERVICE_DOMAIN}.microcms-management.io/api/v1/media
```

> **注意**: ドメインが通常の API（`microcms.io`）ではなく `microcms-management.io`。

### ヘッダー

```
X-MICROCMS-API-KEY: {API_KEY}
Content-Type: multipart/form-data
```

### リクエスト

`multipart/form-data` で `file` フィールドに画像を添付。

```typescript
const formData = new FormData();
formData.append("file", imageBuffer, "hero1.webp");

const response = await fetch(
  `https://${SERVICE_DOMAIN}.microcms-management.io/api/v1/media`,
  {
    method: "POST",
    headers: {
      "X-MICROCMS-API-KEY": API_KEY,
    },
    body: formData,
  },
);

const { url } = await response.json();
// url: "https://images.microcms-assets.io/assets/.../hero1.webp"
```

### レスポンス

```json
{
  "url": "https://images.microcms-assets.io/assets/.../hero1.webp"
}
```

返された URL を Write API の画像フィールドに指定する。

---

## 4. 制約事項と注意点

### フィールド ID

- **最大 20 文字**（英数字 + `_`）
- 作成後に変更不可

### Hobby プラン制限

- API 数に上限あり（本プロジェクトでは 2 API に統合して対応）
- Write API の月間リクエスト数に制限あり

### スキーマ変更

- スキーマの作成・変更は管理画面のみ（API 不可）
- JSON インポート/エクスポートで効率化可能
- 本プロジェクトのスキーマ JSON: `scripts/schemas/`

### JSON インポート手順

1. microCMS 管理画面で API を作成（名前・エンドポイント・型を設定）
2. API スキーマ設定画面で「インポート」を選択
3. `scripts/schemas/` 内の JSON ファイルをアップロード
4. フィールドが自動追加される

### 画像フィールドの扱い

- Write API で画像を設定する場合、URL 文字列（`https://images.microcms-assets.io/...`）を指定
- 外部 URL は不可。事前にメディア API でアップロードが必要
- Read API のレスポンスは `{ url, width, height }` オブジェクト
