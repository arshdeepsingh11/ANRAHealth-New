# NEYU version (branch `ceo-concept`)

Built from the CEO brief: *"Don't make the homepage a catalogue. Communicate one idea —
NEYU connects the pieces of your health so you can understand what matters and what to do next."*

## Brand architecture
- **Proposition:** Your Health, Connected.
- **Philosophy:** Listen · Connect · Flourish
- **Three pillars:** Understand · Connect · Flourish
- **Four care pillars:** Care · Diagnostics · Prevention · Longevity
- **One companion:** the AI is now called **Neyu** (it was ALBA). The AI is presented as the interface, and understanding is the product.
- **Visual language:** Japanese-inspired minimalism with premium health technology:
  - lots of white space and a limited palette (navy plus the NEYU green, teal and blue)
  - flowing connection lines, live node networks and live charts
  - Neyu in every section

## Homepage (`/`)
1. Hero — Your Health, Connected. Includes Ask Neyu (answers stream in), a live network (Person → Biology → Data → Neyu → Insight → Care → Life) and stats.
2. Health is connected — an interactive body network. Tap an organ and Neyu explains how it links to the others.
3. One health record — five layers (Records, Diagnostics, Biology, Lifestyle, Environment), each with a live chart and an example of how Neyu connects them.
4. Understand what your health is telling you — four tabs: Ask, Explore patterns, Understand results, Know what to discuss.
5. From reactive care to proactive health — the four pillars, plus Explore all services.
6. Personalized by your biology — a 3D helix: Genomics • Biomarkers • Microbiome • Lifestyle • Wearables.
7. Meet Neyu — what Neyu can do, plus "How NEYU works" (Identity → Record → Intelligence → Care → Prevention → Longevity).
8. Your health journey over time — a 12-month trend for blood pressure, LDL, sleep or steps, with points where Neyu noticed something.
9. The NEYU model — Understand → Discover → Connect → Act → Improve.
10. New services, then Listen · Connect · Flourish, then the final call to action.

## Pages
| Route | What it is |
|---|---|
| `/care` | Care hub: specialty network, AI care navigator, ways to get care, 9 specialties, physician languages |
| `/diagnostics` | Diagnostics hub: lab testing, imaging & monitoring, genomics; AI "find my test"; featured lab tests |
| `/prevention` | Prevention hub: risk-factor network, AI risk assessment, BP/BMI/HbA1c checks, biology, packages |
| `/longevity` | Longevity hub: Assess → Understand → Personalize → Improve, longevity score (a feature), Longevity Lab |
| `/neyu` | Meet Neyu: full chat, capabilities, how NEYU works, safety |
| `/virtual-care` | **New** — telehealth: how it works, what suits a virtual visit, visit request |
| `/hypertension-clinic` | **New** — Virtual Hypertension Clinic: home-reading log with 7-reading average, program, enrolment |
| `/packages` | **New** — Private Health Packages + Executive Health (`#executive`): package finder, contents, request |
| `/membership` | **New** — Essential / Plus / Executive tiers, comparison table, a year with NEYU, request form |
| `/at-home` | **New** — At-home blood collection: steps, area check, tests with prices, booking request |
| `/explore` | Explore all services: searchable directory by pillar |

## Navigation
- **Desktop rail:** Care · Diagnostics · Prevention · Longevity · Neyu · More.
- **Where the old content went:** the specialty, diagnostic and tool lists now sit under the pillars. Nothing was deleted.

## Backend
- **New table `ServiceRequest`:** stores requests for virtual care, the hypertension clinic, packages, membership and at-home collection. Run `npx prisma db push` once.
- **New route `POST /api/requests`:** validated, rate-limited, and emergency-checked.
- **Admin → Service requests:** status counts, filters, a status change on each row (audited) and request details.
- **Neyu's knowledge now covers:**
  - the four pillars and the new services
  - the package contents (BioAro list prices)
  - the membership tiers
  - how the hypertension program and virtual care work
- **Concierge routing:** now covers the new services.

## Notes for the CEO / team
- **Membership:** no prices are published. Pages say "pricing shared on request".
- **Packages:** clinic-service prices are quoted by the team. Lab prices are real BioAro list prices.
- **Nothing is booked or charged online.** Every request goes to admin for staff follow-up.
