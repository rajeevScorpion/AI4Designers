const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();

  try {
    // Navigate to the app
    const page = await context.newPage();
    await page.goto('http://localhost:5000');

    console.log('Testing authentication flow...');

    // Check if we can access protected routes without auth
    const response = await page.request.get('http://localhost:5000/api/auth/user');
    console.log('Auth status without token:', response.status());

    // Navigate to sign in
    await page.click('[data-testid="button-login"]');
    await page.waitForURL('**/signin');

    // Fill in credentials (you'll need to update these)
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForURL('http://localhost:5000/');

    // Check if token is stored
    const localStorageToken = await page.evaluate(() => localStorage.getItem('supabase_token'));
    console.log('Token in localStorage:', !!localStorageToken);

    // Check if cookie is set
    const cookies = await context.cookies();
    const authCookie = cookies.find(c => c.name === 'supabase_token');
    console.log('Auth cookie set:', !!authCookie);

    // Test authenticated request
    const authResponse = await page.request.get('http://localhost:5000/api/auth/user');
    console.log('Auth status with token:', authResponse.status());

    // Test logout
    await page.click('[data-testid="button-user-menu"]');
    await page.click('[data-testid="link-logout"]');

    // Verify logout
    await page.waitForURL('http://localhost:5000/');
    const localStorageAfterLogout = await page.evaluate(() => localStorage.getItem('supabase_token'));
    console.log('Token cleared after logout:', !localStorageAfterLogout);

    console.log('Authentication test completed!');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
})();