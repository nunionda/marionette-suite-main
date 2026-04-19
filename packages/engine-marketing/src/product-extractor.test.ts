import { describe, expect, it } from "vitest";
import {
  parseProductFromHtml,
  parseProductFromPaste,
} from "./product-extractor";

describe("parseProductFromPaste", () => {
  it("splits first line as name, rest as description", () => {
    const p = parseProductFromPaste("Nike Pegasus 41\nA responsive daily trainer for city runners.");
    expect(p.name).toBe("Nike Pegasus 41");
    expect(p.description).toContain("daily trainer");
    expect(p.warnings).toEqual([]);
  });

  it("single line → warning for missing description", () => {
    const p = parseProductFromPaste("Just a name");
    expect(p.name).toBe("Just a name");
    expect(p.description).toBe("");
    expect(p.warnings.length).toBeGreaterThan(0);
  });

  it("empty paste → empty brief with warning", () => {
    const p = parseProductFromPaste("   ");
    expect(p.name).toBe("");
    expect(p.warnings).toContain("empty paste");
  });
});

describe("parseProductFromHtml — Open Graph", () => {
  it("reads og:title + og:description + og:image", () => {
    const html = `
      <html><head>
        <meta property="og:title" content="Nike Pegasus 41" />
        <meta property="og:description" content="A responsive daily trainer." />
        <meta property="og:image" content="https://cdn.example/nike.jpg" />
      </head></html>
    `;
    const p = parseProductFromHtml(html, "https://nike.com/p/41");
    expect(p.name).toBe("Nike Pegasus 41");
    expect(p.description).toBe("A responsive daily trainer.");
    expect(p.imageUrls).toContain("https://cdn.example/nike.jpg");
    expect(p.sourceUrl).toBe("https://nike.com/p/41");
    expect(p.warnings).toEqual([]);
  });

  it("falls back to <title> when og:title absent", () => {
    const html = `<html><head><title>Fallback Product</title></head></html>`;
    const p = parseProductFromHtml(html);
    expect(p.name).toBe("Fallback Product");
    expect(p.warnings).toContain("No product description found");
  });

  it("parses JSON-LD Product for price + brand + color", () => {
    const html = `
      <html><head>
        <meta property="og:title" content="X" />
        <meta property="og:description" content="y" />
        <script type="application/ld+json">
          {"@type":"Product","offers":{"price":"129","priceCurrency":"USD"},
           "brand":{"name":"Nike"},"color":"Black","material":"Mesh",
           "image":["https://cdn.example/a.jpg","https://cdn.example/b.jpg"]}
        </script>
      </head></html>
    `;
    const p = parseProductFromHtml(html);
    expect(p.price).toBe("USD 129");
    expect(p.attributes?.brand).toBe("Nike");
    expect(p.attributes?.color).toBe("Black");
    expect(p.imageUrls).toContain("https://cdn.example/a.jpg");
    expect(p.imageUrls).toContain("https://cdn.example/b.jpg");
  });

  it("silently skips non-Product JSON-LD", () => {
    const html = `
      <html><head>
        <meta property="og:title" content="X" />
        <meta property="og:description" content="y" />
        <script type="application/ld+json">{"@type":"Organization","name":"Acme"}</script>
      </head></html>
    `;
    const p = parseProductFromHtml(html);
    expect(p.price).toBeUndefined();
    expect(p.attributes).toBeUndefined();
  });

  it("surfaces warnings when nothing is parseable", () => {
    const p = parseProductFromHtml("<html></html>");
    expect(p.warnings.length).toBeGreaterThanOrEqual(2);
    expect(p.warnings.some((w) => /name/i.test(w))).toBe(true);
    expect(p.warnings.some((w) => /description/i.test(w))).toBe(true);
    expect(p.warnings.some((w) => /image/i.test(w))).toBe(true);
  });
});
