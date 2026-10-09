import { test, expect } from '@playwright/test';

test.describe('Posts API (JSONPlaceholder)', () => {
  test('GET /posts/1 returns the expected contract', async ({ request }) => {
    const res = await request.get('/posts/1');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({
      id: 1,
      userId: expect.any(Number),
      title: expect.any(String),
      body: expect.any(String),
    });
  });

  test('GET /posts?userId=1 filters correctly', async ({ request }) => {
    const res = await request.get('/posts', { params: { userId: 1 } });
    expect(res.ok()).toBeTruthy();
    const posts = await res.json();
    expect(posts).toHaveLength(10);
    for (const p of posts) expect(p.userId).toBe(1);
  });

  test('POST /posts creates a resource', async ({ request }) => {
    const res = await request.post('/posts', {
      data: { title: 'qa-lab', body: 'portfolio', userId: 1 },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.title).toBe('qa-lab');
    expect(body.id).toBeDefined();
  });

  test('GET unknown post returns 404', async ({ request }) => {
    const res = await request.get('/posts/999999');
    expect(res.status()).toBe(404);
  });
});
