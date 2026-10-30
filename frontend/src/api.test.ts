import { expect, it, vi } from 'vitest';
import { calculate } from './api';

it('posts JSON and returns the server result', async () => {
  const fetchMock = vi.fn().mockResolvedValue(new Response('{"result":5}'));
  vi.stubGlobal('fetch', fetchMock);

  expect(await calculate('add', 2, 3)).toBe(5);
  expect(fetchMock).toHaveBeenCalledWith('/api/calculate', expect.objectContaining({
    method: 'POST',
    body: '{"operation":"add","a":2,"b":3}',
  }));
});

it('shows a helpful message when the server cannot be reached', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network')));

  await expect(calculate('sqrt', 9)).rejects.toThrow('Could not reach the calculator');
});

it.each([
  [new Response('{"error":"cannot divide by zero"}', { status: 400 }), 'cannot divide by zero'],
  [new Response('{}', { status: 500 }), 'The calculation failed'],
  [new Response('not JSON'), 'invalid response'],
  [new Response('{"result":"5"}'), 'invalid result'],
])('rejects failed or invalid responses', async (response, message) => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));

  await expect(calculate('divide', 2, 0)).rejects.toThrow(message);
});
