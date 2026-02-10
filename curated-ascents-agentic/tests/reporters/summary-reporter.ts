import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';
import fs from 'fs';
import path from 'path';

/**
 * Custom Playwright reporter that outputs a structured summary of:
 * - Features tested (grouped by tag and category)
 * - Coverage gaps (pages/APIs without tests)
 * - Failed assertions with context
 */

// All known app routes and APIs — used to detect coverage gaps
const KNOWN_PAGES = [
  '/', '/blog', '/blog/[slug]', '/faq', '/contact', '/privacy-policy', '/terms',
  '/payment/success', '/payment/cancelled', '/offline',
  '/admin', '/admin/login',
  '/agency/login', '/agency/dashboard',
  '/supplier/login', '/supplier/dashboard',
  '/portal', '/portal/login', '/portal/trips', '/portal/quotes',
  '/portal/loyalty', '/portal/chat', '/portal/currency', '/portal/settings',
];

const KNOWN_APIS = [
  '/api/chat', '/api/personalize', '/api/seed-all',
  '/api/admin/rates', '/api/admin/suppliers', '/api/admin/hotels',
  '/api/admin/clients', '/api/admin/quotes', '/api/admin/bookings',
  '/api/admin/destinations', '/api/admin/agencies', '/api/admin/media',
  '/api/admin/pricing/rules', '/api/admin/pricing/demand', '/api/admin/pricing/simulate',
  '/api/admin/reports', '/api/admin/nurture/sequences',
  '/api/admin/competitors', '/api/admin/blog/analytics',
  '/api/blog/posts', '/api/agency/auth/login', '/api/agency/chat',
  '/api/supplier/auth/login', '/api/supplier/bookings', '/api/supplier/rates',
  '/api/portal/auth/send-code', '/api/portal/auth/verify-code',
  '/api/portal/dashboard', '/api/portal/bookings', '/api/portal/quotes',
  '/api/portal/loyalty', '/api/portal/profile',
  '/api/payments/checkout', '/api/payments/status',
  '/api/currency/convert', '/api/currency/rates',
  '/api/media/homepage',
];

interface TagSummary {
  tag: string;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
}

interface FailedTest {
  title: string;
  file: string;
  tags: string[];
  error: string;
  duration: number;
}

interface CategorySummary {
  category: string;
  specs: number;
  tests: number;
  passed: number;
  failed: number;
}

class SummaryReporter implements Reporter {
  private startTime = 0;
  private allTests: { test: TestCase; result: TestResult }[] = [];
  private outputFile: string;

  constructor(options?: { outputFile?: string }) {
    this.outputFile = options?.outputFile || 'test-summary.json';
  }

