import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { CheckoutPage } from '../../pages/CheckoutPage';

test.describe('Shopping flow', () => {
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('standard_user', 'secret_sauce');
  });

  test('adding an item updates the cart badge', async ({ page }) => {
    const inventory = new InventoryPage(page);
    await inventory.addToCart('sauce-labs-backpack');
    await expect(inventory.cartBadge).toHaveText('1');
  });

  test('sorting by price low to high orders prices ascending', async ({ page }) => {
    const inventory = new InventoryPage(page);
    await inventory.sortBy('lohi');
    const prices = await inventory.priceValues();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('end-to-end checkout completes the order', async ({ page }) => {
    const inventory = new InventoryPage(page);
    const checkout = new CheckoutPage(page);
    await inventory.addToCart('sauce-labs-backpack');
    await inventory.cartLink.click();
    await checkout.checkoutButton.click();
    await checkout.fillDetails('Test', 'User', '560001');
    await checkout.finishButton.click();
    await expect(checkout.completeHeader).toHaveText('Thank you for your order!');
  });
});
