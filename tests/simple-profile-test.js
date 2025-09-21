const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Enable console logging
  page.on('console', msg => console.log('CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  try {
    // Start the app manually (npm run dev in another terminal)

    // 1. Go to signup page
    console.log('Navigating to signup...');
    await page.goto('http://localhost:3009/signup');
    await page.waitForLoadState('networkidle');

    // 2. Fill signup form
    console.log('Filling signup form...');
    await page.fill('#firstName', 'Test');
    await page.fill('#lastName', 'User');
    await page.fill('#email', 'testuser@example.com');
    await page.fill('#password', 'password123');
    await page.fill('#confirmPassword', 'password123');

    // 3. Submit signup
    console.log('Submitting signup...');
    await page.click('button[type="submit"]');

    // Wait for success message and redirect
    await page.waitForSelector('.border-green-200, .bg-green-50', { timeout: 10000 });
    console.log('Signup successful!');

    // Wait for redirect to profile
    await page.waitForURL('**/profile', { timeout: 10000 });
    console.log('Redirected to profile page');

    // 4. Fill profile form
    console.log('Filling profile form...');
    await page.waitForSelector('#fullName', { state: 'visible', timeout: 10000 });

    // Check if name is pre-filled
    const currentName = await page.inputValue('#fullName');
    console.log('Current name:', currentName);

    await page.fill('#fullName', 'Test User Updated');
    await page.fill('#phone', '9876543210');
    await page.click('#student');
    await page.fill('#courseType', 'UG');
    await page.fill('#stream', 'Graphic Design');
    await page.fill('#organization', 'Test College');
    await page.fill('#dateOfBirth', '2000-01-01');

    // 5. Save profile
    console.log('Saving profile...');
    await page.click('button[type="submit"]');

    // 6. Check for success message
    await page.waitForSelector('.border-green-200, .bg-green-50', { timeout: 10000 });
    const successMsg = await page.textContent('.border-green-200, .bg-green-50');
    console.log('Success message:', successMsg);

    // 7. Refresh page to test persistence
    console.log('Refreshing page...');
    await page.reload();
    await page.waitForSelector('form', { timeout: 10000 });

    // 8. Verify data persisted
    const name = await page.inputValue('#fullName');
    const phone = await page.inputValue('#phone');
    const courseType = await page.inputValue('#courseType');

    console.log('Data after refresh:', { name, phone, courseType });

    if (name === 'Test User Updated' && phone === '9876543210') {
      console.log('✅ SUCCESS: Profile data persisted correctly!');
    } else {
      console.log('❌ FAILED: Profile data not persisted');
    }

    // Take screenshot
    await page.screenshot({ path: 'profile-test-result.png', fullPage: true });

  } catch (error) {
    console.error('Test failed:', error);
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();