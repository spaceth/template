function normalizeFamily(name: string) {
  return name.trim().replace(/^["']|["']$/g, "").toLowerCase();
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * Inline the webfonts actually used by the card.
 * html-to-image's own font scan follows every stylesheet, including ones
 * the browser cannot fetch, and that aborts the export.
 */
export async function inlineUsedFonts(node: HTMLElement) {
  const used = new Set(
    getComputedStyle(node)
      .fontFamily.split(",")
      .map(normalizeFamily)
      .filter(Boolean),
  );
  const faces: { css: string; base: string }[] = [];
  const seen = new Set<string>();

  for (const sheet of document.styleSheets) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    for (const rule of rules) {
      if (!(rule instanceof CSSFontFaceRule)) continue;
      const family = normalizeFamily(rule.style.getPropertyValue("font-family"));
      if (!used.has(family) || seen.has(rule.cssText)) continue;
      seen.add(rule.cssText);
      faces.push({ css: rule.cssText, base: sheet.href ?? location.href });
    }
  }

  const inlined = await Promise.all(
    faces.map(async ({ css, base }) => {
      const urls = [...css.matchAll(/url\((['"]?)([^'")]+)\1\)/g)];
      let next = css;
      for (const match of urls) {
        const raw = match[2];
        if (!raw || raw.startsWith("data:")) continue;
        const response = await fetch(new URL(raw, base));
        if (!response.ok) continue;
        const dataUrl = await blobToDataUrl(await response.blob());
        next = next.replace(match[0], `url("${dataUrl}")`);
      }
      return next;
    }),
  );

  return inlined.join("\n");
}
