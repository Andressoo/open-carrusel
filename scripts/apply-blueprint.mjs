#!/usr/bin/env node
/**
 * Aplica docs/sets-blueprint.ts a los sets existentes.
 * Updatea por cada set:
 *  - thread (con framework + justificación)
 *  - possibleCaptions (derivado del reel body y rationale)
 *  - ctaFlow en sceneDetails (explicación de flujo)
 *  - references (1 imagen Unsplash hero curada)
 * Y reescribe la story + reel linkeados con el guión del blueprint.
 *
 * Usage:
 *   node scripts/apply-blueprint.mjs
 */

const API = process.env.API_BASE || "http://localhost:3000";

// Dynamic import of the TS blueprint via tsx
import { BLUEPRINT } from "../docs/sets-blueprint.mjs";

async function api(path, method = "GET", body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status} · ${text.slice(0, 200)}`);
  try { return JSON.parse(text); } catch { return text; }
}

function matchBlueprintToSet(blueprint, sets) {
  // match by D-number prefix in name
  const target = blueprint.id;
  return sets.find((s) => s.name.includes(`· ${target} ·`) || s.name.includes(target + " ·"));
}

async function main() {
  console.log("⏳ Fetching sets + stories + reels…");
  const [{ sets }, { stories }, { reels }] = await Promise.all([
    api("/api/content-sets"),
    api("/api/stories"),
    api("/api/reels"),
  ]);

  const storyById = new Map(stories.map((s) => [s.id, s]));
  const reelById = new Map(reels.map((r) => [r.id, r]));

  let updated = 0, storyUpdated = 0, reelUpdated = 0, missing = 0;

  for (const bp of BLUEPRINT) {
    const set = matchBlueprintToSet(bp, sets);
    if (!set) { missing++; console.warn(`✗ ${bp.id} no encontrado`); continue; }

    // 1. Build rich thread with framework + why
    const thread = `Framework: ${bp.framework} · ${bp.frameworkWhy}\n\nHistoria (${bp.story.dynamic}): ${bp.story.text} → ${bp.story.why}\n\nCarrusel (5 slides):\n${bp.carousel.slides.map((s, i) => `  ${i + 1}. ${s.text}\n     ↳ ${s.why}`).join("\n")}\n\nReel (${bp.reel.template}): "${bp.reel.hook}" → "${bp.reel.body}" → "${bp.reel.cta}"\n↳ ${bp.reel.why}\n\nFlujo CTA: ${bp.ctaFlow}`;

    // 2. Derive captions from blueprint (5 variations)
    const captions = [
      `${bp.carousel.slides[0].text}\n\n${bp.reel.cta}`,
      `${bp.reel.hook}\n\n${bp.reel.body}\n\n${bp.reel.cta}`,
      `${bp.carousel.slides[2]?.text || bp.carousel.slides[1].text}\n\n${bp.reel.cta}`,
      `Framework: ${bp.framework}. ${bp.frameworkWhy}\n\n${bp.reel.cta}`,
      `${bp.ctaFlow}\n\n${bp.reel.cta}`,
    ];

    // 3. Replace main hero reference with curated image
    const references = [
      { url: bp.image, type: "hero", name: `Hero · ${bp.city} · ${bp.archetype}` },
      { url: bp.image.replace("w=1080", "w=1080&h=1080&fit=crop"), type: "square", name: "Square crop" },
      { url: bp.image.replace("w=1080", "w=1080&h=1920&fit=crop"), type: "story", name: "9:16 crop" },
    ];

    // 4. Update the set
    const sceneDetails = `${bp.framework} · ${bp.city} · ${bp.anchorBrand}\n\nFlujo de publicación: ${bp.ctaFlow}\n\nPor qué este framework: ${bp.frameworkWhy}`;

    await api("/api/content-sets", "PUT", {
      id: set.id,
      updates: {
        thread,
        possibleCaptions: captions,
        references,
        sceneDetails,
        ctaKeyword: bp.ctaKeyword,
        anchorBrand: bp.anchorBrand,
      },
    });
    updated++;

    // 5. Rewrite the linked story
    if (set.story?.id && storyById.has(set.story.id)) {
      const newStory = await api("/api/stories", "POST", {
        dynamic: bp.story.dynamic,
        text: bp.story.text,
        options: bp.story.options,
        accentColor: "#F8C644",
        bgColor: "#0E0D12",
        setId: set.id,
        bgImage: bp.image,
      });
      await api("/api/content-sets", "PUT", {
        id: set.id, piece: "story",
        updates: { id: newStory.id, status: "ready" },
      });
      storyUpdated++;
    }

    // 6. Rewrite the linked reel with blueprint script + bgImage
    if (set.reel?.id && reelById.has(set.reel.id)) {
      const props = {
        hook: bp.reel.hook,
        body: bp.reel.body,
        cta: bp.reel.cta,
        accentColor: "#F8C644",
        bgColor: "#0E0D12",
        textColor: "#FFFFFF",
        bgImage: bp.image,
      };
      const newReel = await api("/api/reels", "POST", {
        template: bp.reel.template,
        props,
        duration: bp.reel.template === "BeforeAfter" ? 8 : 10,
        fps: 30,
        aspectRatio: "9:16",
      });
      await api("/api/content-sets", "PUT", {
        id: set.id, piece: "reel",
        updates: { id: newReel.id, status: "ready" },
      });
      reelUpdated++;
    }

    if (updated % 10 === 0) console.log(`  · ${updated}/${BLUEPRINT.length}`);
  }

  console.log(`\n═══════════════════════════════════════`);
  console.log(`✓ Sets updated:    ${updated}`);
  console.log(`✓ Stories rewrote: ${storyUpdated}`);
  console.log(`✓ Reels rewrote:   ${reelUpdated}`);
  console.log(`✗ Missing:         ${missing}`);
  console.log(`═══════════════════════════════════════`);
}

main().catch((e) => { console.error("FATAL:", e); process.exit(1); });
