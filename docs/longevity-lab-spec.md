# ANRA Longevity Lab — Product & Content Spec

**Live route:** `/longevity-lab` (tabs deep-link via hash: `#respond` `#stress` `#pace` `#pgx` `#genes` `#library` `#alba`)
**Code:** `src/data/longevityScience.ts` (all facts/numbers) · `src/components/lab/*` (UI) · `src/app/api/assess/route.ts` (AI intake)
**Tests promoted (BioAro Labs, CAD):** GDF-15 $130 · Telomere Length $299 · Core Inflammation Aging $489.99 · Advanced Inflammation Aging $699.99 · Pharmacogenomics $499 · WGS 30X $699 · WGS 100X $1,499
**Primary CTA everywhere:** Book an ANRA longevity consultation → `/contact?topic=longevity`

Global rules: education only, no diagnosis, no risk percentages, never advise starting/stopping/changing medicines; 911 guidance on emergency wording (client + server). Research describes groups, not individuals.

---

## 1. Intervention Responsiveness Explorer (`#respond`)

**A. What it is** — An interactive tour of which diets, habits and treatments actually shifted biological-aging clocks across 51 human studies.

**B. User flow**
1. See four KPIs (51 studies · 3,128 samples · 16 clocks · 19 significant interventions).
2. Compare bar charts: average effect by type (medication vs lifestyle) and by clock.
3. Filter intervention cards (Lifestyle / Medication / Procedure / Supplement) and tap the ones that apply.
4. Press "ALBA: what does this mean for me?" and get a personalised explanation.
5. See the matched tests and book a consultation.

**C. Educational points**
- TranslAGE: 51 studies, 3,128 samples, 16 epigenetic clocks + 94 biomarkers.
- 19 interventions significantly lowered epigenetic age (13 after multiple-testing correction).
- DunedinPACE fell in 16 of them and rose in 1. PCGrimAge was the most robust.
- Mean effect: drugs −0.093 vs lifestyle −0.039. Diet changes were the most consistent.
- Strong responders: anti-TNF, metformin, Mediterranean diets, smoking cessation, hyperbaric oxygen. Supplements were weaker on average.
- People with existing disease showed larger responses.
- Gen-2+ clocks responded consistently; Gen-1 clocks (Horvath, Hannum) only sporadically.

**D. How ALBA speaks** — Calm and evidence-first: "In this 2026 analysis, Mediterranean-style diets were among the most consistent changes…" It never says an intervention will make *you* younger, and it frames medicines as physician decisions.

**E. CTAs** — Book consultation · Core / Advanced Inflammation Aging · GDF-15 · Telomere Length · Ask ALBA.

**F. Visuals** — KPI count-ups, animated horizontal bars (type, clock), selectable intervention cards, gradient ALBA button.

**G. Disclaimers**
- Medications and procedures are clinical decisions.
- The clocks in the study are research-grade methylation tests. BioAro panels measure *related* aging biology (inflammation, cellular stress, telomeres), not these clocks.

## 2. GDF-15 + Telomere Cellular Stress Map (`#stress`)

**A. What it is** — A 3D chromosome that shows how a cellular stress signal (GDF-15) and chromosome caps (telomeres) move together.

**B. User flow**
1. Drag the stress slider: telomere caps shrink and red GDF-15 particles increase (illustrative).
2. Read the key findings.
3. Answer the 5-item FRAIL check and get a score band.
4. Ask ALBA about the result, then use the combined test CTA.

**C. Educational points**
- Yu 2025 (n = 802, mean age 55.4): higher GDF-15 was linked to shorter leukocyte telomeres after adjustment (β −0.120, p = 0.003). The relationship was linear.
- The link was stronger in women, in people with overweight, and in people with abnormal glucose tolerance.
- The study is cross-sectional.
- Lee 2026 (35 studies): GDF-15 was consistently linked to frailty and worse physical performance, and predicted decline. The sarcopenia link was less consistent, and exercise changed GDF-15 minimally.

**D. How ALBA speaks** — Says "linked with", not "causes". It explains a FRAIL score band and suggests discussing a score of 3 or more with a physician.

**E. CTAs** — GDF-15 ($130) + Telomere Length ($299) together · Book consultation · Explain with ALBA.

**F. Visuals** — Canvas 3D chromosome (drag to rotate), stress slider, FRAIL checklist with a live score band, KPIs.

**G. Disclaimers** — Illustrative model, not your data. These are associations, not proof of cause. FRAIL is a screening scale, not a diagnosis.

## 3. Pace of Aging vs Biological Age Comparator (`#pace`)

**A. What it is** — An odometer-vs-speedometer explainer: biological age is how much wear has built up; pace of aging is how fast it's building now.

**B. User flow**
1. Set your age and a pace (0.40–2.44×).
2. Watch the speedometer, the 20-year projection chart and the "you'd be ~X biologically" sentence update.
3. Review outcome ratios and the related facts.
4. Use the CTA.

**C. Educational points**
- Dunedin Study: 1,037 people followed from age 26 to 45, 19 biomarkers.
- Pace ranged from 0.40 to 2.44 biological years per year. Test–retest ICC was 0.96–0.97.
- Framingham (per 1 SD faster): death HR 1.65, disability 1.40, CVD 1.39, stroke/TIA 1.37.
- Childhood adversity was linked to faster pace.
- DunedinPACE fell in 16 interventions in the 2026 analysis, so pace can change.

**D. How ALBA speaks** — Uses the analogy and explains that pace clocks are research tools. It connects drivers you can measure today to pace without claiming to measure pace directly.

