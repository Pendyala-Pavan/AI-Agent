
import { Page, Locator, expect } from '@playwright/test';

class LoginPage {
  readonly page: Page;
  readonly loginicon: Locator;
  readonly loginDialog: Locator;
  readonly usernameField: Locator;
  readonly passwordField: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    this.loginicon = page.getByRole('button', {
      name: 'Login',
      exact: true
    });

    this.loginDialog = page.getByRole('dialog', {
      name: 'Login'
    });

    this.usernameField = page.locator('#loginId');
    this.passwordField = page.locator('#password');

    this.loginButton = this.loginDialog.getByRole('button', {
      name: 'Login'
    });

    this.errorMessage = page.locator(
      '.mt-1.text-sm.text-error.text-xs'
    );
  }

  async navigateToLogin(): Promise<void> {
    await this.page.goto('/', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
  }

  async clickLoginIcon(): Promise<void> {
    await this.loginicon.waitFor({
      state: 'visible',
      timeout: 15000
    });

    await this.loginicon.click();

    await expect(this.loginDialog).toBeVisible();
  }

  async login(
    mobileNumber: string,
    password: string
  ): Promise<void> {
    // Verify that the login form is actually rendered.
    await expect(this.usernameField).toBeVisible({
      timeout: 15000
    });

    await expect(this.passwordField).toBeVisible({
      timeout: 15000
    });

    await this.usernameField.fill(mobileNumber);
    await this.passwordField.fill(password);

    await this.loginButton.click();
  }

  async getErrorMessage(): Promise<string | null> {
    if (await this.errorMessage.isVisible()) {
      return await this.errorMessage.textContent();
    }

    return null;
  }

  async isErrorMessageVisible(): Promise<boolean> {
    return await this.errorMessage.isVisible();
  }
}

export default LoginPage;
