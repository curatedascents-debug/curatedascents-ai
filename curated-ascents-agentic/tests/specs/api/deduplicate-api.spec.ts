import { test, expect } from '@playwright/test';
import { API_ROUTES } from '../../fixtures/test-data.fixture';

test.describe('Deduplicate API @api @admin', () => {
  test('GET /api/admin/deduplicate returns preview with summary', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminDeduplicate}`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.mode).toBe('preview');
    expect(data.passes).toBe(1);
    expect(data.summary).toBeDefined();
    expect(data.tables).toBeDefined();
    expect(Array.isArray(data.tables)).toBeTruthy();
  });

  test('Preview summary has expected fields', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminDeduplicate}`);
    const data = await response.json();
    const { summary } = data;
    expect(typeof summary.tablesScanned).toBe('number');
    expect(typeof summary.tablesWithDuplicates).toBe('number');
    expect(typeof summary.totalDuplicateGroups).toBe('number');
    expect(typeof summary.totalDuplicateRows).toBe('number');
    expect(typeof summary.errors).toBe('number');
  });

  test('Preview scans all 16 tables', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminDeduplicate}`);
    const data = await response.json();
    expect(data.tables.length).toBe(16);
    for (const entry of data.tables) {
      expect(entry.table).toBeDefined();
      expect(typeof entry.duplicateGroups).toBe('number');
      expect(typeof entry.duplicateRows).toBe('number');
    }
  });

  test('POST /api/admin/deduplicate returns execute mode', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${API_ROUTES.adminDeduplicate}`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.mode).toBe('execute');
    expect(data.passes).toBeGreaterThanOrEqual(1);
    expect(data.summary.totalDeleted).toBeDefined();
  });

  test('Preview has no errors', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${API_ROUTES.adminDeduplicate}`);
    const data = await response.json();
    expect(data.summary.errors).toBe(0);
    for (const entry of data.tables) {
      expect(entry.error).toBeUndefined();
    }
  });
});
