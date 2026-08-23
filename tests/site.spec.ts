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