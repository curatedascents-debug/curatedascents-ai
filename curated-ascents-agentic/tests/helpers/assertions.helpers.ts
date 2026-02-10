import { type Page, type APIResponse, expect } from '@playwright/test';

/**
 * Assert that a toast notification appears with specific text.
 */
export async function expectToast(page: Page, text: string, timeout = 10_000) {
  const toast = page.getByText(text);
  await expect(toast).toBeVisible({ timeout });
  return toast;
}

/**
 * Assert that an API response has the expected status and optionally check body fields.
 */
export async function expectApiResponse(
  response: APIResponse,
  expectedStatus: number,
  bodyChecks?: Record<string, unknown>
) {
  expect(response.status()).toBe(expectedStatus);

  if (bodyChecks) {
    const body = await response.json();
    for (const [key, value] of Object.entries(bodyChecks)) {
      expect(body[key]).toEqual(value);
    }
  }
}

/**
 * Assert that an API response is a successful JSON response (2xx).
 */
export async function expectApiSuccess(response: APIResponse) {
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  return body;
}

/**
 * Assert that an API response is an error with specific status.
 */
export async function expectApiError(response: APIResponse, status: number) {
  expect(response.status()).toBe(status);
}

/**
 * Assert that a page has no console errors.
 */
export async function expectNoConsoleErrors(page: Page, action: () => Promise<void>) {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  await action();

  expect(errors).toHaveLength(0);
}

/**
 * Assert that an element contains text matching a pattern.
 */
export async function expectTextMatch(page: Page, selector: string, pattern: RegExp) {
  const text = await page.locator(selector).innerText();
  expect(text).toMatch(pattern);
}

/**
 * Assert that a table has a minimum number of rows.
 */
export async function expectMinTableRows(page: Page, minRows: number, selector = 'tbody tr') {
  const rowCount = await page.locator(selector).count();
  expect(rowCount).toBeGreaterThanOrEqual(minRows);
}
