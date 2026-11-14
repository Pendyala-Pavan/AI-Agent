
const fs = require('fs');

const reportPath = 'reports/test-results/results.json';
const outputPath = process.env.GITHUB_OUTPUT;

let body = 'Nextenti QA Automation Report\n\n';

if (!fs.existsSync(reportPath)) {
  body += 'Test report was not generated. Please check the GitHub Actions logs.\n';
} else {
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const stats = report.stats || {};

  body += `Execution Summary\n`;
  body += `Passed: ${stats.expected ?? 0}\n`;
  body += `Failed: ${stats.unexpected ?? 0}\n`;
  body += `Flaky: ${stats.flaky ?? 0}\n`;
  body += `Skipped: ${stats.skipped ?? 0}\n`;
  body += `Total execution time: ${((stats.duration ?? 0) / 1000).toFixed(2)} seconds\n\n`;

  body += 'Individual Test Cases\n';

  function collectTests(suites, parent = '') {
    for (const suite of suites || []) {
      const suiteName = [parent, suite.title].filter(Boolean).join(' > ');

      for (const spec of suite.specs || []) {
        for (const test of spec.tests || []) {
          const outcome = test.outcome || 'unknown';
          const status = {
            expected: 'PASSED',
            unexpected: 'FAILED',
            flaky: 'FLAKY',
            skipped: 'SKIPPED'
          }[outcome] || 'UNKNOWN';

          body += `${status} - ${suiteName} > ${spec.title}\n`;
        }
      }

      collectTests(suite.suites, suiteName);
    }
  }

  collectTests(report.suites);
}

if (outputPath) {
  const delimiter = 'EMAIL_SUMMARY_END';
  fs.appendFileSync(
    outputPath,
    `body<<${delimiter}\n${body}\n${delimiter}\n`
  );
}

console.log(body);
