import { test, expect } from "@playwright/test";

test.describe.configure({ mode: "serial" });

test.describe("RSVP plus-one guest count flow", () => {
  test("?noi=2 pre-fills guest count and submits two guests", async ({ page }) => {
    await page.goto("/events/triple-celebration?noi=2");

    const iframe = page.locator("iframe[title='Triple Celebration']");
    await expect(iframe).toBeVisible();

    const iframeBody = iframe.contentFrame().locator("body");

    const plusOne = iframeBody.locator("#plusOne");
    await expect(plusOne).toBeChecked();

    const guestCount = iframeBody.locator("#guestCount");
    await expect(guestCount).toHaveValue("2");
    await expect(guestCount).toHaveAttribute("max", "2");

    await expect(iframeBody.locator("#__guest_guests_1")).toBeVisible();
    await expect(iframeBody.locator("#__guest_guests_2")).toBeVisible();

    const timestamp = Date.now();
    await iframeBody.locator("#title").fill("Mr");
    await iframeBody.locator("#fullname").fill(`E2E Host ${timestamp}`);
    await iframeBody.locator("#phone").fill("+2348011111111");
    await iframeBody.locator("#email").fill(`e2e-host-${timestamp}@example.com`);

    await iframeBody.locator('[name="guest_1_title"]').fill("Mr");
    await iframeBody.locator('[name="guest_1_fullname"]').fill(`E2E Guest One ${timestamp}`);
    await iframeBody.locator('[name="guest_1_phone"]').fill("+2348022222222");
    await iframeBody.locator('[name="guest_1_email"]').fill(`e2e-guest1-${timestamp}@example.com`);

    await iframeBody.locator('[name="guest_2_title"]').fill("Mrs");
    await iframeBody.locator('[name="guest_2_fullname"]').fill(`E2E Guest Two ${timestamp}`);
    await iframeBody.locator('[name="guest_2_phone"]').fill("+2348033333333");

    await iframeBody.locator("#__rsvp_btn").click();

    await expect(iframeBody.locator("#__rsvp_success")).toBeVisible();
    await expect(iframeBody.locator("#__rsvp_form_wrap")).toBeHidden();
  });

  test("checking plusOne without noi shows exactly one guest form and hides the count input", async ({ page }) => {
    await page.goto("/events/triple-celebration");

    const iframe = page.locator("iframe[title='Triple Celebration']");
    const iframeBody = iframe.contentFrame().locator("body");

    const plusOne = iframeBody.locator("#plusOne");
    const guestCount = iframeBody.locator("#guestCount");

    await expect(guestCount).toBeHidden();

    await plusOne.click();
    await expect(guestCount).toBeHidden();
    await expect(iframeBody.locator("#__guest_guests_1")).toBeVisible();
    await expect(iframeBody.locator("#__guest_guests_2")).toBeHidden();

    const timestamp = Date.now();
    await iframeBody.locator("#title").fill("Ms");
    await iframeBody.locator("#fullname").fill(`E2E Manual ${timestamp}`);
    await iframeBody.locator("#phone").fill("+2348044444444");
    await iframeBody.locator("#email").fill(`e2e-manual-${timestamp}@example.com`);

    await iframeBody.locator('[name="guest_1_title"]').fill("Dr");
    await iframeBody.locator('[name="guest_1_fullname"]').fill(`E2E Manual Guest ${timestamp}`);
    await iframeBody.locator('[name="guest_1_phone"]').fill("+2348055555555");

    await iframeBody.locator("#__rsvp_btn").click();

    await expect(iframeBody.locator("#__rsvp_success")).toBeVisible();
  });

  test("form submits without guests", async ({ page }) => {
    await page.goto("/events/triple-celebration");

    const iframe = page.locator("iframe[title='Triple Celebration']");
    const iframeBody = iframe.contentFrame().locator("body");

    const timestamp = Date.now();
    await iframeBody.locator("#title").fill("Mrs");
    await iframeBody.locator("#fullname").fill(`E2E Solo ${timestamp}`);
    await iframeBody.locator("#phone").fill("+2348066666666");
    await iframeBody.locator("#email").fill(`e2e-solo-${timestamp}@example.com`);

    await iframeBody.locator("#__rsvp_btn").click();

    await expect(iframeBody.locator("#__rsvp_success")).toBeVisible();
  });

  test("admin registrations page shows full guest details", async ({ page }) => {
    await page.goto("/admin/login");
    await page.fill("#email", "admin@campaigns.local");
    await page.fill("#password", "admin123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/admin");

    await page.goto("/admin/events");
    const eventRow = page.locator("tr", { hasText: /Triple Celebration/i }).first();
    await expect(eventRow).toBeVisible();
    const registrationsLink = eventRow.locator("a", { hasText: "Registrations" });
    const href = await registrationsLink.getAttribute("href");

    await page.goto(href!);
    await page.waitForSelector("table");

    const guestBadge = page.locator("button", { hasText: /\d+ guest/ }).first();
    await expect(guestBadge).toBeVisible();
    await guestBadge.click();

    const guestRow = page.locator("tr.bg-blue-50").first();
    await expect(guestRow).toContainText("Title");
    await expect(guestRow).toContainText("Full Name");
    await expect(guestRow).toContainText("Phone");
  });
});
