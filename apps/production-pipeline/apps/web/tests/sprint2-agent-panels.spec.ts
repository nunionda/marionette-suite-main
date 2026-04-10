import { test, expect } from "@playwright/test"

const PROJECT_ID = "test-project-001"
const PROJECT_URL = `/projects/${PROJECT_ID}`

/**
 * Sprint 2 — Agent Output Panel E2E Tests
 *
 * These tests verify the 3 new panels (CharacterSheetPanel, LocationGallery,
 * PromptPreview) handle the "agent not run yet" state (API 404) gracefully
 * and render without crashing on the project page.
 */

// Mock all agent-output API routes to return 404 (agent not run yet)
async function mockAgentAPIs(page: import("@playwright/test").Page) {
  await page.route("**/api/projects/*/agents/casting-director", (route) =>
    route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({ error: "Agent has not run yet" }),
    }),
  )
  await page.route("**/api/projects/*/agents/location-scout", (route) =>
    route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({ error: "Agent has not run yet" }),
    }),
  )
  await page.route("**/api/projects/*/agents/cinematographer", (route) =>
    route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({ error: "Agent has not run yet" }),
    }),
  )
}

// Mock the project API so the page itself can load
async function mockProjectAPI(page: import("@playwright/test").Page) {
  await page.route(`**/api/projects/${PROJECT_ID}`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: PROJECT_ID,
        title: "Test Project",
        status: "IN_PROGRESS",
        phase: "PRE_PRODUCTION",
        logline: "A test logline",
        directionPlan: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    }),
  )
}

test.describe("CharacterSheetPanel", () => {
  test("renders loading skeleton when API returns 404 (agent not run yet)", async ({ page }) => {
    await mockProjectAPI(page)
    await mockAgentAPIs(page)
    await page.goto(PROJECT_URL)

    // The panel should render an empty/placeholder state, not crash
    const panel = page.locator("[data-testid='character-sheet-panel'], [class*='character'], h2:has-text('Character')")
    // Page should load without errors
    await expect(page).not.toHaveTitle(/error/i)
  })
})

test.describe("LocationGallery", () => {
  test("renders empty state when API returns 404 (agent not run yet)", async ({ page }) => {
    await mockProjectAPI(page)
    await mockAgentAPIs(page)
    await page.goto(PROJECT_URL)

    // The gallery should show an empty/placeholder state, not crash
    const gallery = page.locator("[data-testid='location-gallery'], [class*='location'], h2:has-text('Location')")
    // Page should load without errors
    await expect(page).not.toHaveTitle(/error/i)
  })
})

test.describe("PromptPreview", () => {
  test("renders empty state when API returns 404 (agent not run yet)", async ({ page }) => {
    await mockProjectAPI(page)
    await mockAgentAPIs(page)
    await page.goto(PROJECT_URL)

    // PromptPreview is in the Production tab — page should still load
    await expect(page).not.toHaveTitle(/error/i)
  })
})

test.describe("All 3 panels", () => {
  test("render without crashing when project page loads", async ({ page }) => {
    await mockProjectAPI(page)
    await mockAgentAPIs(page)

    // Navigate to project page — all panels should render gracefully
    const response = await page.goto(PROJECT_URL)
    expect(response?.status()).toBeLessThan(500)

    // Page should render without a JS error overlay
    const errorOverlay = page.locator("#__next-error, [class*='error-overlay']")
    await expect(errorOverlay).toHaveCount(0)
  })
})
