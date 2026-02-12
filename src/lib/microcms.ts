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
  category: ("recommended" | "collaboration")[];
  collabLabel_ja?: string;
  collabLabel_en?: string;
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
  platform: ("instagram" | "tiktok" | "youtube")[];
  url: string;
}

export interface FooterResponse {
  snsLinks: SnsLink[];
  otherMenuUrl?: string;
}

// 統合型: site-data エンドポイント（旧6APIを1つに統合）
export type SiteDataResponse = SiteMetaResponse &
  HeroResponse &
  CatchcopyResponse &
  AboutResponse &
  StoreInfoResponse &
  FooterResponse;

// ヘルパー: 言語別フィールド取得（型安全）
export function localized<T extends object>(
  obj: T,
  field: string,
  lang: Lang,
): string {
  const key = `${field}_${lang}`;
  const value = (obj as Record<string, unknown>)[key];
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
  return (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("/")
  );
}
