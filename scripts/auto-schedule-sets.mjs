#!/usr/bin/env node
/**
 * Auto-schedule all ContentSets that don't have a publishDate yet.
 * Distributes them across upcoming weekdays (Tue, Wed, Thu) · best-performing
 * days for carousels on IG in Colombian market.
 *
 * Usage:
 *   node scripts/auto-schedule-sets.mjs [--days N] [--start YYYY-MM-DD]
 */

const API = process.env.API_BASE || "http://localhost:3000";

const daysArg = process.argv.find((a) => a.startsWith("--days="));
const startArg = process.argv.find((a) => a.startsWith("--start="));
const cadenceDays = daysArg ? parseInt(daysArg.split("=")[1]) : 2;
const startDate = startArg ? new Date(startArg.split("=")[1]) : nextWeekdayFrom(new Date());

function nextWeekdayFrom(d) {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + 1);
  while (dt.getDay() === 0 || dt.getDay() === 6) dt.setDate(dt.getDate() + 1);
  return dt;
}

function nextPublishDate(cursor) {
  const dt = new Date(cursor);
  dt.setDate(dt.getDate() + cadenceDays);
  // skip weekends
  while (dt.getDay() === 0 || dt.getDay() === 6) dt.setDate(dt.getDate() + 1);
  return dt;
}

async function main() {
  console.log("⏳ Fetching sets…");
  const res = await fetch(`${API}/api/content-sets`);
  const { sets } = await res.json();

  // Only schedule sets that have at least 1 piece linked and no publishDate
  const candidates = sets
    .filter((s) => !s.publishDate)
    .filter((s) => s.story?.id || s.carousel?.id || s.reel?.id)
    .sort((a, b) => a.name.localeCompare(b.name));

  console.log(`✓ ${candidates.length} sets to schedule · starting ${startDate.toISOString().slice(0, 10)} · cadence ${cadenceDays}d`);

  let cursor = new Date(startDate);
  let scheduled = 0;

  for (const s of candidates) {
    const iso = cursor.toISOString().slice(0, 10);
    try {
      await fetch(`${API}/api/content-sets`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: s.id,
          updates: { publishDate: iso, status: "scheduled" },
        }),
      });
      scheduled++;
      const dayName = cursor.toLocaleDateString("es-CO", { weekday: "short" });
      console.log(`  ${iso} (${dayName}) · ${s.name.slice(0, 60)}`);
    } catch (e) {
      console.error(`  ✗ ${s.name} · ${e.message}`);
    }
    cursor = nextPublishDate(cursor);
  }

  console.log(`\n✓ Scheduled ${scheduled} sets across ${Math.ceil(scheduled * cadenceDays / 5) + 1} weeks`);
}

main().catch((e) => { console.error(e); process.exit(1); });
