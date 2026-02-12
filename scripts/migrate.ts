/**
 * microCMS コンテンツ移行スクリプト
 *
 * 現行 HTML のコンテンツを microCMS に投入する。
 * 画像は Media API でアップロードし、返却 URL を使用する。
 *
 * 実行: npx tsx scripts/migrate.ts
 * 環境変数: MICROCMS_SERVICE_DOMAIN, MICROCMS_API_KEY
 */

import fs from "node:fs";
import path from "node:path";

// ---------------------------------------------------------------------------
// 環境変数
// ---------------------------------------------------------------------------

const SERVICE_DOMAIN = process.env.MICROCMS_SERVICE_DOMAIN;
const API_KEY = process.env.MICROCMS_API_KEY;

if (!SERVICE_DOMAIN || !API_KEY) {
  console.error(
    "環境変数 MICROCMS_SERVICE_DOMAIN, MICROCMS_API_KEY を設定してください。",
  );
  process.exit(1);
}

const BASE_URL = `https://${SERVICE_DOMAIN}.microcms.io/api/v1`;

// ---------------------------------------------------------------------------
// 型定義
// ---------------------------------------------------------------------------

interface UploadedImage {
  url: string;
}

/** 画像名 -> アップロード後 URL のマッピング */
type ImageMap = Record<string, string>;

interface MigrateResult {
  endpoint: string;
  success: boolean;
  error?: string;
}

// ---------------------------------------------------------------------------
// ユーティリティ
// ---------------------------------------------------------------------------

async function uploadImage(filePath: string): Promise<string> {
  const absolutePath = path.resolve(filePath);
  const fileBuffer = fs.readFileSync(absolutePath);
  const fileName = path.basename(absolutePath);

  const formData = new FormData();
  formData.append("file", new Blob([fileBuffer]), fileName);

  const res = await fetch(
    `https://${SERVICE_DOMAIN}.microcms.io/api/v1/media`,
    {
      method: "POST",
      headers: {
        "X-MICROCMS-API-KEY": API_KEY,
      },
      body: formData,
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`画像アップロード失敗 (${fileName}): ${res.status} ${text}`);
  }

  const data = (await res.json()) as UploadedImage;
  return data.url;
}

