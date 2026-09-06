import { test, expect } from "@playwright/test";

test("homepage loads and graph renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Healthcare Designed Around You")).toBeVisible();
  await expect(page.getByText("Your Health,")).toBeVisible();
  await expect(page.locator("text=Application error")).toHaveCount(0);
});

test("persistent action buttons are visible", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Referral Centre")).toBeVisible();
  await expect(page.getByText("Contact")).toBeVisible();
  await expect(page.getByText("Locations")).toBeVisible();
  await expect(page.getByText("Patient Resources")).toBeVisible();
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

test("ALBA opens and shows greeting", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Open ALBA").click();
  await expect(page.getByText("Hi, I'm ALBA")).toBeVisible();
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
  await expect(page.getByPlaceholder(/Tell us what's going on/i)).toBeVisible();
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