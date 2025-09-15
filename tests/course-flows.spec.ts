import { test, expect } from '@playwright/test';

test.describe('AI Fundamentals Course Flow Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:5000');
  });

  test.describe('Day Navigation', () => {
    test('should display all 5 days and navigate between them', async ({ page }) => {
      // Wait for course content to load
      await page.waitForSelector('[data-testid="course-container"]');

      // Check if all day buttons are present
      const dayButtons = await page.locator('button:has-text("Day")').all();
      expect(dayButtons.length).toBe(5);

      // Test navigation to each day
      for (let i = 1; i <= 5; i++) {
        await page.click(`button:has-text("Day ${i}")`);
        await page.waitForSelector(`[data-testid="day-${i}-content"]`, { state: 'visible' });

        // Verify day content is visible
        const dayContent = await page.locator(`[data-testid="day-${i}-content"]`);
        await expect(dayContent).toBeVisible();
      }
    });

    test('should track progress correctly', async ({ page }) => {
      // Complete activities for Day 1
      await page.click('button:has-text("Day 1")');

      // Check initial progress
      const progressBar = await page.locator('[data-testid="progress-bar"]');
      const initialWidth = await progressBar.getAttribute('aria-valuenow');

      // Simulate completing activities
      const activities = await page.locator('[data-testid^="activity-"]').all();
      for (const activity of activities) {
        await activity.click();
        // Wait for completion animation/state change
        await page.waitForTimeout(500);
      }

      // Check updated progress
      const updatedWidth = await progressBar.getAttribute('aria-valuenow');
      expect(parseInt(updatedWidth)).toBeGreaterThan(parseInt(initialWidth || '0'));
    });
  });

  test.describe('Flip Cards', () => {
    test.beforeEach(async ({ page }) => {
      await page.click('button:has-text("Day 1")');
      await page.waitForSelector('[data-testid="day-1-content"]');
    });

    test('should flip cards without breaking layout', async ({ page }) => {
      // Find all flip cards
      const flipCards = await page.locator('[data-testid="flip-card"]').all();

      for (const card of flipCards) {
        // Get initial position and dimensions
        const initialBox = await card.boundingBox();

        // Flip the card
        await card.click();
        await page.waitForTimeout(600); // Wait for flip animation

        // Check if card maintains position
        const flippedBox = await card.boundingBox();
        expect(flippedBox?.x).toBe(initialBox?.x);
        expect(flippedBox?.y).toBe(initialBox?.y);
        expect(flippedBox?.width).toBe(initialBox?.width);
        expect(flippedBox?.height).toBe(initialBox?.height);

        // Check if content is visible after flip
        const backContent = await card.locator('[data-testid="card-back"]');
        await expect(backContent).toBeVisible();

        // Flip back
        await card.click();
        await page.waitForTimeout(600);

        // Verify front content is visible
        const frontContent = await card.locator('[data-testid="card-front"]');
        await expect(frontContent).toBeVisible();
      }
    });

    test('should not drop down when flipped', async ({ page }) => {
      // Test specific card that might have layout issues
      const flipCard = page.locator('[data-testid="flip-card"]').first();
      const parentContainer = page.locator('[data-testid="cards-container"]').first();

      // Get container height before flip
      const initialHeight = await parentContainer.boundingBox();

      // Flip the card
      await flipCard.click();
      await page.waitForTimeout(600);

      // Check if container height remains the same
      const afterFlipHeight = await parentContainer.boundingBox();
      expect(afterFlipHeight?.height).toBe(initialHeight?.height);
    });
  });

  test.describe('Video Tabs', () => {
    test('should display multiple videos in tabs', async ({ page }) => {
      // Navigate to a day with videos
      await page.click('button:has-text("Day 2")');
      await page.waitForSelector('[data-testid="day-2-content"]');

      // Check for video tabs
      const videoTabs = await page.locator('[role="tab"]').all();
      expect(videoTabs.length).toBeGreaterThan(0);

      // Test each tab
      for (let i = 0; i < videoTabs.length; i++) {
        await videoTabs[i].click();
        await page.waitForTimeout(300);

        // Verify video player is visible
        const videoPlayer = await page.locator('[data-testid="video-player"]');
        await expect(videoPlayer).toBeVisible();
      }
    });
  });

  test.describe('Quizzes and Activities', () => {
    test('should handle quiz interactions', async ({ page }) => {
      // Navigate to a day with quizzes
      await page.click('button:has-text("Day 3")');
      await page.waitForSelector('[data-testid="day-3-content"]');

      // Find quiz questions
      const quizQuestions = await page.locator('[data-testid="quiz-question"]').all();

      for (const question of quizQuestions) {
        // Select an answer
        const answerOption = question.locator('[data-testid="quiz-option"]').first();
        await answerOption.click();

        // Submit answer
        const submitButton = question.locator('button:has-text("Submit")');
        if (await submitButton.isVisible()) {
          await submitButton.click();
          await page.waitForTimeout(500);

          // Check for feedback
          const feedback = await question.locator('[data-testid="quiz-feedback"]');
          await expect(feedback).toBeVisible();
        }
      }
    });
  });

  test.describe('Platform Links', () => {
    test('should open platform links correctly', async ({ page }) => {
      // Test platform links on Day 4
      await page.click('button:has-text("Day 4")');
      await page.waitForSelector('[data-testid="day-4-content"]');

      // Find platform links
      const platformLinks = await page.locator('a[href*="platform"]').all();

      // Verify links have proper attributes
      for (const link of platformLinks) {
        expect(await link.getAttribute('target')).toBe('_blank');
        expect(await link.getAttribute('rel')).toContain('noopener');
      }
    });
  });

  test.describe('Course Completion', () => {
    test('should handle course completion flow', async ({ page }) => {
      // Navigate through all days
      for (let day = 1; day <= 5; day++) {
        await page.click(`button:has-text("Day ${day}")`);
        await page.waitForSelector(`[data-testid="day-${day}-content"]`);

        // Complete all activities
        const activities = await page.locator('[data-testid^="activity-"]').all();
        for (const activity of activities) {
          if (await activity.isVisible()) {
            await activity.click();
            await page.waitForTimeout(300);
          }
        }
      }

      // Check for completion certificate or message
      await expect(page.locator('[data-testid="course-complete"]')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Test navigation
      await page.click('button:has-text("Day 1")');
      await page.waitForSelector('[data-testid="day-1-content"]');

      // Test flip card on mobile
      const flipCard = page.locator('[data-testid="flip-card"]').first();
      await flipCard.click();
      await page.waitForTimeout(600);

      // Verify content is accessible
      const backContent = await page.locator('[data-testid="card-back"]');
      await expect(backContent).toBeVisible();
    });
  });
});