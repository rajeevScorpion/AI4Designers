import { test, expect } from '@playwright/test';

test.describe('Auth Storage Test', () => {
  test('check localStorage after sign in', async ({ page }) => {
    // Navigate to sign in page
    await page.goto('/signin');

    // Fill in form
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');

    // Submit form
    await page.click('form button[type="submit"]');

    // Wait for API response
    await page.waitForTimeout(3000);

    // Check localStorage
    const localStorage = await page.evaluate(() => {
      return {
        supabaseAuth: window.localStorage.getItem('supabase.auth.token')
      };
    });

    console.log('LocalStorage contents:', localStorage);

    // Check if session was established
    const hasSession = await page.evaluate(async () => {
      if (window.supabase) {
        const { data, error } = await window.supabase.auth.getSession();
        return { hasSession: !!data.session, error: error?.message };
      }
      return { hasSession: false, error: 'Supabase not found' };
    });

    console.log('Session check:', hasSession);

    // Manually trigger the auth state change
    await page.evaluate(() => {
      if (window.supabase) {
        window.supabase.auth.onAuthStateChange((event, session) => {
          console.log('Auth state change:', event, session?.user?.email);
        });
      }
    });

    // Wait a bit more
    await page.waitForTimeout(2000);

    // Check URL again
    console.log('Final URL:', page.url());
  });
});