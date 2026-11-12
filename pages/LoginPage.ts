
import { Page, Locator } from '@playwright/test';

class LoginPage {
  readonly page: Page;
  readonly loginicon: Locator;
  readonly usernameField: Locator;
  readonly passwordField: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    this.loginicon = page.locator(
      '.bg-darkblue7.px-3.py-1.hover-scale.text-white.rounded-3xl'
    );

    this.usernameField = page.locator('#loginId');
    this.passwordField = page.locator('#password');

    this.loginButton = page
      .getByRole('dialog')
      .getByRole('button', { name: 'Login' });

    this.errorMessage = page.locator(
      '.mt-1.text-sm.text-error.text-xs'
    );
  }

  async navigateToLogin(): Promise<void> {
    await this.page.goto('/');
  }

  async clickLoginIcon(): Promise<void> {
    await this.loginicon.click();
  }

  async login(
    mobileNumber: string,
    password: string
  ): Promise<void> {
    await this.usernameField.fill(mobileNumber);
    await this.passwordField.fill(password);

    await this.loginButton.scrollIntoViewIfNeeded();
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
