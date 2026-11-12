
import { test, expect } from '@playwright/test';
import LoginPage from '../pages/LoginPage';

test.describe('Nextenti Candidate Login Tests', () => {

  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);

    await loginPage.navigateToLogin();
    await loginPage.clickLoginIcon();
  });

  test('NTPUIL0001 - Valid Candidate Login', async ({ page }) => {

   const mobileNumber = process.env.CANDIDATE_MOBILE!;
   const password = process.env.CANDIDATE_PASSWORD!;

    // Monitor the actual login API response
    const loginResponsePromise = page.waitForResponse(response =>
      response.url().includes('/api/auth/login') &&
      response.request().method() === 'POST'
    );

    await loginPage.login(mobileNumber, password);

    const loginResponse = await loginResponsePromise;

    // Verify API response
    expect(loginResponse.status()).toBe(200);

    // Verify successful navigation to Candidate home
  await expect(page).not.toHaveURL(/\/candidate\/home\/?$/);

    console.log('Candidate login API:', loginResponse.status());
    console.log('Candidate login successful');
    console.log('Current URL:', page.url());

  });

  test('NTPUIL0002 - Invalid Candidate Login', async ({ page }) => {

   const mobileNumber = process.env.INVALID_LOGIN_MOBILE!;
   const password = process.env.INVALID_LOGIN_PASSWORD!;
    await loginPage.login(mobileNumber, password);

    // Verify validation message
    await expect(loginPage.errorMessage).toBeVisible();

    await expect(loginPage.errorMessage).toHaveText(
      process.env.INVALID_LOGIN_ERROR_MESSAGE!
    );

    // Verify user did not navigate to Candidate home
    await expect(page).not.toHaveURL(/\/candidate\/home\/?$/);

    console.log(
      'Invalid login error:',
      await loginPage.getErrorMessage()
    );

  });

});
