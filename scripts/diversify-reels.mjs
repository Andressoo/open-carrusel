#!/usr/bin/env node
/**
 * Diversifies reels across 50 sets:
 * - Assigns one of 8 templates per set (rotation based on archetype affinity)
 * - Adds bgImage from picsum (seeded by set name)
 * - Tailors props per template
 *
 * Usage:
 *   node scripts/diversify-reels.mjs
 */

const API = process.env.API_BASE || "http://localhost:3000";

// Archetype → preferred template families (rotation)
const TEMPLATE_ROTATION = {
  Provocación: ["GlitchIntro", "PosterSlam", "TikTokHook"],
  "Case study": ["SplitScreen", "StatDrop", "BeforeAfter"],
  Contrarian: ["GlitchIntro", "SplitScreen", "PosterSlam"],
  "Myth bust": ["GlitchIntro", "Typewriter", "TikTokHook"],
  Listicle: ["Typewriter", "StatDrop", "TikTokHook"],
  Framework: ["Typewriter", "TikTokHook", "StatDrop"],
  VS: ["SplitScreen", "BeforeAfter", "PosterSlam"],
  "Step by step": ["Typewriter", "TikTokHook"],
  "Data drop": ["StatDrop", "Typewriter", "TikTokHook"],
  "Before/After": ["BeforeAfter", "SplitScreen", "StatDrop"],
  "Story arc": ["Typewriter", "PosterSlam", "TikTokHook"],
  Launch: ["PosterSlam", "StatDrop", "TikTokHook"],
  Manifesto: ["PosterSlam", "GlitchIntro", "TikTokHook"],
};

function seededImage(seed, w, h) {
  const s = encodeURIComponent(String(seed).slice(0, 40));
  return `https://picsum.photos/seed/${s}/${w}/${h}`;
}

// Palette variations per template (so they don't all look the same)
const PALETTES = [
  { accent: "#F8C644", bg: "#0E0D12", text: "#FFFFFF" }, // Storu classic
  { accent: "#F8C644", bg: "#5635FD", text: "#FFFFFF" }, // Storu violet
  { accent: "#FF3B5C", bg: "#0E0D12", text: "#FFFFFF" }, // Red alert
  { accent: "#3BF0FF", bg: "#0E0D12", text: "#FFFFFF" }, // Cyber cyan
  { accent: "#10B981", bg: "#0E0D12", text: "#FFFFFF" }, // Emerald
  { accent: "#F8C644", bg: "#1A1A2E", text: "#FFFFFF" }, // Deep blue
  { accent: "#FFFFFF", bg: "#F8C644", text: "#0E0D12" }, // Yellow poster
  { accent: "#0E0D12", bg: "#F8C644", text: "#0E0D12" }, // High contrast yellow
];

async function api(path, method = "GET", body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}`);
  return res.json();
}

function hashInt(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h) + str.charCodeAt(i) | 0;
  return Math.abs(h);
}

function buildPropsFor(template, set, reel, palette, bgImage) {
  const existing = reel.props || {};
  const base = {
    accentColor: palette.accent,
    bgColor: palette.bg,
    textColor: palette.text,
    bgImage,
  };

  // All TikTokHook-family templates share hook/body/cta
  const hook = existing.hook || set.topic;
  const body = existing.body || (set.possibleCaptions?.[0] || "").split("\n")[0] || "Probá esto.";
  const cta = existing.cta || (set.ctaKeyword ? `Comentá ${set.ctaKeyword}` : "Comentá");

  switch (template) {
    case "TikTokHook":
    case "GlitchIntro":
    case "Typewriter":
    case "PosterSlam":
      return { hook, body, cta, ...base };
    case "StatDrop": {
      // Extract a big stat if the hook has one, else use "3x"
      const statMatch = (hook + " " + body).match(/(\d+[x%]|\+?\$?\d+(?:[.,]\d+)?[MK]?)/);
      const stat = statMatch ? statMatch[0] : "3x";
      return { hook: stat, body, cta, ...base };
    }
    case "SplitScreen": {
      const pain = set.possibleCaptions?.[1]?.slice(0, 60) || "Rebajar -30%";
      const gain = set.possibleCaptions?.[2]?.slice(0, 60) || "Diseñar incentivo";
      return {
        hook: set.ctaKeyword ? `${set.ctaKeyword}` : "Decide",
        leftLabel: "ANTES",
        leftValue: pain,
        rightLabel: "AHORA",
        rightValue: gain,
        cta,
        ...base,
      };
    }
    case "BeforeAfter":
      return {
        beforeLabel: "ANTES",
        beforeValue: existing.beforeValue || "Rebajar",
        afterLabel: "AHORA",
        afterValue: existing.afterValue || "Diseñar",
        brandName: existing.brandName || set.anchorBrand || "Storu",
        tagline: hook,
        accentColor: palette.accent,
        bgColor: palette.bg,
      };
    default:
      return { hook, body, cta, ...base };
  }
}

function detectArchetype(name) {
  const parts = name.split("·").map((p) => p.trim());
  return parts[2] || parts[1] || "Manifesto";
}

async function main() {
  console.log("⏳ Fetching data…");
  const [{ sets }, { reels }] = await Promise.all([
    api("/api/content-sets"),
    api("/api/reels"),
  ]);
  const expSets = sets.filter((s) => s.name.startsWith("EXP-STORU-") && s.reel?.id);
  const reelById = new Map(reels.map((r) => [r.id, r]));

  console.log(`✓ ${expSets.length} sets con reel linkeado`);

  const distribution = {};
  let updated = 0;
  let failed = 0;

  for (const s of expSets) {
    const archetype = detectArchetype(s.name);
    const rotation = TEMPLATE_ROTATION[archetype] || ["TikTokHook", "Typewriter", "PosterSlam"];
    // deterministic by set name within the rotation
    const tpl = rotation[hashInt(s.name) % rotation.length];
    const palette = PALETTES[hashInt(s.name + "pal") % PALETTES.length];
    const bgImage = seededImage(`reel-${s.name}`, 1080, 1920);

    const currentReel = reelById.get(s.reel.id);
    if (!currentReel) { failed++; continue; }

    const props = buildPropsFor(tpl, s, currentReel, palette, bgImage);

    try {
      // Create a new reel (reels aren't editable in place via API, so we create + re-link)
      const newReel = await api("/api/reels", "POST", {
        template: tpl,
        props,
        duration: tpl === "BeforeAfter" ? 8 : tpl === "ViralManifesto60s" ? 60 : 10,
        fps: 30,
        aspectRatio: "9:16",
      });
      await api("/api/content-sets", "PUT", {
        id: s.id,
        piece: "reel",
        updates: { id: newReel.id, status: "ready" },
      });
      distribution[tpl] = (distribution[tpl] || 0) + 1;
      updated++;
      if (updated % 10 === 0) console.log(`  · ${updated}/${expSets.length}`);
    } catch (e) {
      failed++;
      console.error(`✗ ${s.name.slice(0, 40)} · ${e.message}`);
    }
  }

  console.log(`\n═══════════════════════════════════════`);
  console.log(`✓ Updated: ${updated} · ✗ Failed: ${failed}`);
  console.log(`\nTemplate distribution:`);
  Object.entries(distribution)
    .sort((a, b) => b[1] - a[1])
    .forEach(([t, n]) => console.log(`  ${t.padEnd(16)} ${n} reels`));
  console.log(`═══════════════════════════════════════`);
}

main().catch((e) => { console.error(e); process.exit(1); });
