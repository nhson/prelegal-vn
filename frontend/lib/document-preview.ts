function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

export function generateGenericPreview(
  docName: string,
  fields: Record<string, string>
): string {
  const lines: string[] = [];
  lines.push(`# ${docName}`);
  lines.push("");
  lines.push("## Cover Page / Key Terms");
  lines.push("");

  const entries = Object.entries(fields).filter(([, v]) => v && v.trim());

  if (entries.length === 0) {
    lines.push("*Chat with the AI assistant to fill in the document details.*");
    lines.push("");
    lines.push("---");
    lines.push("");
    lines.push("*Standard Terms: This document incorporates the applicable Common Paper standard terms.*");
    return lines.join("\n");
  }

  for (const [key, value] of entries) {
    lines.push(`**${formatKey(key)}:** ${value}`);
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push("*Standard Terms: This document incorporates the applicable Common Paper standard terms.*");
  lines.push("*[commonpaper.com](https://commonpaper.com) — free to use under CC BY 4.0*");

  return lines.join("\n");
}
