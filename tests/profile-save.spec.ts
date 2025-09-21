const { test, expect } = require('@playwright/test');

test.describe('Profile Save Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3009');

    // Clear any existing session
    await page.context().clearCookies();
  });

  test('should save profile data successfully', async ({ page }) => {
    // Enable console logging for debugging
    page.on('console', msg => {
      console.log('CONSOLE:', msg.text());
    });

    page.on('pageerror', error => {
      console.log('PAGE ERROR:', error.message);
    });

    // 1. Sign up a new user
    await page.goto('http://localhost:3009/signup');

    await page.fill('#firstName', 'Test');
    await page.fill('#lastName', 'User');
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');
    await page.fill('#confirmPassword', 'password123');

    // Click sign up button
    await page.click('button[type="submit"]');

    // Wait for redirect to signin
    await page.waitForURL('**/signin', { timeout: 10000 });

    // 2. Sign in with the created user
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');

    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // 3. Navigate to profile page
    await page.click('text=Profile');
    await page.waitForURL('**/profile', { timeout: 10000 });

    // Wait for page to load
    await page.waitForSelector('form', { timeout: 10000 });

    // 4. Fill profile form
    await page.fill('#fullName', 'Test User Updated');
    await page.fill('#phone', '9876543210');

    // Select profession
    await page.click('#student');

    // Fill student fields
    await page.fill('#courseType', 'UG');
    await page.fill('#stream', 'Graphic Design');
    await page.fill('#organization', 'Test College');
    await page.fill('#dateOfBirth', '2000-01-01');

    // 5. Click save profile button
    console.log('Clicking save profile button...');
    await page.click('button[type="submit"]');

    // 6. Wait for success message
    await page.waitForSelector('.border-green-200, .bg-green-50', { timeout: 10000 });
    const successMessage = await page.textContent('.border-green-200, .bg-green-50');
    console.log('Success message:', successMessage);
    expect(successMessage).toContain('Profile updated successfully');

    // 7. Refresh page to verify data persistence
    await page.reload();
    await page.waitForSelector('form', { timeout: 10000 });

    // 8. Verify data is still there
    const name = await page.inputValue('#fullName');
    const phone = await page.inputValue('#phone');
    const courseType = await page.inputValue('#courseType');
    const stream = await page.inputValue('#stream');
    const organization = await page.inputValue('#organization');

    console.log('Persisted data:', {
      name, phone, courseType, stream, organization
    });

    expect(name).toBe('Test User Updated');
    expect(phone).toBe('9876543210');
    expect(courseType).toBe('UG');
    expect(stream).toBe('Graphic Design');
    expect(organization).toBe('Test College');

    // Take screenshot for verification
    await page.screenshot({ path: 'profile-saved.png', fullPage: true });
  });

  test('should show validation errors for missing fields', async ({ page }) => {
    // Sign in first
    await page.goto('http://localhost:3009/signin');
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');

    // Wait for redirect
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Navigate to profile
    await page.click('text=Profile');
    await page.waitForURL('**/profile', { timeout: 10000 });

    // Try to submit empty form
    await page.fill('#fullName', '');
    await page.fill('#phone', '');
    await page.fill('#organization', '');
    await page.fill('#dateOfBirth', '');

    await page.click('button[type="submit"]');

    // Check if validation prevents submission
    // The form should not show success message
    const hasSuccess = await page.$('.border-green-200, .bg-green-50');
    expect(hasSuccess).toBeNull();
  });

  test('should validate phone number format', async ({ page }) => {
    // Sign in first
    await page.goto('http://localhost:3009/signin');
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');

    // Wait for redirect
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Navigate to profile
    await page.click('text=Profile');
    await page.waitForURL('**/profile', { timeout: 10000 });

    // Fill form with invalid phone
    await page.fill('#fullName', 'Test User');
    await page.fill('#phone', '123'); // Invalid phone
    await page.fill('#courseType', 'UG');
    await page.fill('#stream', 'Design');
    await page.fill('#organization', 'Test College');
    await page.fill('#dateOfBirth', '2000-01-01');

    await page.click('button[type="submit"]');

    // Check if validation prevents submission
    const hasSuccess = await page.$('.border-green-200, .bg-green-50');
    expect(hasSuccess).toBeNull();
  });
});