**E. CTAs** — Advanced Inflammation Aging · GDF-15 · Telomere Length · Book consultation.

**F. Visuals** — SVG speedometer, area chart (biological vs calendar), outcome-ratio bars, KPI cards.

**G. Disclaimers** — The projection is illustrative, not a measurement. BioAro does not sell DunedinPACE.

## 4. Pharmacogenomics Longevity Safety Check (`#pgx`)

**A. What it is** — Pick the medicines you take and see which of your genes shape how they work. The value grows with age and with the number of medicines.

**B. User flow**
1. Tick medicines from 10 CPIC-guided drug–gene pairs.
2. Set the number of other regular medicines.
3. Watch the gene wheel light up and the polypharmacy meter fill (5+ = polypharmacy).
4. Ask ALBA, then use the PGx CTA.

**C. Educational points**
- Well-established pairs:
  - CYP2C19: clopidogrel, SSRIs, PPIs.
  - CYP2C9 + VKORC1: warfarin.
  - SLCO1B1: statins.
  - CYP2D6: codeine/tramadol, ondansetron, tamoxifen.
  - CYP2C9: NSAIDs.
- Most people carry at least one actionable variant.
- ASPREE older-adult cohort (Bousman 2025). **Exact percentages still need verifying against the full paper; the publisher page was blocked.**

**D. How ALBA speaks** — Explains the "one test, lifelong reference" idea and always repeats: never change medicines on your own.

**E. CTAs** — Pharmacogenomics Test ($499) · Book consultation.

**F. Visuals** — Selectable medicine list, animated SVG gene wheel, 12-segment polypharmacy meter.

**G. Disclaimers** — Warning callout: "Never stop, start or change a medicine because of a gene result or this tool. Your prescriber decides."

## 5. Longevity Genetics Pathway Visualizer (`#genes`)

**A. What it is** — A 3D DNA helix with glowing, clickable nodes for the pathways enriched in centenarians' genomes.

**B. User flow**
1. Tap a node or chip to see the pathway explanation.
2. See the loss-of-function burden bar and cohort KPIs.
3. Read "what sequencing can and can't tell you".
4. Use the WGS CTA.

**C. Educational points**
- Ying 2024 cohort: 338 centenarians, 917 offspring, 595 controls (Ashkenazi Jewish).
- Centenarians carried 11–22% fewer rare loss-of-function variants.
- 35 genes identified, 14 replicated in UK Biobank.
- Enriched pathways: GPCR signalling, hyaluronan, post-translational modification, mitochondrial translation.

**D. How ALBA speaks** — Explains the pathways simply and is explicit that WGS cannot predict lifespan. It explains 30X vs 100X depth.

**E. CTAs** — WGS 30X ($699) · WGS 100X ($1,499) · Book consultation.

**F. Visuals** — Canvas 3D helix (drag, tap nodes), pathway detail card, burden bars, KPIs.

**G. Disclaimers** — Single-ancestry study with predicted variant effects. Results are revisited by a physician as science advances.

---

## Shared components

- **AI intake** (`<Assessment kind="lab">`) — about 2 minutes, 3 steps:
  - Questions: age, sex, height/weight/waist, diet, smoking, activity minutes, FRAIL items, medicines, conditions, family history, curiosity.
  - Output: a ranking of the 5 features and tests, plus an ALBA write-up via `/api/assess` (rules fallback without AI).
- **Upgraded quizzes:**
  - `/longevity` → `<Assessment kind="longevity">`: scored against Canadian guidelines (24-h movement, Food Guide, alcohol 2023, Hypertension Canada, Diabetes Canada).
  - `/genomics` "Find My Test" → `<Assessment kind="genomics">`.
- **Research Library** — a 3D page-turning book, one chapter per paper. Each chapter covers the study, what it found, what it means, what it doesn't mean, and a link to the matching feature.
- **ALBA** — the papers and Lab docs are indexed in `backend/albaKnowledge.ts`; the page context label is `/longevity-lab`.

## Ranking (impact × feasibility)

| Rank | Feature | Why | Revenue link |
|---|---|---|---|
| 1 | Pharmacogenomics Safety Check | Immediate personal relevance (people already take these drugs); strongest clinical evidence (CPIC) | PGx $499 + consult |
| 2 | GDF-15 + Telomere Stress Map | Clear two-test bundle; concrete FRAIL self-check | $130 + $299 |
| 3 | Pace vs Biological Age | Most intuitive concept; drives inflammation-panel interest | Inflammation panels, GDF-15, telomere |
| 4 | Intervention Responsiveness | Newest, high-authority paper (Nature Medicine 2026); motivates baseline + re-test | Inflammation panels (repeat testing) |
| 5 | Longevity Genetics Pathways | Highest wow factor, highest ticket, but weakest individual actionability | WGS $699 / $1,499 |

## Sources

- Sehgal R et al. Nature Medicine 2026 — https://www.nature.com/articles/s41591-026-04562-9
- Belsky DW et al. eLife 2022 — https://elifesciences.org/articles/73420
- Yu J et al. J Nutr Health Aging 2025 — https://pubmed.ncbi.nlm.nih.gov/39904253
- Lee ARYB et al. Ageing Research Reviews 2026 — https://pubmed.ncbi.nlm.nih.gov/41785972
- Ying K et al. Nature Communications 2024 — https://www.nature.com/articles/s41467-024-52967-2
- Bousman CA et al. Clin Pharmacol Ther 2025 — https://doi.org/10.1002/cpt.3702 (**full text not accessible; figures pending verification**)
