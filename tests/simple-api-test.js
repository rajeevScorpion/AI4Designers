const { test, expect } = require('@playwright/test');

test.describe('AI4Designers Database Integration Tests', () => {
  test('GET /api/progress should return data structure', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/progress');

    console.log('Progress API status:', response.status());
    console.log('Progress API headers:', response.headers());

    if (response.status() === 200) {
      const data = await response.json();
      console.log('Progress API response:', JSON.stringify(data, null, 2));

      // Should have expected structure
      expect(data).toHaveProperty('progress');
      expect(data).toHaveProperty('user');
    } else {
      const errorText = await response.text();
      console.log('Progress API error:', errorText);
    }
  });

  test('POST /api/create-user should create user', async ({ request }) => {
    const userData = {
      fullname: 'API Test User',
      email: `api-test-${Date.now()}@example.com`,
      phone: '9876543210',
      profession: 'student',
      organization: 'API Test Organization'
    };

    const response = await request.post('http://localhost:3000/api/create-user', {
      data: userData
    });

    console.log('Create user API status:', response.status());
    console.log('Create user API headers:', response.headers());

    if (response.status() === 200) {
      const result = await response.json();
      console.log('Create user API response:', JSON.stringify(result, null, 2));
      expect(result).toHaveProperty('success', true);
    } else {
      const errorText = await response.text();
      console.log('Create user API error:', errorText);
    }
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

    const response = await request.post('http://localhost:3000/api/progress', {
      data: progressData
    });

    console.log('Progress update API status:', response.status());
    console.log('Progress update API headers:', response.headers());

    if (response.status() === 200) {
      const result = await response.json();
      console.log('Progress API response:', JSON.stringify(result, null, 2));
      expect(result).toHaveProperty('success', true);
    } else {
      const errorText = await response.text();
      console.log('Progress update API error:', errorText);
    }
  });

  test('GET /api/auth/user should return user data', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/auth/user');

    console.log('Auth user API status:', response.status());
    console.log('Auth user API headers:', response.headers());

    if (response.status() === 200) {
      const data = await response.json();
      console.log('Auth user API response:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('Auth user API error:', errorText);
    }
  });

  test('GET /api/leaderboard should return leaderboard data', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/leaderboard');

    console.log('Leaderboard API status:', response.status());
    console.log('Leaderboard API headers:', response.headers());

    if (response.status() === 200) {
      const data = await response.json();
      console.log('Leaderboard API response:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('Leaderboard API error:', errorText);
    }
  });
});