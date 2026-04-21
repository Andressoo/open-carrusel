#!/usr/bin/env node
/**
 * Completes all ContentSets:
 *  - Replaces broken Unsplash Source URLs with working picsum.photos URLs
 *  - Marks all 3 pieces (story/carousel/reel) as "ready"
 *  - Marks the set status as "ready"
 *  - Deletes unused test sets (anything not prefixed EXP-STORU-)
 *
 * Usage:
 *   node scripts/complete-sets.mjs [--delete-tests]
 */

const API = process.env.API_BASE || "http://localhost:3000";
const DELETE_TESTS = process.argv.includes("--delete-tests");

function seededImage(seed, w = 1080, h = 1350) {
  const s = encodeURIComponent(String(seed).slice(0, 40));
  return `https://picsum.photos/seed/${s}/${w}/${h}`;
}

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

async function main() {
  console.log("⏳ Fetching sets…");
  const { sets } = await api("/api/content-sets");
  console.log(`✓ Found ${sets.length} sets total`);

  const expSets = sets.filter((s) => s.name.startsWith("EXP-STORU-"));
  const otherSets = sets.filter((s) => !s.name.startsWith("EXP-STORU-"));
  console.log(`  · ${expSets.length} EXP-STORU sets · ${otherSets.length} other`);

  let updated = 0;
  let pieceMarked = 0;
  let imagesFixed = 0;

  for (const s of expSets) {
    const updates = {};
    let needsUpdate = false;

    // 1. Fix references · swap Unsplash → picsum with seeds based on topic + city
    if (s.references?.length) {
      const fixed = s.references.map((r, i) => {
        if (r.url?.includes("unsplash.com")) {
          imagesFixed++;
          needsUpdate = true;
          const seed = `${s.name}-${r.type}-${i}`;
          const h = r.url.includes("1080x1080") ? 1080 : 1350;
          return { ...r, url: seededImage(seed, 1080, h) };
        }
        return r;
      });
      if (needsUpdate) updates.references = fixed;
    }

    // 2. Mark set status ready
    if (s.status !== "ready") {
      updates.status = "ready";
      needsUpdate = true;
    }

    if (needsUpdate) {
      await api("/api/content-sets", "PUT", { id: s.id, updates });
      updated++;
    }

    // 3. Mark each linked piece as ready
    for (const pieceKey of ["story", "carousel", "reel"]) {
      const p = s[pieceKey];
      if (p?.id && p.status !== "ready") {
        await api("/api/content-sets", "PUT", {
          id: s.id,
          piece: pieceKey,
          updates: { id: p.id, status: "ready" },
        });
        pieceMarked++;
      }
    }
  }

  console.log(`\n✓ Updated ${updated} sets · ${imagesFixed} image URLs fixed · ${pieceMarked} pieces marked ready`);

  if (DELETE_TESTS && otherSets.length) {
    console.log(`\n⚠ Deleting ${otherSets.length} non-EXP sets:`);
    for (const s of otherSets) {
      try {
        await api(`/api/content-sets?id=${s.id}`, "DELETE");
        console.log(`  ✓ deleted ${s.name.slice(0, 50)}`);
      } catch (e) {
        console.error(`  ✗ ${s.name} · ${e.message}`);
      }
    }
  } else if (otherSets.length) {
    console.log(`\n⚠ ${otherSets.length} non-EXP sets found (use --delete-tests to remove):`);
    otherSets.forEach((s) => console.log(`  · ${s.name}`));
  }

  // Final status
  console.log(`\n═══════════════════════════════════════`);
  const final = await api("/api/content-sets");
  const ready = final.sets.filter((s) => s.status === "ready").length;
  const all3ready = final.sets.filter(
    (s) =>
      s.story?.status === "ready" &&
      s.carousel?.status === "ready" &&
      s.reel?.status === "ready"
  ).length;
  console.log(`✓ Total sets:           ${final.sets.length}`);
  console.log(`✓ Set status = ready:   ${ready}`);
  console.log(`✓ 3/3 piezas ready:     ${all3ready}`);
  console.log(`═══════════════════════════════════════`);
}

main().catch((e) => { console.error("FATAL:", e); process.exit(1); });
