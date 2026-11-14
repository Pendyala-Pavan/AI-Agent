
const fs = require('fs');

const reportPath = 'reports/test-results/results.json';
const outputPath = process.env.GITHUB_OUTPUT;

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

let passed = 0;
let failed = 0;
let flaky = 0;
let skipped = 0;
let testRows = '';

function collectTests(suites, parent = '') {
  for (const suite of suites || []) {
    const suiteName = [parent, suite.title]
      .filter(Boolean)
      .join(' > ');

    for (const spec of suite.specs || []) {
      for (const test of spec.tests || []) {
        const results = test.results || [];
        const lastResult = results[results.length - 1];
        const finalStatus = lastResult?.status || 'unknown';

        let status = 'FAILED';

        if (finalStatus === 'skipped') {
          status = 'SKIPPED';
          skipped++;
        } else if (
          finalStatus === 'passed' &&
          results.some(result => result.status !== 'passed')
        ) {
          status = 'FLAKY';
          flaky++;
        } else if (finalStatus === 'passed') {
          status = 'PASSED';
          passed++;
        } else {
          failed++;
        }

        const color = {
          PASSED: '#15803d',
          FAILED: '#dc2626',
          FLAKY: '#d97706',
          SKIPPED: '#64748b'
        }[status];

        testRows += `
          <tr>
            <td style="padding:12px;border-bottom:1px solid #e5e7eb">
              ${escapeHtml(spec.title)}
            </td>
            <td style="padding:12px;border-bottom:1px solid #e5e7eb">
              ${escapeHtml(suiteName)}
            </td>
            <td style="padding:12px;border-bottom:1px solid #e5e7eb;color:${color};font-weight:bold">
              ${status}
            </td>
            <td style="padding:12px;border-bottom:1px solid #e5e7eb;text-align:center">
              ${results.length}
            </td>
          </tr>`;
      }
    }

    collectTests(suite.suites, suiteName);
  }
}

const reportAvailable = fs.existsSync(reportPath);
let duration = 0;

if (reportAvailable) {
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

  collectTests(report.suites);

  // Use the overall Playwright execution duration.
  duration = report.stats?.duration || 0;
}

const total = passed + failed + flaky + skipped;
const seconds = (duration / 1000).toFixed(2);

const overallStatus = !reportAvailable
  ? 'REPORT NOT GENERATED'
  : failed > 0
    ? 'FAILED'
    : flaky > 0
      ? 'PASSED WITH FLAKY TESTS'
      : 'PASSED';

const overallColor = failed > 0
  ? '#dc2626'
  : flaky > 0
    ? '#d97706'
    : '#15803d';

const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body style="margin:0;padding:20px;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#1f2937">

<div style="max-width:760px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">

  <div style="background:#172554;padding:28px;color:#ffffff">
    <h1 style="margin:0;font-size:24px">
      Nextenti QA Automation
    </h1>
    <p style="margin:8px 0 0;color:#dbeafe;font-size:14px">
      Playwright Test Execution Report
    </p>
  </div>

  <div style="padding:25px">

    <h2 style="font-size:19px;margin-top:0">
      Execution Summary
    </h2>

    <p style="font-size:15px">
      Overall Status:
      <strong style="color:${overallColor}">
        ${overallStatus}
      </strong>
    </p>

    <table style="width:100%;border-collapse:collapse;text-align:center">
      <tr>
        ${[
          ['PASSED', passed, '#15803d'],
          ['FAILED', failed, '#dc2626'],
          ['FLAKY', flaky, '#d97706'],
          ['SKIPPED', skipped, '#64748b']
        ].map(([label, value, color]) => `
          <td style="width:25%;padding:15px 4px;background:#f8fafc;border:1px solid #e5e7eb">
            <div style="font-size:26px;font-weight:bold;color:${color}">
              ${value}
            </div>
            <div style="font-size:11px;font-weight:bold;color:#475569">
              ${label}
            </div>
          </td>
        `).join('')}
      </tr>
    </table>

    <table style="width:100%;margin-top:20px;border-collapse:collapse">
      <tr>
        <td style="padding:9px 0;color:#64748b">Total Test Cases</td>
        <td style="padding:9px 0;text-align:right;font-weight:bold">${total}</td>
      </tr>
      <tr>
        <td style="padding:9px 0;color:#64748b">Execution Time</td>
        <td style="padding:9px 0;text-align:right;font-weight:bold">${seconds} seconds</td>
      </tr>
    </table>

    <h2 style="font-size:19px;margin-top:30px">
      Individual Test Results
    </h2>

    <div style="overflow-x:auto">
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead>
          <tr style="background:#eaf0f8">
            <th style="padding:12px;text-align:left">Test Case</th>
            <th style="padding:12px;text-align:left">Test Suite</th>
            <th style="padding:12px;text-align:left">Status</th>
            <th style="padding:12px;text-align:center">Attempts</th>
          </tr>
        </thead>

        <tbody>
          ${reportAvailable
            ? testRows
            : '<tr><td colspan="4" style="padding:15px">Test report was not generated. Please check GitHub Actions logs.</td></tr>'}
        </tbody>
      </table>
    </div>

    <div style="margin-top:28px;padding:16px;background:#f8fafc;border-radius:8px">
      <p style="margin:0;font-size:12px;color:#64748b">
        This report was automatically generated by the Nextenti QA Playwright automation pipeline.
      </p>
    </div>

  </div>

</div>

</body>
</html>
`;

if (outputPath) {
  const delimiter = 'EMAIL_HTML_END';

  fs.appendFileSync(
    outputPath,
    `html_body<<${delimiter}\n${html}\n${delimiter}\n`
  );
}

console.log(
  `Passed: ${passed}, Failed: ${failed}, Flaky: ${flaky}, Skipped: ${skipped}`
);
console.log(`Total execution time: ${seconds} seconds`);
console.log(`Overall status: ${overallStatus}`);
