export type Operation =
  | 'add'
  | 'subtract'
  | 'multiply'
  | 'divide'
  | 'power'
  | 'sqrt'
  | 'percentage';

export async function calculate(operation: Operation, a: number, b?: number): Promise<number> {
  let response: Response;
  try {
    response = await fetch('/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation, a, b }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new Error('Could not reach the calculator. Please try again.');
  }
  let data: { result?: unknown; error?: unknown };
  try {
    data = await response.json();
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid JSON object');
    }
  } catch {
    throw new Error('The server returned an invalid response.');
  }
  if (!response.ok) {
    throw new Error(typeof data.error === 'string' ? data.error : 'The calculation failed. Please try again.');
  }
  if (typeof data.result !== 'number' || !Number.isFinite(data.result)) {
    throw new Error('The server returned an invalid result.');
  }
  return data.result;
}
