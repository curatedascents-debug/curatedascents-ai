import { type Page } from '@playwright/test';

/** Wait for page to be fully loaded (network idle) */
export async function waitForPageReady(page: Page) {
  await page.waitForLoadState('networkidle');
}

/** Wait for a toast/notification to appear and optionally disappear */
export async function waitForToast(page: Page, text: string) {
  const toast = page.getByText(text);
  await toast.waitFor({ state: 'visible', timeout: 10_000 });
  return toast;
}

/** Scroll to the bottom of the page */
export async function scrollToBottom(page: Page) {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
}

/** Scroll to an element by selector */
export async function scrollToElement(page: Page, selector: string) {
  await page.locator(selector).scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
}

/** Get all visible text from an element */
export async function getVisibleText(page: Page, selector: string): Promise<string> {
  return page.locator(selector).innerText();
}

/** Check if an element has a specific CSS class */
export async function hasClass(page: Page, selector: string, className: string): Promise<boolean> {
  const classes = await page.locator(selector).getAttribute('class');
  return classes?.includes(className) ?? false;
}

/** Fill a form field and verify its value */
export async function fillAndVerify(page: Page, selector: string, value: string) {
  await page.locator(selector).fill(value);
  await page.locator(selector).blur();
}

/** Click a button by its text content */
export async function clickButton(page: Page, text: string) {
  await page.getByRole('button', { name: text }).click();
}

/** Wait for URL to contain a specific path */
export async function waitForPath(page: Page, path: string) {
  await page.waitForURL(`**${path}**`, { timeout: 10_000 });
}

/** Generate a unique email for test isolation */
export function uniqueEmail(prefix = 'e2e'): string {
  return `${prefix}-${Date.now()}@test.example.com`;
}

/** Take a named screenshot for debugging */
export async function debugScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `tests/screenshots/${name}.png`, fullPage: true });
}
