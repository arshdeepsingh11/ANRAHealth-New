// Food in My Health Space: quick logging (text and/or photo), Neyu tags each
// meal (not calories) and spots gentle patterns. Never a diagnosis.
import { prisma } from "./db";
import { gemini, geminiJSON, unsafeAiText } from "./ai";
import { dayKey, addDays } from "@/lib/portal/metrics";

export const MEALS = ["breakfast", "lunch", "dinner", "snack", "drink"] as const;
export const FOOD_TAGS = ["vegetables", "fruit", "protein", "fibre", "whole-grain", "dairy", "healthy-fat", "processed", "fried", "sugary", "salty", "water", "caffeine", "alcohol", "home-cooked", "takeout"] as const;

const KW: [string, RegExp][] = [
  ["vegetables", /salad|spinach|broccoli|carrot|veg|sabzi|palak|gobi|bhindi|kale|pepper|tomato|cucumber|lettuce|beans|okra|cauliflower/i],
  ["fruit", /apple|banana|berr|orange|mango|grape|fruit|kiwi|pear|melon/i],
  ["protein", /chicken|egg|fish|salmon|tuna|paneer|tofu|lentil|dal|chana|rajma|beef|turkey|yogurt|greek|protein|beans|chickpea|shrimp/i],
  ["fibre", /oat|lentil|dal|bean|chickpea|quinoa|brown rice|whole|bran|chia|flax|rajma|chana/i],
  ["whole-grain", /oat|quinoa|brown rice|whole wheat|whole grain|multigrain|roti|chapati|barley/i],
  ["dairy", /milk|cheese|yogurt|curd|dahi|paneer|lassi/i],
  ["healthy-fat", /avocado|nuts|almond|walnut|olive oil|seeds/i],
  ["processed", /chips|instant|frozen|sausage|bacon|hot dog|nugget|packaged|crackers/i],
  ["fried", /fried|fries|pakora|samosa|bhatura|tempura|donut|doughnut/i],
  ["sugary", /cake|cookie|candy|chocolate|soda|pop|coke|dessert|ice cream|sweet|jalebi|gulab|donut|juice/i],
  ["water", /water/i], ["caffeine", /coffee|tea|chai|espresso|latte|energy drink/i], ["alcohol", /beer|wine|whisky|vodka|rum|cocktail|alcohol/i],
  ["takeout", /pizza|burger|mcdonald|takeout|take-out|delivery|restaurant|subway|kfc|tim hortons/i],
];
export const keywordTags = (t: string) => KW.filter(([, re]) => re.test(t)).map(([k]) => k);

export async function tagMeal(text: string, photo?: { mime: string; b64: string }) {
  const sys = `You tag meals for a personal health journal. Return JSON only: {"description": a short plain description of the food (max 80 chars), "tags": array chosen ONLY from ${JSON.stringify(FOOD_TAGS)}}. No calories, no judgement.`;
  const parts: any[] = [{ text: text ? `Meal: ${text}` : "Describe and tag the food in this photo." }];
  if (photo) parts.push({ inline_data: { mime_type: photo.mime, data: photo.b64 } });
  const r = await geminiJSON<{ description?: string; tags?: string[] }>(sys, parts, { maxTokens: 200, timeoutMs: 15_000 });
  const tags = r?.tags?.filter((t) => (FOOD_TAGS as readonly string[]).includes(t)) || keywordTags(text);
  return { description: (r?.description || "").slice(0, 120), tags: [...new Set(tags)] };
}

type Log = { id: string; day: string; at: Date; meal: string; text: string; portion: string | null; tags: string; photoMime: string | null };

export function patterns(logs: Log[], today: string) {
  const wk = logs.filter((l) => l.day > addDays(today, -7));
  const share = (re: RegExp) => (wk.length ? Math.round((wk.filter((l) => re.test(l.tags)).length / wk.length) * 100) : 0);
  const days = new Set(wk.map((l) => l.day)).size;
  return {
    meals7: wk.length, daysLogged7: days,
    plants: share(/vegetables|fruit/), protein: share(/protein/), fibre: share(/fibre|whole-grain/), processed: share(/processed|fried|sugary/),
    breakfastDays: new Set(wk.filter((l) => l.meal === "breakfast").map((l) => l.day)).size,
    water: wk.filter((l) => /water/.test(l.tags)).length,
  };
}

/** One calm sentence or two about this week's eating, cached per day. */
export async function foodNote(p: { id: string; firstName: string; timezone: string }, logs: Log[], pat: ReturnType<typeof patterns>, goals: string[]) {
  const today = dayKey(new Date(), p.timezone);
  if (pat.meals7 < 3) return null;
  const cached = await prisma.generatedNote.findUnique({ where: { patientId_kind_period: { patientId: p.id, kind: "food", period: today } } });
  if (cached) { try { return JSON.parse(cached.body).text as string; } catch {} }
  const recent = logs.filter((l) => l.day > addDays(today, -7)).map((l) => `${l.day} ${l.meal}: ${l.text} [${JSON.parse(l.tags || "[]").join(", ")}]`).join("\n");
  const sys = `You are Neyu, a calm health companion. Write 2 short sentences about this person's eating pattern this week: one thing going well, one small, practical idea. General guidance only, no calories, no diagnosis, no supplements or medication. Plain text.`;
  let text = await gemini(sys, `Goals: ${goals.join(", ") || "none set"}\nThis week: ${pat.meals7} meals; ${pat.plants}% with fruit or vegetables; ${pat.protein}% with protein; ${pat.fibre}% with fibre; ${pat.processed}% processed, fried or sugary.\n${recent}`, { maxTokens: 160 });
  if (!text || unsafeAiText(text)) text = pat.plants >= 50 ? `Fruit or vegetables showed up in ${pat.plants}% of your meals this week — a good base. Adding a protein to breakfast is an easy next step.` : `You logged ${pat.meals7} meals this week. Adding one more serving of vegetables or fruit a day is a simple place to start.`;
  await prisma.generatedNote.upsert({ where: { patientId_kind_period: { patientId: p.id, kind: "food", period: today } }, create: { patientId: p.id, kind: "food", period: today, body: JSON.stringify({ text }) }, update: { body: JSON.stringify({ text }) } }).catch(() => {});
  return text;
}
