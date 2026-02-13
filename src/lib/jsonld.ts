import type { Lang, SiteDataResponse, MenuItem } from "./microcms";
import { localized } from "./microcms";

const SITE_URL = "https://1129kyoto.jp";

function buildMenuItems(
  items: MenuItem[],
  lang: Lang,
): Record<string, unknown>[] {
  return items.map((item) => ({
    "@type": "MenuItem",
    name: localized(item, "name", lang),
    description: localized(item, "description", lang),
    offers: {
      "@type": "Offer",
      price: item.price,
      priceCurrency: "JPY",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: item.price,
        priceCurrency: "JPY",
        valueAddedTaxIncluded: true,
      },
    },
    image: item.image?.url,
  }));
}

export function buildRestaurantJsonLd(
  siteData: SiteDataResponse,
  recommended: MenuItem[],
  collaboration: MenuItem[],
  lang: Lang,
): Record<string, unknown> {
  const name = lang === "ja" ? "祇園だいきち牧場" : "Gion Daikichi Ranch";
  const description = localized(siteData, "description", lang);
  const url = lang === "ja" ? `${SITE_URL}/` : `${SITE_URL}/en/`;

  const snsUrls = siteData.snsLinks
    ?.map((link) => link.url)
    .filter(Boolean) ?? [];

  const recommendedLabel =
    lang === "ja" ? "おすすめメニュー" : "Recommended Menu";
  const collaborationLabel =
    lang === "ja" ? "コラボメニュー" : "Collaboration Menu";

  const menuSections: Record<string, unknown>[] = [];

  if (recommended.length > 0) {
    menuSections.push({
      "@type": "MenuSection",
      name: recommendedLabel,
      hasMenuItem: buildMenuItems(recommended, lang),
    });
  }

  if (collaboration.length > 0) {
    menuSections.push({
      "@type": "MenuSection",
      name: collaborationLabel,
      hasMenuItem: buildMenuItems(collaboration, lang),
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name,
    description,
    url,
    telephone: siteData.tel,
    image: siteData.ogImage?.url,
    address: {
      "@type": "PostalAddress",
      postalCode: siteData.postalCode,
      streetAddress: localized(siteData, "address", lang),
      addressLocality: lang === "ja" ? "京都市東山区" : "Higashiyama-ku, Kyoto",
      addressRegion: lang === "ja" ? "京都府" : "Kyoto",
      addressCountry: "JP",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "11:00",
        closes: "17:00",
      },
    ],
    servesCuisine: lang === "ja" ? "和牛料理" : "Wagyu Cuisine",
    priceRange: "¥1,000〜¥3,000",
    hasMenu: {
      "@type": "Menu",
      name: lang === "ja" ? "メニュー" : "Menu",
      hasMenuSection: menuSections,
    },
    sameAs: snsUrls,
  };
}
