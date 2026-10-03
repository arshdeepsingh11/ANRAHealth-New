import { test, expect } from "@playwright/test";

// Skip the first-visit intro video + Neyu spotlight so tests reach the page itself.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("anra_video_seen", "1");
    sessionStorage.setItem("anra_alba_intro_seen", "1");
  });
});

test("homepage loads with hero and health map", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Healthcare designed around");
  await expect(page.getByText("Your Health, One Record").first()).toBeVisible();
  await expect(page.locator("text=Application error")).toHaveCount(0);
});

test("navigation rail is visible with all sections", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Primary" });
  await expect(nav).toBeVisible();
  for (const label of ["Care", "Diagnostics", "Precision Health", "Longevity", "AI Health", "Referral Centre", "More", "Search"]) {
    await expect(nav.getByRole("button", { name: label, exact: true })).toBeVisible();
  }
});

test("Cardiology page loads with all tabs", async ({ page }) => {
  await page.goto("/specialties/cardiology");
  await expect(page.getByRole("heading", { name: "Cardiology" })).toBeVisible();
  for (const tab of ["Overview", "Services", "Physicians", "Cardiac Symptoms", "About", "Contact"]) {
    await expect(page.getByRole("button", { name: tab })).toBeVisible();
  }
});

test("Skin Health page loads", async ({ page }) => {
  await page.goto("/specialties/skin-health");
  await expect(page.getByRole("heading", { name: "Skin Health" })).toBeVisible();
});

test("Respiratory Medicine page loads", async ({ page }) => {
  await page.goto("/specialties/respiratory-medicine");
  await expect(page.getByRole("heading", { name: "Respiratory Medicine" })).toBeVisible();
});

test("Contact page has no old navbar", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.getByText("Send us a message")).toBeVisible();
  await expect(page.getByText("Physicians")).toHaveCount(0);
});

test("Referral Centre form loads and PDF button exists", async ({ page }) => {
  await page.goto("/referral-centre");
  await expect(page.getByText("Manual Referral")).toBeVisible();
  await expect(page.getByRole("button", { name: /Download Referral PDF/i })).toBeVisible();
});

test("Neyu opens and shows greeting", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Open Neyu").click();
  const panel = page.getByRole("dialog", { name: "Neyu" });
  await expect(panel).toBeVisible();
  await expect(panel.getByText("Your health companion.")).toBeVisible();
});

test("emergency keywords open the safety screen before any AI call", async ({ page }) => {
  await page.goto("/");
  await page.locator("#concierge").fill("I have crushing chest pain");
  await page.getByRole("button", { name: "Ask", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Please seek urgent medical care." })).toBeVisible();
  await expect(page.getByRole("link", { name: /CALL 911/ })).toHaveAttribute("href", "tel:911");
});

test("test gallery hands off to the exact BioAro Labs product page", async ({ page }) => {
  await page.goto("/");
  const gallery = page.locator("#gallery");
  await gallery.scrollIntoViewIfNeeded();
  // Hovering the carousel pauses its auto-advance (design behaviour).
  await gallery.locator("article").first().hover({ force: true });
  await page.waitForTimeout(800);
  await gallery.locator("article:has(anra-electro)").click({ force: true });
  await page.getByRole("button", { name: /Get this test/i }).click();
  await expect(page.getByRole("link", { name: /Continue to BioAro Labs/i })).toHaveAttribute("href", /^https:\/\/bioarolabs\.com\/product\//);
});

test("no console errors on homepage", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));
  await page.goto("/");
  await page.waitForTimeout(2000);
  expect(errors).toEqual([]);
});

// ─────────────────────────────────────────────────────────────────
// New tests — Referral Centre: Automatic Referral (text + scan)
// ─────────────────────────────────────────────────────────────────

test("Referral Centre shows Automatic Referral with text and scan options", async ({ page }) => {
  await page.goto("/referral-centre");
  await expect(page.getByText("Automatic Referral")).toBeVisible();
  await expect(page.getByRole("button", { name: /Auto-fill from text/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Scan a referral photo/i })).toBeVisible();
});

