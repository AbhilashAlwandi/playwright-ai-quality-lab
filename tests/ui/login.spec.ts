import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';

test.describe('Login', () => {
  test('valid user lands on the products page', async ({ page }) => {
    const login = new LoginPage(page);
    const inventory = new InventoryPage(page);
    await login.goto();
    await login.login('standard_user', 'secret_sauce');
    await expect(inventory.title).toHaveText('Products');
  });

  test('locked-out user sees an error and is not logged in', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('locked_out_user', 'secret_sauce');
    await expect(login.error).toContainText('locked out');
    await expect(page).toHaveURL('/');
  });

  test('wrong password is rejected', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('standard_user', 'not_the_password');
    await expect(login.error).toContainText('do not match');
  });
});