  onBegin(_config: FullConfig, suite: Suite) {
    this.startTime = Date.now();
    const totalTests = suite.allTests().length;
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`  CuratedAscents Test Suite — ${totalTests} tests`);
    console.log(`${'═'.repeat(60)}\n`);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    this.allTests.push({ test, result });
  }

  onEnd(result: FullResult) {
    const duration = Date.now() - this.startTime;
    const durationStr = (duration / 1000).toFixed(1);

    // ── Aggregate by category (directory) ───────────────────────
    const categories = new Map<string, CategorySummary>();
    const tagMap = new Map<string, TagSummary>();
    const failures: FailedTest[] = [];
    const testedRoutes = new Set<string>();
    const testedApis = new Set<string>();

    for (const { test: tc, result: tr } of this.allTests) {
      // Extract category from file path (e.g., "admin", "portal", "api")
      const filePath = tc.location.file;
      const relPath = filePath.replace(/.*specs\//, '');
      const category = relPath.split('/')[0] || 'unknown';

      if (!categories.has(category)) {
        categories.set(category, { category, specs: 0, tests: 0, passed: 0, failed: 0 });
      }
      const cat = categories.get(category)!;
      cat.tests++;
      if (tr.status === 'passed') cat.passed++;
      if (tr.status === 'failed' || tr.status === 'timedOut') cat.failed++;

      // Extract tags from test title or annotations
      const tags = extractTags(tc);
      for (const tag of tags) {
        if (!tagMap.has(tag)) {
          tagMap.set(tag, { tag, total: 0, passed: 0, failed: 0, skipped: 0 });
        }
        const ts = tagMap.get(tag)!;
        ts.total++;
        if (tr.status === 'passed') ts.passed++;
        else if (tr.status === 'failed' || tr.status === 'timedOut') ts.failed++;
        else ts.skipped++;
      }

      // Collect failures
      if (tr.status === 'failed' || tr.status === 'timedOut') {
        const errorMsg = tr.errors.map(e => e.message || '').join('\n').slice(0, 300);
        failures.push({
          title: tc.title,
          file: relPath,
          tags,
          error: errorMsg,
          duration: tr.duration,
        });
      }

      // Track route coverage from test content
      const fullTitle = tc.titlePath().join(' ').toLowerCase();
      detectCoveredRoutes(fullTitle, testedRoutes, testedApis);
    }

    // Count unique spec files per category
    const specFiles = new Map<string, Set<string>>();
    for (const { test: tc } of this.allTests) {
      const relPath = tc.location.file.replace(/.*specs\//, '');
      const category = relPath.split('/')[0] || 'unknown';
      if (!specFiles.has(category)) specFiles.set(category, new Set());
      specFiles.get(category)!.add(relPath);
    }
    for (const [cat, files] of specFiles) {
      if (categories.has(cat)) {
        categories.get(cat)!.specs = files.size;
      }
    }

    // ── Coverage Gaps ────────────────────────────────────────────
    const untestedPages = KNOWN_PAGES.filter(p => !testedRoutes.has(p));
    const untestedApis = KNOWN_APIS.filter(a => !testedApis.has(a));

    // ── Print Summary ────────────────────────────────────────────
    const passed = this.allTests.filter(t => t.result.status === 'passed').length;
    const failed = this.allTests.filter(t => t.result.status === 'failed' || t.result.status === 'timedOut').length;
    const skipped = this.allTests.filter(t => t.result.status === 'skipped').length;
    const total = this.allTests.length;

    console.log(`\n${'─'.repeat(60)}`);
    console.log('  FEATURES TESTED (by category)');
    console.log(`${'─'.repeat(60)}`);
    const sortedCats = [...categories.values()].sort((a, b) => b.tests - a.tests);
    for (const cat of sortedCats) {
      const icon = cat.failed > 0 ? '✗' : '✓';
      console.log(`  ${icon} ${cat.category.padEnd(14)} ${String(cat.specs).padStart(2)} specs  ${String(cat.tests).padStart(3)} tests  ${String(cat.passed).padStart(3)} passed  ${cat.failed > 0 ? `${cat.failed} FAILED` : ''}`);
    }

    if (tagMap.size > 0) {
      console.log(`\n${'─'.repeat(60)}`);
      console.log('  FEATURES TESTED (by tag)');
      console.log(`${'─'.repeat(60)}`);
      const sortedTags = [...tagMap.values()].sort((a, b) => b.total - a.total);
      for (const ts of sortedTags) {
        const icon = ts.failed > 0 ? '✗' : '✓';
        console.log(`  ${icon} ${ts.tag.padEnd(16)} ${String(ts.total).padStart(3)} tests  ${String(ts.passed).padStart(3)} passed  ${ts.failed > 0 ? `${ts.failed} FAILED` : ''}`);
      }
    }

    if (untestedPages.length > 0 || untestedApis.length > 0) {
      console.log(`\n${'─'.repeat(60)}`);
      console.log('  COVERAGE GAPS');
      console.log(`${'─'.repeat(60)}`);
      if (untestedPages.length > 0) {
        console.log(`  Pages without direct tests (${untestedPages.length}):`);
        for (const p of untestedPages) console.log(`    - ${p}`);
      }
      if (untestedApis.length > 0) {
        console.log(`  APIs without direct tests (${untestedApis.length}):`);
        for (const a of untestedApis) console.log(`    - ${a}`);
      }
    }

    if (failures.length > 0) {
      console.log(`\n${'─'.repeat(60)}`);
      console.log(`  FAILED ASSERTIONS (${failures.length})`);
      console.log(`${'─'.repeat(60)}`);
      for (const f of failures) {
        console.log(`\n  ✗ ${f.title}`);
        console.log(`    File: ${f.file}`);
        if (f.tags.length) console.log(`    Tags: ${f.tags.join(', ')}`);
        console.log(`    Time: ${(f.duration / 1000).toFixed(1)}s`);
        console.log(`    Error: ${f.error.split('\n')[0]}`);
      }
    }

    console.log(`\n${'═'.repeat(60)}`);
    console.log(`  TOTAL: ${total} tests | ${passed} passed | ${failed} failed | ${skipped} skipped`);
    console.log(`  Duration: ${durationStr}s | Status: ${result.status.toUpperCase()}`);
    console.log(`${'═'.repeat(60)}\n`);

    // ── Write JSON summary ───────────────────────────────────────
    const summary = {
      timestamp: new Date().toISOString(),
      duration: duration,
      status: result.status,
      totals: { total, passed, failed, skipped },
      categories: sortedCats,
      tags: [...tagMap.values()],
      failures,
      coverageGaps: {
        untestedPages,
        untestedApis,
        pagesCovered: KNOWN_PAGES.length - untestedPages.length,
        pagesTotal: KNOWN_PAGES.length,
        apisCovered: KNOWN_APIS.length - untestedApis.length,
        apisTotal: KNOWN_APIS.length,
      },
    };

    try {
      const outPath = path.resolve(process.cwd(), this.outputFile);
      fs.writeFileSync(outPath, JSON.stringify(summary, null, 2));
      console.log(`  Summary written to: ${this.outputFile}\n`);
    } catch {
      // Non-critical — don't fail the run
    }
  }
}

function extractTags(tc: TestCase): string[] {
  const tags: string[] = [];
  // Extract @tag patterns from the test title path
  for (const part of tc.titlePath()) {
    const matches = part.match(/@[\w-]+/g);
    if (matches) tags.push(...matches);
  }
  // Also derive implicit tags from the file path
  const filePath = tc.location.file;
  if (filePath.includes('/admin/')) tags.push('@admin');
  if (filePath.includes('/portal/')) tags.push('@portal');
  if (filePath.includes('/agency/')) tags.push('@agency');
  if (filePath.includes('/supplier/')) tags.push('@supplier');
  if (filePath.includes('/chat/')) tags.push('@ai-tools');
  if (filePath.includes('/auth/')) tags.push('@auth');
  if (filePath.includes('/api/')) tags.push('@api');
  if (filePath.includes('/journeys/')) tags.push('@regression');
  if (filePath.includes('/public/')) tags.push('@smoke');
  return [...new Set(tags)];
}

function detectCoveredRoutes(title: string, pages: Set<string>, apis: Set<string>) {
  // Match page routes mentioned in test titles
  for (const page of KNOWN_PAGES) {
    const normalized = page.replace(/\[.*?\]/g, '').toLowerCase();
    if (title.includes(normalized) || title.includes(normalized.replace(/\//g, ' ').trim())) {
      pages.add(page);
    }
  }
  // Match API routes
  for (const api of KNOWN_APIS) {
    const normalized = api.replace('/api/', '').toLowerCase();
    if (title.includes(normalized) || title.includes(api.toLowerCase())) {
      apis.add(api);
    }
  }

  // Keyword-based heuristic coverage detection
  if (title.includes('homepage') || title.includes('home page')) pages.add('/');
  if (title.includes('blog')) { pages.add('/blog'); pages.add('/blog/[slug]'); }
  if (title.includes('faq')) pages.add('/faq');
  if (title.includes('contact')) pages.add('/contact');
  if (title.includes('privacy')) pages.add('/privacy-policy');
  if (title.includes('terms')) pages.add('/terms');
  if (title.includes('payment success')) pages.add('/payment/success');
  if (title.includes('payment cancel')) pages.add('/payment/cancelled');
  if (title.includes('admin login')) pages.add('/admin/login');
  if (title.includes('admin') && !title.includes('login')) pages.add('/admin');
  if (title.includes('agency login')) pages.add('/agency/login');
  if (title.includes('agency dashboard') || title.includes('agency chat')) pages.add('/agency/dashboard');
  if (title.includes('supplier login')) pages.add('/supplier/login');
  if (title.includes('supplier dashboard') || title.includes('supplier rate')) pages.add('/supplier/dashboard');
  if (title.includes('portal login') || title.includes('verification code')) pages.add('/portal/login');
  if (title.includes('portal dashboard')) pages.add('/portal');
  if (title.includes('portal trip')) pages.add('/portal/trips');
  if (title.includes('portal quote')) pages.add('/portal/quotes');
  if (title.includes('portal loyalty') || title.includes('loyalty')) pages.add('/portal/loyalty');
  if (title.includes('portal chat')) pages.add('/portal/chat');
  if (title.includes('currency')) pages.add('/portal/currency');
  if (title.includes('portal setting')) pages.add('/portal/settings');

  // API coverage
  if (title.includes('chat') && title.includes('api')) apis.add('/api/chat');
  if (title.includes('personalize')) apis.add('/api/personalize');
  if (title.includes('blog') && title.includes('api')) apis.add('/api/blog/posts');
  if (title.includes('payment') && title.includes('checkout')) apis.add('/api/payments/checkout');
  if (title.includes('payment') && title.includes('status')) apis.add('/api/payments/status');
  if (title.includes('media') && title.includes('homepage')) apis.add('/api/media/homepage');
  if (title.includes('admin') && title.includes('media')) apis.add('/api/admin/media');
  if (title.includes('send') && title.includes('code')) apis.add('/api/portal/auth/send-code');
  if (title.includes('verify') && title.includes('code')) apis.add('/api/portal/auth/verify-code');
  if (title.includes('agency') && title.includes('chat')) apis.add('/api/agency/chat');
  if (title.includes('currency') && title.includes('rate')) apis.add('/api/currency/rates');
  if (title.includes('currency') && title.includes('convert')) apis.add('/api/currency/convert');
}

export default SummaryReporter;
