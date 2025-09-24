import { test, expect } from '@playwright/test';

test.describe('AI4Designers Database Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the test page
    await page.goto('http://localhost:3002/supabase-test-new');

    // Wait for page to load
    await page.waitForSelector('h1:has-text("Supabase CRUD Test Page")');
  });

  test('Database connection should be established', async ({ page }) => {
    // Check connection status
    const connectionStatus = page.locator('[data-testid="connection-status"], .bg-green-100, .bg-red-100, .bg-yellow-100');
    await expect(connectionStatus).toBeVisible();

    // Wait for connection to be established
    await page.waitForTimeout(3000);

    // Check if connection is successful
    const isConnected = await page.locator('text=/Status: CONNECTED/').isVisible();
    if (!isConnected) {
      // Take screenshot for debugging
      await page.screenshot({ path: 'connection-status.png', fullPage: true });
      console.log('Connection status screenshot saved');
    }

    // Connection should be either connected or we should see an error message
    const statusText = await connectionStatus.textContent();
    console.log('Connection status:', statusText);
    expect(statusText).toContain('CONNECTED');
  });

  test('Create user functionality should work', async ({ page }) => {
    // Wait for connection
    await page.waitForTimeout(2000);

    // Fill in user creation form
    await page.fill('input[placeholder="Full Name"]', 'Test User');
    await page.fill('input[placeholder="Email"]', `test${Date.now()}@example.com`);
    await page.fill('input[placeholder="Phone"]', '1234567890');
    await page.selectOption('select', 'working');
    await page.fill('input[placeholder="Organization"]', 'Test Organization');

    // Click create user button
    await page.click('button:has-text("Create User")');

    // Wait for operation to complete
    await page.waitForTimeout(2000);

    // Check if user was created (should appear in users list)
    const usersList = page.locator('.space-y-2 >> text=/Test User/');
    await expect(usersList.first()).toBeVisible({ timeout: 5000 });

    console.log('User creation test passed');
  });

  test('Create progress functionality should work', async ({ page }) => {
    // Wait for connection and existing data
    await page.waitForTimeout(3000);

    // Check if there are any users to create progress for
    const userSelect = page.locator('select:has-text("Select User")');
    const optionsCount = await userSelect.locator('option').count();

    if (optionsCount > 1) { // More than just the placeholder
      // Select first user
      await userSelect.selectOption({ index: 1 });

      // Fill progress form
      await page.fill('input[placeholder="Day (1-5)"]', '1');
      await page.fill('input[placeholder="Current Slide"]', '0');

      // Click create progress button
      await page.click('button:has-text("Create Progress")');

      // Wait for operation
      await page.waitForTimeout(2000);

      // Check if progress was created
      const progressList = page.locator('.space-y-2 >> text=/Day 1/');
      await expect(progressList.first()).toBeVisible({ timeout: 5000 });

      console.log('Progress creation test passed');
    } else {
      console.log('No users available for progress test - skipping');
    }
  });

  test('Comprehensive CRUD test should work', async ({ page }) => {
    // Wait for connection
    await page.waitForTimeout(2000);

    // Click run comprehensive test button
    await page.click('button:has-text("Run CRUD Test")');

    // Wait for test to complete
    await page.waitForTimeout(5000);

    // Check test results
    const testResults = page.locator('.space-y-2 >> .bg-green-50, .bg-red-50');
    const resultsCount = await testResults.count();

    console.log(`Comprehensive test results: ${resultsCount} tests found`);

    // Take screenshot for debugging
    await page.screenshot({ path: 'comprehensive-test-results.png', fullPage: true });

    // At least some tests should pass
    const passedTests = page.locator('.space-y-2 >> .bg-green-50');
    const passedCount = await passedTests.count();

    console.log(`Passed tests: ${passedCount}`);

    // We expect at least read operations to work
    expect(passedCount).toBeGreaterThan(0);
  });

  test('Database should display existing data', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(3000);

    // Check users section
    const usersSection = page.locator('h3:has-text("Users")');
    await expect(usersSection).toBeVisible();

    const usersCount = await page.locator('.space-y-2 >> .p-3.border').count();
    console.log(`Users displayed: ${usersCount}`);

    // Check progress section
    const progressSection = page.locator('h3:has-text("Progress Records")');
    await expect(progressSection).toBeVisible();

    const progressCount = await page.locator(':text("Progress Records") + .space-y-2 >> .p-3.border').count();
    console.log(`Progress records displayed: ${progressCount}`);

    // Take screenshot of current state
    await page.screenshot({ path: 'database-state.png', fullPage: true });
  });
});

test.describe('API Endpoints Tests', () => {
  test('GET /api/progress should return data structure', async ({ request }) => {
    const response = await request.get('http://localhost:3002/api/progress');

    expect(response.status()).toBe(200);

    const data = await response.json();
    console.log('Progress API response:', JSON.stringify(data, null, 2));

    // Should have expected structure
    expect(data).toHaveProperty('progress');
    expect(data).toHaveProperty('user');
  });

  test('POST /api/create-user should create user', async ({ request }) => {
    const userData = {
      fullname: 'API Test User',
      email: `api-test-${Date.now()}@example.com`,
      phone: '9876543210',
      profession: 'student',
      organization: 'API Test Organization'
    };

    const response = await request.post('http://localhost:3002/api/create-user', {
      data: userData
    });

    expect(response.status()).toBe(200);

    const result = await response.json();
    console.log('Create user API response:', JSON.stringify(result, null, 2));

    expect(result).toHaveProperty('success', true);
  });

  test('POST /api/progress should update progress', async ({ request }) => {
    const progressData = {
      dayId: 1,
      currentSlide: 5,
      completedSections: ['intro', 'basics'],
      completedSlides: ['slide1', 'slide2'],
      quizScores: { quiz1: 85 },
      isCompleted: false
    };

    const response = await request.post('http://localhost:3002/api/progress', {
      data: progressData
    });

    expect(response.status()).toBe(200);

    const result = await response.json();
    console.log('Progress API response:', JSON.stringify(result, null, 2));

    expect(result).toHaveProperty('success', true);
  });
});

test.describe('Database Schema Verification', () => {
  test('Database tables should be accessible', async ({ page }) => {
    // This test verifies that the new schema is working
    await page.goto('http://localhost:3002/supabase-test-new');

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Check if connection is established
    const connectionIndicator = page.locator('text=/Status: CONNECTED/');
    await expect(connectionIndicator).toBeVisible({ timeout: 10000 });

    // Check that no database errors are shown
    const errorElements = page.locator('.bg-red-100 >> text=/Error:/');
    const errorCount = await errorElements.count();

    console.log(`Database errors found: ${errorCount}`);

    // We expect no database schema errors
    expect(errorCount).toBe(0);

    // Take screenshot for verification
    await page.screenshot({ path: 'schema-verification.png', fullPage: true });
  });
});