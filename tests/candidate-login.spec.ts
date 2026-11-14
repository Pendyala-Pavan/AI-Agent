
import { test, expect } from '@playwright/test';
import LoginPage from '../pages/LoginPage';

test.describe('Nextenti Candidate Login Tests', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);

    // Open Nextenti homepage
    await loginPage.navigateToLogin();

    // Open login popup
    await loginPage.clickLoginIcon();

    // Wait until the login form is available
    await expect(loginPage.usernameField).toBeVisible({
      timeout: 15000
    });

    await expect(loginPage.passwordField).toBeVisible({
      timeout: 15000
    });
  });

  test('NTPUIL0001 - Valid Candidate Login', async ({ page }) => {
    const mobileNumber = process.env.CANDIDATE_MOBILE;
    const password = process.env.CANDIDATE_PASSWORD;

    // Verify test credentials are configured
    expect(mobileNumber, 'Candidate mobile is configured').toBeTruthy();
    expect(password, 'Candidate password is configured').toBeTruthy();

    // Wait for login API response
    const loginResponsePromise = page.waitForResponse(
      response =>
        response.url().includes('/api/auth/login') &&
        response.request().method() === 'POST',
      { timeout: 30000 }
    );

    // Enter valid credentials and login
    await loginPage.login(mobileNumber!, password!);

    const loginResponse = await loginResponsePromise;

    // Verify API response
    expect(loginResponse.status()).toBe(200);

    console.log(
      'Candidate login API status:',
      loginResponse.status()
    );

    console.log('Current URL:', page.url());
  });

  test('NTPUIL0002 - Invalid Candidate Login', async ({ page }) => {
    const mobileNumber = process.env.INVALID_LOGIN_MOBILE;
    const password = process.env.INVALID_LOGIN_PASSWORD;
    const expectedError = process.env.INVALID_LOGIN_ERROR_MESSAGE;

    // Verify invalid test data is configured
    expect(mobileNumber, 'Invalid mobile is configured').toBeTruthy();
    expect(password, 'Invalid password is configured').toBeTruthy();
    expect(expectedError, 'Expected error message is configured').toBeTruthy();

    // Enter invalid credentials and login
    await loginPage.login(mobileNumber!, password!);

    // Verify error message
    await expect(loginPage.errorMessage).toBeVisible({
      timeout: 15000
    });

    await expect(loginPage.errorMessage).toHaveText(expectedError!);

    // Verify user remains outside the candidate home page
    await expect(page).not.toHaveURL(/\/candidate\/home\/?$/);

    console.log(
      'Invalid login error:',
      await loginPage.getErrorMessage()
    );
  });
});