test("Referral Centre shows Get My Visit Prep Guide button", async ({ page }) => {
  await page.goto("/referral-centre");
  await expect(page.getByRole("button", { name: /Get My Visit Prep Guide/i })).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────
// New tests — Longevity page (both tabs)
// ─────────────────────────────────────────────────────────────────

test("Longevity page loads with both tabs", async ({ page }) => {
  await page.goto("/longevity");
  await expect(page.getByRole("heading", { name: "Longevity" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Health Risk Assessment" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Nutrition Starter Plan" })).toBeVisible();
});

test("Longevity Health Risk Assessment tab shows quiz questions", async ({ page }) => {
  await page.goto("/longevity");
  await expect(page.getByText("Age range")).toBeVisible();
  await expect(page.getByText("Smoking status")).toBeVisible();
});

test("Longevity Nutrition Starter Plan tab shows quiz questions", async ({ page }) => {
  await page.goto("/longevity");
  await page.getByRole("button", { name: "Nutrition Starter Plan" }).click();
  await expect(page.getByText("Primary goal")).toBeVisible();
  await expect(page.getByText("Nea Precision Nutrition")).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────
// New tests — Lab Result Explainer
// ─────────────────────────────────────────────────────────────────

test("Lab Result Explainer page loads with text and scan options", async ({ page }) => {
  await page.goto("/lab-results");
  await expect(page.getByRole("heading", { name: "Lab Result Explainer" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Explain My Results/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Scan a lab report photo/i })).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────
// New tests — Genomics page (all 4 tabs)
// ─────────────────────────────────────────────────────────────────

test("Genomics page loads with all tabs", async ({ page }) => {
  await page.goto("/genomics");
  await expect(page.getByRole("heading", { name: "Genomics" })).toBeVisible();
  for (const tab of ["Overview", "Available Tests", "Find My Test", "Contact"]) {
    await expect(page.getByRole("button", { name: tab })).toBeVisible();
  }
});

test("Genomics Available Tests tab shows real BioAro Labs tests", async ({ page }) => {
  await page.goto("/genomics");
  await page.getByRole("button", { name: "Available Tests" }).click();
  await expect(page.getByText("Telomere Length Testing")).toBeVisible();
  await expect(page.getByText("Whole Genome Sequencing 100x")).toBeVisible();
  await expect(page.getByText("The BioGut Test")).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────
// New tests — Homepage Concierge bar
// ─────────────────────────────────────────────────────────────────

test("Homepage shows concierge search bar", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByPlaceholder(/Tell us what.s going on/i)).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────
// New tests — Admin dashboard security (critical path)
// ─────────────────────────────────────────────────────────────────

test("Admin dashboard redirects to login when not authenticated", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByPlaceholder("Password")).toBeVisible();
});

test("Admin login rejects wrong password", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByPlaceholder("Password").fill("definitely-wrong-password");
  await page.getByRole("button", { name: /Log In/i }).click();
  await expect(page.getByText("Incorrect password.")).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────
// New tests — Symptom Checker on both specialty pages
// ─────────────────────────────────────────────────────────────────

test("Symptom Checker present on Cardiology page", async ({ page }) => {
  await page.goto("/specialties/cardiology");
  await page.getByRole("button", { name: "Cardiac Symptoms" }).click();
  await expect(page.getByText("AI Symptom Checker")).toBeVisible();
  await expect(page.getByRole("button", { name: /Check My Symptoms/i })).toBeVisible();
});

test("Symptom Checker present on Respiratory page with respiratory-specific placeholder", async ({ page }) => {
  await page.goto("/specialties/respiratory-medicine");
  await page.getByRole("button", { name: "Respiratory Diagnostics" }).click();
  await expect(page.getByText("AI Symptom Checker")).toBeVisible();
  await expect(page.getByPlaceholder(/waking up gasping/i)).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────
// New test — Referral Centre free-text physician matcher (Cardiology)
// ─────────────────────────────────────────────────────────────────

test("Cardiology Physicians tab shows free-text matcher", async ({ page }) => {
  await page.goto("/specialties/cardiology");
  await page.getByRole("button", { name: "Physicians", exact: true }).click();
  await expect(page.getByText("Describe Your Concern")).toBeVisible();
  await expect(page.getByRole("button", { name: /Find my physician/i })).toBeVisible();
});