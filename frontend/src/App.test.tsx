import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import App from './App';

function mockResult(result: number) {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ result })));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

async function pressButtons(...names: string[]) {
  const user = userEvent.setup();
  for (const name of names) {
    await user.click(screen.getByRole('button', { name }));
  }
}

function getDisplay() {
  return screen.getByLabelText('Calculation result');
}

it.each([
  ['Add', 'add', 10],
  ['Subtract', 'subtract', 6],
  ['Multiply', 'multiply', 16],
  ['Divide', 'divide', 4],
  ['Power', 'power', 64],
])('sends a %s calculation to the API and displays its result', async (button, operation, result) => {
  const fetchMock = mockResult(result);
  render(<App />);

  await pressButtons('8', button, '2', 'Equals');

  await waitFor(() => expect(getDisplay()).toHaveTextContent(String(result)));
  expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ operation, a: 8, b: 2 });
});

it.each([
  ['Square root', 'sqrt', 4],
  ['Percentage', 'percentage', 0.16],
])('supports %s with one number', async (button, operation, result) => {
  const fetchMock = mockResult(result);
  render(<App />);

  await pressButtons('1', '6', button);

  await waitFor(() => expect(getDisplay()).toHaveTextContent(String(result)));
  expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ operation, a: 16 });
});

it('allows decimal entry, sign changes, deleting, and clearing', async () => {
  render(<App />);

  await pressButtons('Decimal point', '5', 'Decimal point', 'Change sign');
  expect(getDisplay()).toHaveTextContent('-0.5');

  await pressButtons('Delete last digit');
  expect(getDisplay()).toHaveTextContent('-0.');

  await pressButtons('AC');
  expect(getDisplay()).toHaveTextContent('0');
});

it('multiplies before adding and starts a new number after equals', async () => {
  const fetchMock = vi.fn()
    .mockResolvedValueOnce(new Response('{"result":12}'))
    .mockResolvedValueOnce(new Response('{"result":14}'));
  vi.stubGlobal('fetch', fetchMock);
  render(<App />);

  await pressButtons('2', 'Add', '3', 'Multiply');
  expect(fetchMock).not.toHaveBeenCalled();
  await pressButtons('4', 'Equals');

  await waitFor(() => expect(getDisplay()).toHaveTextContent('14'));
  expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ operation: 'multiply', a: 3, b: 4 });
  expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ operation: 'add', a: 2, b: 12 });

  await pressButtons('7');
  expect(getDisplay()).toHaveTextContent('7');
});

it.each([
  [['8', 'Subtract', '3', 'Add', '2', 'Equals'], [5, 7], 'subtract', 8, 3, '7'],
  [['8', 'Divide', '2', 'Multiply', '3', 'Equals'], [4, 12], 'divide', 8, 2, '12'],
  [['2', 'Multiply', '3', 'Power', '2', 'Equals'], [9, 18], 'power', 3, 2, '18'],
  [['2', 'Power', '3', 'Power', '2', 'Equals'], [8, 64], 'power', 2, 3, '64'],
  [['2', 'Add', '3', 'Multiply', '4', 'Subtract', '6', 'Divide', '2', 'Equals'], [12, 3, 14, 11], 'multiply', 3, 4, '11'],
])('respects precedence and left-to-right order: %j', async (keys, results, operation, a, b, expected) => {
  const fetchMock = vi.fn();
  for (const result of results) {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ result })));
  }
  vi.stubGlobal('fetch', fetchMock);
  render(<App />);

  await pressButtons(...keys);

  await waitFor(() => expect(getDisplay()).toHaveTextContent(expected));
  expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ operation, a, b });
});

it('displays the decimal API result without a floating-point tail', async () => {
  const fetchMock = mockResult(0.3);
  render(<App />);

  await pressButtons('0', 'Decimal point', '1', 'Add', '0', 'Decimal point', '2', 'Equals');

  await waitFor(() => expect(getDisplay().textContent).toBe('0.3'));
  expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ operation: 'add', a: 0.1, b: 0.2 });
});

it('replaces an operator and waits until a second number is entered', async () => {
  const fetchMock = mockResult(6);
  render(<App />);

  await pressButtons('8', 'Add', 'Subtract', 'Equals');
  expect(fetchMock).not.toHaveBeenCalled();

  await pressButtons('2', 'Equals');
  await waitFor(() => expect(getDisplay()).toHaveTextContent('6'));
});

it('shows an API error and allows the user to try again', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
    new Response('{"error":"cannot divide by zero"}', { status: 400 }),
  ));
  render(<App />);

  await pressButtons('8', 'Divide', '0', 'Equals');
  expect(await screen.findByRole('alert')).toHaveTextContent('cannot divide by zero');

  await pressButtons('7');
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(getDisplay()).toHaveTextContent('7');
});

it('disables the keypad while waiting for the API', async () => {
  let finishRequest!: (response: Response) => void;
  vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise<Response>(resolve => {
    finishRequest = resolve;
  })));
  render(<App />);

  await pressButtons('1', 'Add', '2', 'Equals');
  expect(screen.getByRole('button', { name: 'Equals' })).toBeDisabled();

  finishRequest(new Response('{"result":3}'));
  await waitFor(() => expect(getDisplay()).toHaveTextContent('3'));
  expect(screen.getByRole('button', { name: 'Equals' })).toBeEnabled();
});
