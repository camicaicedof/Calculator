import { useState } from 'react';
import { calculate, type Operation } from './api';

type BinaryOperation = 'add' | 'subtract' | 'multiply' | 'divide' | 'power';

const operationSymbols = {
  add: '+',
  subtract: '−',
  multiply: '×',
  divide: '÷',
  power: '^',
};

const operationPriority = {
  add: 1,
  subtract: 1,
  multiply: 2,
  divide: 2,
  power: 3,
};

export default function App() {
  // Inputs stay as text so the user can enter a number like "2.".
  const [firstInput, setFirstInput] = useState('0');
  const [secondInput, setSecondInput] = useState('');
  const [selectedOperation, setSelectedOperation] = useState<BinaryOperation | null>(null);
  const [previousNumbers, setPreviousNumbers] = useState<number[]>([]);
  const [previousOperations, setPreviousOperations] = useState<BinaryOperation[]>([]);
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const currentInput = selectedOperation === null ? firstInput : secondInput;
  const display = result === null ? currentInput || firstInput : String(result);

  function clearCalculator() {
    setFirstInput('0');
    setSecondInput('');
    setSelectedOperation(null);
    setPreviousNumbers([]);
    setPreviousOperations([]);
    setResult(null);
    setError('');
  }

  function updateInput(value: string) {
    setResult(null);
    setError('');

    if (selectedOperation === null) {
      setFirstInput(value);
    } else {
      setSecondInput(value);
    }
  }

  function enterDigit(digit: string) {
    // A digit typed after a result starts a new number.
    let value = result === null ? currentInput : '';

    if (digit === '.') {
      if (value.includes('.')) return;
      updateInput((value || '0') + '.');
      return;
    }

    if (value.replace(/[-.]/g, '').length >= 16) return;
    if (value === '0') value = '';
    if (value === '-0') value = '-';
    updateInput(value + digit);
  }

  function deleteDigit() {
    if (selectedOperation !== null && secondInput === '') return;
    const value = result === null ? currentInput.slice(0, -1) : '';
    updateInput(value === '' || value === '-' ? '0' : value);
  }

  function changeSign() {
    let value = display;
    if (selectedOperation !== null && secondInput === '') value = '0';

    if (value.startsWith('-')) {
      updateInput(value.slice(1));
    } else {
      updateInput('-' + value);
    }
  }

  // All arithmetic goes through this one API call.
  async function requestCalculation(operation: Operation, a: number, b?: number) {
    setIsLoading(true);
    setError('');

    try {
      return await calculate(operation, a, b);
    } catch (error) {
      clearCalculator();
      setError(error instanceof Error ? error.message : 'Calculation failed. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  function selectOperation(operation: BinaryOperation) {
    let firstNumber = result === null ? Number(firstInput) : result;

    // Keep the expression until equals, so higher-priority operations run first.
    if (selectedOperation !== null && secondInput !== '') {
      setPreviousNumbers([...previousNumbers, Number(firstInput)]);
      setPreviousOperations([...previousOperations, selectedOperation]);
      firstNumber = Number(secondInput);
    }

    setFirstInput(String(firstNumber));
    setSecondInput('');
    setSelectedOperation(operation);
    setResult(null);
    setError('');
  }

  async function showResult() {
    if (selectedOperation === null || secondInput === '') return;

    // Work on copies, reducing powers, then multiplication/division, then addition/subtraction.
    // Scanning left to right preserves order when operations have equal priority.
    const numbers = [...previousNumbers, Number(firstInput), Number(secondInput)];
    const operations = [...previousOperations, selectedOperation];

    for (const priority of [3, 2, 1]) {
      let index = 0;
      while (index < operations.length) {
        if (operationPriority[operations[index]] !== priority) {
          index++;
          continue;
        }

        const answer = await requestCalculation(operations[index], numbers[index], numbers[index + 1]);
        if (answer === null) return;
        numbers.splice(index, 2, answer);
        operations.splice(index, 1);
      }
    }

    const answer = numbers[0];
    setFirstInput(String(answer));
    setSecondInput('');
    setSelectedOperation(null);
    setPreviousNumbers([]);
    setPreviousOperations([]);
    setResult(answer);
  }

  async function applyUnaryOperation(operation: 'sqrt' | 'percentage') {
    const answer = await requestCalculation(operation, Number(display));
    if (answer === null) return;

    updateInput(String(answer));
    setResult(answer);
  }

  return (
    <main>
      <h1>Calculator</h1>
      <p className="instructions">Enter a number, choose an operation, then press equals.</p>

      <section className="calculator" aria-label="Calculator" aria-busy={isLoading}>
        <div className="display">
          <p className="expression">
            {selectedOperation === null ? 'Result' : (
              previousNumbers.map((number, index) => `${number} ${operationSymbols[previousOperations[index]]}`).join(' ')
              + ` ${firstInput} ${operationSymbols[selectedOperation]}`
            )}
          </p>
          <output aria-label="Calculation result" aria-live="polite">{display}</output>
        </div>

        {error && <p className="error" role="alert">{error}</p>}

        <fieldset disabled={isLoading} aria-label="Calculator keys">
          <div className="extra-buttons">
            <button onClick={() => applyUnaryOperation('sqrt')} aria-label="Square root">√</button>
            <button onClick={() => selectOperation('power')} aria-label="Power" aria-pressed={selectedOperation === 'power'}>xʸ</button>
            <button onClick={() => applyUnaryOperation('percentage')} aria-label="Percentage">%</button>
          </div>

          <div className="keypad">
            <button className="utility" onClick={clearCalculator}>AC</button>
            <button className="utility" onClick={deleteDigit} aria-label="Delete last digit">⌫</button>
            <button className="utility" onClick={changeSign} aria-label="Change sign">±</button>
            <button className="operator" onClick={() => selectOperation('divide')} aria-label="Divide" aria-pressed={selectedOperation === 'divide'}>÷</button>

            <button onClick={() => enterDigit('7')}>7</button>
            <button onClick={() => enterDigit('8')}>8</button>
            <button onClick={() => enterDigit('9')}>9</button>
            <button className="operator" onClick={() => selectOperation('multiply')} aria-label="Multiply" aria-pressed={selectedOperation === 'multiply'}>×</button>

            <button onClick={() => enterDigit('4')}>4</button>
            <button onClick={() => enterDigit('5')}>5</button>
            <button onClick={() => enterDigit('6')}>6</button>
            <button className="operator" onClick={() => selectOperation('subtract')} aria-label="Subtract" aria-pressed={selectedOperation === 'subtract'}>−</button>

            <button onClick={() => enterDigit('1')}>1</button>
            <button onClick={() => enterDigit('2')}>2</button>
            <button onClick={() => enterDigit('3')}>3</button>
            <button className="operator" onClick={() => selectOperation('add')} aria-label="Add" aria-pressed={selectedOperation === 'add'}>+</button>

            <button className="zero" onClick={() => enterDigit('0')}>0</button>
            <button onClick={() => enterDigit('.')} aria-label="Decimal point">.</button>
            <button className="equals" onClick={showResult} aria-label="Equals">=</button>
          </div>
        </fieldset>

        <p className="status" role="status">{isLoading ? 'Calculating…' : '% converts a number to a decimal: 25% = 0.25.'}</p>
      </section>
    </main>
  );
}
