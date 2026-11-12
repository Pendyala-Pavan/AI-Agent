
import { test, expect } from '@playwright/test';

test('Nextenti QA application should be accessible', async ({ page }) => {

  const response = await page.goto('/');

  // Verify that the application responds
  expect(response, 'Application did not return a response').not.toBeNull();

  expect(response!.ok(), 'Application returned an unsuccessful HTTP response')
    .toBeTruthy();

  // Verify that the application URL is loaded
  await expect(page).toHaveURL(/k8-qa-job-web\.nextenti\.ai/);

  console.log('Nextenti QA application opened successfully');

});