async function putObject(
  endpoint: string,
  body: Record<string, unknown>,
): Promise<void> {
  const res = await fetch(`${BASE_URL}/${endpoint}`, {
    method: "PUT",
    headers: {
      "X-MICROCMS-API-KEY": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PUT /${endpoint} 失敗: ${res.status} ${text}`);
  }
}

// ---------------------------------------------------------------------------
// Step 1: 画像アップロード
// ---------------------------------------------------------------------------

const IMAGES_DIR = path.resolve(__dirname, "..", "images");

/** アップロード対象の画像ファイル名一覧 */
const IMAGE_FILES = [
  "hero.webp",
  "hitsumabushi-hero.webp",
  "cow.webp",
  "farm.webp",
  "exterior.webp",
  "hitsumabushi.webp",
  "steak-ju.webp",
  "suki-gozen.webp",
  "sukiyaki-udon.webp",
  "interior-1f.webp",
  "interior-2f.webp",
] as const;

async function uploadAllImages(): Promise<ImageMap> {
  console.log("=== Step 1: 画像アップロード ===");
  const imageMap: ImageMap = {};

  for (const fileName of IMAGE_FILES) {
    const filePath = path.join(IMAGES_DIR, fileName);
    console.log(`  アップロード中: ${fileName}`);
    try {
      const url = await uploadImage(filePath);
      imageMap[fileName] = url;
      console.log(`  -> ${url}`);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error(`  [ERROR] ${message}`);
      throw e;
    }
  }

  console.log(`画像アップロード完了: ${Object.keys(imageMap).length} 件\n`);
  return imageMap;
}

// ---------------------------------------------------------------------------
// Step 2: コンテンツ投入
// ---------------------------------------------------------------------------

function buildSiteMeta(images: ImageMap): Record<string, unknown> {
  return {
    title_ja: "祇園だいきち牧場 | 祇園で味わうA5近江牛",
    title_en: "Gion Daikichi Ranch | A5 Omi Beef in Gion, Kyoto",
    description_ja:
      "祇園だいきち牧場は、自社牧場で育てたA5ランク近江牛を祇園で楽しめるお店です。名物ひつまぶしやステーキ重、すき焼き御膳など、こだわりのメニューをご用意しています。",
    description_en:
      "Gion Daikichi Ranch is a restaurant where you can enjoy A5-grade Omi beef raised on our own satoyama ranch. Enjoy our signature hitsumabushi, steak bowls, sukiyaki set meals, and more.",
    ogImage: images["hero.webp"],
  };
}

function buildHero(images: ImageMap): Record<string, unknown> {
  return {
    slides: [
      {
        image: images["hero.webp"],
        alt_ja: "近江だいきち牛 ステーキ重",
        alt_en: "Omi Daikichi Beef Steak Bowl",
      },
      {
        image: images["hitsumabushi-hero.webp"],
        alt_ja: "近江だいきち牛 ひつまぶし",
        alt_en: "Omi Daikichi Beef Hitsumabushi",
      },
      {
        image: images["cow.webp"],
        alt_ja: "近江だいきち牛",
        alt_en: "Omi Daikichi Beef Cattle",
      },
      {
        image: images["farm.webp"],
        alt_ja: "だいきち牧場",
        alt_en: "Daikichi Ranch",
      },
    ],
  };
}

function buildCatchcopy(): Record<string, unknown> {
  return {
    mainCopy_ja: "祇園で味わう、里山育ちのA5近江牛",
    mainCopy_en: "A5 Omi Beef Raised in the Satoyama, Savored in Gion",
    subCopy_ja:
      "自社牧場で育てた近江だいきち牛を、名物ひつまぶしから夜のコースまで",
    subCopy_en:
      "From our signature hitsumabushi to evening course menus, enjoy Omi Daikichi Beef raised on our own ranch.",
  };
}

function buildAbout(images: ImageMap): Record<string, unknown> {
  return {
    image: images["exterior.webp"],
    imageAlt_ja: "祇園だいきち牧場 外観",
    imageAlt_en: "Gion Daikichi Ranch Exterior",
    heading_ja: "祇園だいきち牧場について",
    heading_en: "Gion Daikichi Ranch",
    body_ja:
      "祇園だいきち牧場は、里山の自社牧場で育てたA5ランク近江牛を楽しめるお店です。創業1896年から4代続く大吉商店の「近江だいきち牛」を使い、名物ひつまぶしやステーキ重、すき焼き重・すき焼き御膳などのオリジナルメニューをご用意。夜は近江牛の魅力をコース仕立てでお楽しみいただけます。さらに、創業1969年「京のカレーうどん 味味香」とコラボした、限定オリジナル3種の近江牛カレーうどんもご用意しています。",
    body_en:
      'Gion Daikichi Ranch is a restaurant where you can enjoy A5-grade Omi beef raised on our own satoyama ranch. We serve "Omi Daikichi Beef" from Daikichi Shoten\u2014a family business founded in 1896 and carried on for four generations\u2014in original dishes such as our signature hitsumabushi, steak bowls, and sukiyaki bowls and set meals. In the evening, you can experience the full appeal of Omi beef through carefully crafted course menus. We also offer three limited-edition Omi beef curry udon dishes, created in collaboration with Aji-Aji-Ka (Kyoto Curry Udon), established in 1969.',
    links: [
      {
        label_ja: "大吉商店株式会社について",
        label_en: "Daikichi Shoten Co., Ltd.",
        url_ja: "http://1129.co.jp/company/",
        url_en: "http://www.omibeef.asia/strongpoint/",
      },
      {
        label_ja: "近江だいきち牛について",
        label_en: "Omi Daikichi Beef",
        url_ja: "https://daikichibeef.jp/farm",
        url_en: "http://www.omibeef.asia/premium/",
      },
    ],
  };
}

interface MenuItemData {
  id: string;
  image: string;
  name_ja: string;
  name_en: string;
  price: number;
  description_ja: string;
  description_en: string;
  movieUrl: string | null;
  category: "recommended" | "collaboration";
  collaborationLabel_ja?: string;
  collaborationLabel_en?: string;
  collaborationUrl?: string;
  sortOrder: number;
}

function buildMenuItems(images: ImageMap): MenuItemData[] {
  return [
    {
      id: "hitsumabushi",
      image: images["hitsumabushi.webp"],
      name_ja: "近江だいきち牛 ひつまぶし（ロース1.5倍）",
      name_en: "Omi Daikichi Beef Hitsumabushi \u2014 1.5 Times Loin",
      price: 5455,
      description_ja:
        "だいきち近江牛を焼き上げた名物ひつまぶしで、ご飯の中に近江牛のコンビーフが入っています。3種の味と京出汁、またはピリ辛チゲで味の変化を楽しみながらお召し上がりください。",
      description_en:
        "Our signature hitsumabushi features grilled Daikichi Omi beef, with Omi beef corned beef tucked inside the rice. Enjoy it as the flavors change\u2014three seasonings plus Kyoto dashi, or a spicy chige broth\u2014served in stages.",
      movieUrl: "https://www.instagram.com/reel/DRn6065jwec/?hl=ja",
      category: "recommended",
      sortOrder: 1,
    },
    {
      id: "steak-ju",
      image: images["steak-ju.webp"],
      name_ja: "近江だいきち牛 ステーキ重（ロース1.5倍）",
      name_en: "Omi Daikichi Beef Steak Rice Bowl \u2014 1.5 Times Loin",
      price: 5318,
      description_ja:
        "近江の地で作られた天然醸造仕込みの濃口醤油を使用したオリジナル特製たれで焼き上げた贅沢な銘品です。ロースはとろけるような舌触りと独自のコクを味わって頂けます。赤身はお肉本来の食感と旨みを堪能して頂けます。",
      description_en:
        "This luxurious signature dish is grilled with our original special sauce made with naturally brewed dark soy sauce crafted in Omi. The loin offers a melt-in-your-mouth texture and a distinctive richness, while the lean cut lets you savor the beef's natural bite and deep umami.",
      movieUrl: "https://www.instagram.com/reel/DRqlHRSj6wS/?hl=ja",
      category: "recommended",
      sortOrder: 2,
    },
    {
      id: "suki-gozen",
      image: images["suki-gozen.webp"],
      name_ja: "近江だいきち牛 すき御膳（ロース）",
      name_en: "Omi Daikichi Beef Sukiyaki Set \u2014 Loin",
      price: 4091,
      description_ja:
        "自家製割下でお客様ご自身が炊き上げるすき焼きです。多彩な具材と自社牧場産だいきち近江牛をお楽しみください。",
      description_en:
        "This is sukiyaki simmered at your table in our house-made warishita sauce. Enjoy a variety of ingredients together with Daikichi Omi beef from our own ranch.",
      movieUrl: "https://www.instagram.com/reel/DR_h0R4D3rv/?hl=ja",
      category: "recommended",
      sortOrder: 3,
    },
    {
      id: "sukiyaki-curry-udon",
      image: images["sukiyaki-udon.webp"],
      name_ja: "近江だいきち牛すきやきカレーうどん",
      name_en: "Omi Daikichi Beef Sukiyaki Curry Udon",
      price: 2500,
      description_ja:
        "昆布と鰹の旨味を引き出した「旨みだし」に厳選された11種類のスパイスを加え、あんかけに仕上げたのが「京のカレーうどん」です。自社牧場産の\u201c近江だいきち牛\u201dのロース肉を自家製割下で味付けした、「和牛すき焼き」の甘くて濃厚な食感と、厚切りのあげと九条ねぎで、祇園味味香オリジナルカレーうどんの旨味と食感をご賞味ください。",
      description_en:
        '\u201cKyoto Curry Udon\u201d is finished as a thick, glossy sauce by blending our umami dashi\u2014crafted to bring out the richness of kombu kelp and bonito\u2014with 11 carefully selected spices. Enjoy the sweet, rich taste of wagyu sukiyaki, made with loin from our own-ranch Omi Daikichi Beef seasoned in our house-made warishita, together with thick-cut fried tofu and Kujo green onions\u2014bringing out the signature depth and texture of Gion Mimiko\u2019s original curry udon.',
      movieUrl: null,
      category: "collaboration",
      collaborationLabel_ja: "祇園味味香",
      collaborationLabel_en: "Gion Mimiko",
      collaborationUrl: "https://mimikou.jp/kyoto-curry-udon-flavor/",
      sortOrder: 1,
    },
  ];
}

function buildStoreInfo(images: ImageMap): Record<string, unknown> {
  return {
    interiorImages: [
      {
        image: images["interior-1f.webp"],
        alt_ja: "祇園だいきち牧場 内観1F",
        alt_en: "Gion Daikichi Ranch Interior 1F",
      },
      {
        image: images["interior-2f.webp"],
        alt_ja: "祇園だいきち牧場 内観2F",
        alt_en: "Gion Daikichi Ranch Interior 2F",
      },
    ],
    address_ja: "京都府京都市東山区祇園町南側528番地6",
    address_en:
      "528-6 Gionmachi Minamigawa, Higashiyama-ku, Kyoto-shi, Kyoto 605-0074, Japan",
    postalCode: "605-0074",
    tel: "075-746-4129",
    hours_ja: "11:00\u301c15:00、17:00\u301c20:00",
    hours_en: "11:00 \u2013 15:00, 17:00 \u2013 20:00",
    closedDay_ja: "日曜日",
    closedDay_en: "Sundays",
    payment_ja: "※確認中",
    payment_en: "TBD",
    reservation_ja: "承っておりません",
    reservation_en: "Unavailable",
    mapEmbedUrl:
      "https://www.google.com/maps?q=528-6+Gionmachi+Minamigawa,+Higashiyama-ku,+Kyoto&output=embed",
    affiliatedUrl: "https://daikichibeef.jp/shop",
  };
}

function buildFooter(): Record<string, unknown> {
  return {
    snsLinks: [
      {
        platform: "instagram",
        url: "https://www.instagram.com/gion.daikichibeef?igsh=a2FzNGtiY210aHhk",
      },
      {
        platform: "tiktok",
        url: "https://www.tiktok.com/@gion.daikichibeef?_r=1&_t=ZS-93UkS1kX9HR",
      },
      {
        platform: "youtube",
        url: "https://youtube.com/channel/UCylR4wY3H3f3yQqHagrWZjQ?si=tIQ2c3DS_SpcBdck",
      },
    ],
    otherMenuUrl: null,
  };
}

// ---------------------------------------------------------------------------
// メイン処理
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log("microCMS コンテンツ移行を開始します。\n");

  // Step 1: 画像アップロード
  const images = await uploadAllImages();

  // Step 2: 各 API にコンテンツ投入
  console.log("=== Step 2: コンテンツ投入 ===\n");

  const results: MigrateResult[] = [];

  // site-meta (PUT)
  console.log("[1/7] site-meta を投入中...");
  try {
    await putObject("site-meta", buildSiteMeta(images));
    results.push({ endpoint: "site-meta", success: true });
    console.log("  -> 成功\n");
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    results.push({ endpoint: "site-meta", success: false, error: message });
    console.error(`  -> 失敗: ${message}\n`);
  }

  // hero (PUT)
  console.log("[2/7] hero を投入中...");
  try {
    await putObject("hero", buildHero(images));
    results.push({ endpoint: "hero", success: true });
    console.log("  -> 成功\n");
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    results.push({ endpoint: "hero", success: false, error: message });
    console.error(`  -> 失敗: ${message}\n`);
  }

  // catchcopy (PUT)
  console.log("[3/7] catchcopy を投入中...");
  try {
    await putObject("catchcopy", buildCatchcopy());
    results.push({ endpoint: "catchcopy", success: true });
    console.log("  -> 成功\n");
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    results.push({ endpoint: "catchcopy", success: false, error: message });
    console.error(`  -> 失敗: ${message}\n`);
  }

  // about (PUT)
  console.log("[4/7] about を投入中...");
  try {
    await putObject("about", buildAbout(images));
    results.push({ endpoint: "about", success: true });
    console.log("  -> 成功\n");
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    results.push({ endpoint: "about", success: false, error: message });
    console.error(`  -> 失敗: ${message}\n`);
  }

  // menu-items (POST x4)
  console.log("[5/7] menu-items を投入中...");
  const menuItems = buildMenuItems(images);
  for (const item of menuItems) {
    const { id, ...body } = item;
    try {
      // コンテンツ ID を指定して POST（id をパスパラメータにする）
      const res = await fetch(`${BASE_URL}/menu-items/${id}`, {
        method: "PUT",
        headers: {
          "X-MICROCMS-API-KEY": API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `PUT /menu-items/${id} 失敗: ${res.status} ${text}`,
        );
      }
      console.log(`  -> ${item.name_ja} (${id}): 成功`);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error(`  -> ${item.name_ja} (${id}): 失敗 - ${message}`);
      results.push({
        endpoint: `menu-items/${id}`,
        success: false,
        error: message,
      });
    }
  }
  results.push({ endpoint: "menu-items", success: true });
  console.log("");

  // store-info (PUT)
  console.log("[6/7] store-info を投入中...");
  try {
    await putObject("store-info", buildStoreInfo(images));
    results.push({ endpoint: "store-info", success: true });
    console.log("  -> 成功\n");
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    results.push({ endpoint: "store-info", success: false, error: message });
    console.error(`  -> 失敗: ${message}\n`);
  }

  // footer (PUT)
  console.log("[7/7] footer を投入中...");
  try {
    await putObject("footer", buildFooter());
    results.push({ endpoint: "footer", success: true });
    console.log("  -> 成功\n");
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    results.push({ endpoint: "footer", success: false, error: message });
    console.error(`  -> 失敗: ${message}\n`);
  }

  // Step 3: 結果サマリー
  console.log("=== 移行結果サマリー ===");
  const succeeded = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`成功: ${succeeded.length} 件`);
  for (const r of succeeded) {
    console.log(`  [OK] ${r.endpoint}`);
  }

  if (failed.length > 0) {
    console.log(`\n失敗: ${failed.length} 件`);
    for (const r of failed) {
      console.log(`  [NG] ${r.endpoint}: ${r.error}`);
    }
    process.exit(1);
  }

  console.log("\n移行が正常に完了しました。");
}

main().catch((e: unknown) => {
  const message = e instanceof Error ? e.message : String(e);
  console.error(`致命的エラー: ${message}`);
  process.exit(1);
});
