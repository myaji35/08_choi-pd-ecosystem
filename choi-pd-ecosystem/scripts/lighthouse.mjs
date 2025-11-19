#!/usr/bin/env node

import lighthouse from 'lighthouse';
import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const PAGES_TO_TEST = [
  { path: '/', name: 'Homepage' },
  { path: '/admin/hero-images', name: 'Admin Hero Images' },
];

const PERFORMANCE_THRESHOLDS = {
  performance: 70,
  accessibility: 90,
  'best-practices': 80,
  seo: 80,
};

async function runLighthouse() {
  console.log('🚀 Starting Lighthouse performance tests...\n');

  const browser = await chromium.launch({
    args: ['--remote-debugging-port=9222'],
  });

  const results = [];

  for (const page of PAGES_TO_TEST) {
    const url = `${BASE_URL}${page.path}`;
    console.log(`📊 Testing ${page.name} (${url})...`);

    try {
      const { lhr } = await lighthouse(url, {
        port: 9222,
        output: 'html',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      });

      const scores = {
        performance: Math.round(lhr.categories.performance.score * 100),
        accessibility: Math.round(lhr.categories.accessibility.score * 100),
        bestPractices: Math.round(lhr.categories['best-practices'].score * 100),
        seo: Math.round(lhr.categories.seo.score * 100),
      };

      console.log(`  ✅ Performance: ${scores.performance}/100`);
      console.log(`  ✅ Accessibility: ${scores.accessibility}/100`);
      console.log(`  ✅ Best Practices: ${scores.bestPractices}/100`);
      console.log(`  ✅ SEO: ${scores.seo}/100\n`);

      // Check thresholds
      const failures = [];
      if (scores.performance < PERFORMANCE_THRESHOLDS.performance) {
        failures.push(`Performance: ${scores.performance} < ${PERFORMANCE_THRESHOLDS.performance}`);
      }
      if (scores.accessibility < PERFORMANCE_THRESHOLDS.accessibility) {
        failures.push(`Accessibility: ${scores.accessibility} < ${PERFORMANCE_THRESHOLDS.accessibility}`);
      }
      if (scores.bestPractices < PERFORMANCE_THRESHOLDS['best-practices']) {
        failures.push(`Best Practices: ${scores.bestPractices} < ${PERFORMANCE_THRESHOLDS['best-practices']}`);
      }
      if (scores.seo < PERFORMANCE_THRESHOLDS.seo) {
        failures.push(`SEO: ${scores.seo} < ${PERFORMANCE_THRESHOLDS.seo}`);
      }

      results.push({
        page: page.name,
        url,
        scores,
        passed: failures.length === 0,
        failures,
      });
    } catch (error) {
      console.error(`  ❌ Error testing ${page.name}:`, error.message);
      results.push({
        page: page.name,
        url,
        error: error.message,
        passed: false,
      });
    }
  }

  await browser.close();

  // Summary
  console.log('\n📋 Lighthouse Test Summary:');
  console.log('════════════════════════════════════════\n');

  let allPassed = true;
  for (const result of results) {
    const status = result.passed ? '✅ PASSED' : '❌ FAILED';
    console.log(`${status}: ${result.page}`);

    if (result.error) {
      console.log(`  Error: ${result.error}`);
    } else if (result.failures && result.failures.length > 0) {
      console.log(`  Failures:`);
      result.failures.forEach((failure) => {
        console.log(`    - ${failure}`);
      });
      allPassed = false;
    }
  }

  console.log('\n════════════════════════════════════════\n');

  // Save results to JSON
  const resultsPath = resolve(__dirname, '../lighthouse-results.json');
  writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`📝 Results saved to: ${resultsPath}\n`);

  if (!allPassed) {
    console.error('❌ Some Lighthouse tests failed!');
    process.exit(1);
  }

  console.log('✅ All Lighthouse tests passed!');
  process.exit(0);
}

runLighthouse().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
