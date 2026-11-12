
import { test, expect } from '@playwright/test';
import LoginPage from '../pages/loginpage';

const loginData = require('../test-data/loginData.json');

test.describe('Nextenti Candidate Login Tests', () => {

  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);

    await loginPage.navigateToLogin();
    await loginPage.clickLoginIcon();
  });

  test('NTPUIL0001 - Valid Candidate Login', async ({ page }) => {

    const { mobileNumber, password } = loginData.CandidateLogin;

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
    await expect(page).toHaveURL(/\/candidate\/home\/?$/);

    console.log('Candidate login API:', loginResponse.status());
    console.log('Candidate login successful');
    console.log('Current URL:', page.url());

  });

  test('NTPUIL0002 - Invalid Candidate Login', async ({ page }) => {

    const { mobileNumber, password } = loginData.invalidLogin;

    await loginPage.login(mobileNumber, password);

    // Verify validation message
    await expect(loginPage.errorMessage).toBeVisible();

    await expect(loginPage.errorMessage).toHaveText(
      loginData.errorMessage
    );

    // Verify user did not navigate to Candidate home
    await expect(page).not.toHaveURL(/\/candidate\/home\/?$/);

    console.log(
      'Invalid login error:',
      await loginPage.getErrorMessage()
    );

  });

});
