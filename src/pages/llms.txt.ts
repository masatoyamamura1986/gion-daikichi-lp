import type { APIRoute } from "astro";
import { client, localized, formatPrice } from "../lib/microcms";
import type { SiteDataResponse, MenuItem } from "../lib/microcms";

const LANG = "en" as const;

function buildLlmsTxt(
  siteData: SiteDataResponse,
  recommended: MenuItem[],
  collaboration: MenuItem[],
): string {
  const lines: string[] = [];

  // Header
  lines.push("# Gion Daikichi Ranch (祇園だいきち牧場)");
  lines.push("");
  lines.push("> " + localized(siteData, "description", LANG));
  lines.push("");

  // About
  lines.push("## About");
  lines.push("");
  lines.push(localized(siteData, "body", LANG));
  lines.push("");

  // Recommended Menu
  if (recommended.length > 0) {
    lines.push("## Recommended Menu");
    lines.push("");
    for (const item of recommended) {
      const name = localized(item, "name", LANG);
      const price = formatPrice(item.price, LANG);
      const desc = localized(item, "description", LANG);
      lines.push(`- **${name}** — ${price}`);
      if (desc) {
        lines.push(`  ${desc}`);
      }
    }
    lines.push("");
  }

  // Collaboration Menu
  if (collaboration.length > 0) {
    lines.push("## Collaboration Menu");
    lines.push("");
    for (const item of collaboration) {
      const name = localized(item, "name", LANG);
      const price = formatPrice(item.price, LANG);
      const desc = localized(item, "description", LANG);
      lines.push(`- **${name}** — ${price}`);
      if (desc) {
        lines.push(`  ${desc}`);
      }
    }
    lines.push("");
  }

  // Store Information
  lines.push("## Store Information");
  lines.push("");
  lines.push(`- **Address**: ${localized(siteData, "address", LANG)}`);
  lines.push(`- **Postal Code**: ${siteData.postalCode}`);
  lines.push(`- **Phone**: ${siteData.tel}`);
  lines.push(`- **Hours**: ${localized(siteData, "hours", LANG)}`);
  lines.push(`- **Closed**: ${localized(siteData, "closedDay", LANG)}`);
  if (siteData.payment_en) {
    lines.push(`- **Payment**: ${localized(siteData, "payment", LANG)}`);
  }
  lines.push(
    `- **Reservation**: ${localized(siteData, "reservation", LANG)}`,
  );
  lines.push("");

  // Website
  lines.push("## Links");
  lines.push("");
  lines.push("- Website: https://1129kyoto.jp");
  lines.push("- English: https://1129kyoto.jp/en/");
  for (const link of siteData.snsLinks ?? []) {
    const platform = link.platform?.[0] ?? "SNS";
    const label = platform.charAt(0).toUpperCase() + platform.slice(1);
    lines.push(`- ${label}: ${link.url}`);
  }
  lines.push("");

  return lines.join("\n");
}

export const GET: APIRoute = async () => {
  const [siteData, recommended, collaboration] = await Promise.all([
    client.get<SiteDataResponse>({ endpoint: "site-data" }),
    client.getList<MenuItem>({
      endpoint: "menu-items",
      queries: {
        filters: "category[contains]recommended",
        orders: "sortOrder",
      },
    }),
    client.getList<MenuItem>({
      endpoint: "menu-items",
      queries: {
        filters: "category[contains]collaboration",
        orders: "sortOrder",
      },
    }),
  ]);

  const body = buildLlmsTxt(
    siteData,
    recommended.contents,
    collaboration.contents,
  );

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
