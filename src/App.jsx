import { useEffect, useState } from 'react';

const initialState = { display: '0', firstValue: null, operator: null, waiting: false };

function calculate(a, b, operator) {
  switch (operator) {
    case '+': return a + b;
    case '-': return a - b;
    case '×': return a * b;
    case '÷': return b === 0 ? null : a / b;
    case '%': return a % b;
    default: return b;
  }
}

function formatNumber(value) {
  if (!Number.isFinite(value)) return 'Error';
  const rounded = Math.abs(value) >= 1e12 || (Math.abs(value) > 0 && Math.abs(value) < 1e-9)
    ? Number(value.toPrecision(10))
    : Number(value.toFixed(10));
  return String(rounded);
}

export default function App() {
  const [state, setState] = useState(initialState);
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState([]);
  const [memory, setMemory] = useState(0);
  const [theme, setTheme] = useState('dark');

  const reset = () => { setState(initialState); setExpression(''); };

  const inputDigit = (digit) => setState(s => ({
    ...s,
    display: s.waiting || s.display === 'Error' ? digit : (s.display === '0' ? digit : s.display + digit),
    waiting: false
  }));

  const inputDecimal = () => setState(s => {
    if (s.waiting || s.display === 'Error') return { ...s, display: '0.', waiting: false };
    if (s.display.includes('.')) return s;
    return { ...s, display: s.display + '.' };
  });

  const chooseOperator = (nextOperator) => setState(s => {
    const input = Number(s.display);
    if (s.display === 'Error') return initialState;
    if (s.firstValue !== null && s.operator && !s.waiting) {
      const result = calculate(s.firstValue, input, s.operator);
      if (result === null) return { ...initialState, display: 'Error' };
      const resultText = formatNumber(result);
      setExpression(`${resultText} ${nextOperator}`);
      return { display: resultText, firstValue: result, operator: nextOperator, waiting: true };
    }
    setExpression(`${s.display} ${nextOperator}`);
    return { ...s, firstValue: input, operator: nextOperator, waiting: true };
  });

  const equals = () => setState(s => {
    if (s.firstValue === null || !s.operator || s.waiting) return s;
    const second = Number(s.display);
    const result = calculate(s.firstValue, second, s.operator);
    if (result === null) { setExpression(`${s.firstValue} ÷ 0`); return { ...initialState, display: 'Error' }; }
    const resultText = formatNumber(result);
    const item = `${formatNumber(s.firstValue)} ${s.operator} ${formatNumber(second)} = ${resultText}`;
    setHistory(h => [item, ...h].slice(0, 8));
    setExpression(item);
    return { display: resultText, firstValue: null, operator: null, waiting: true };
  });

  const backspace = () => setState(s => {
    if (s.waiting || s.display === 'Error') return s;
    const next = s.display.length > 1 ? s.display.slice(0, -1) : '0';
    return { ...s, display: next === '-' ? '0' : next };
  });

  const toggleSign = () => setState(s => s.display === '0' || s.display === 'Error' ? s : ({ ...s, display: s.display.startsWith('-') ? s.display.slice(1) : '-' + s.display }));
  const percent = () => setState(s => s.display === 'Error' ? s : ({ ...s, display: formatNumber(Number(s.display) / 100), waiting: false }));

  const memoryAction = (action) => setMemory(m => {
    const value = Number(state.display);
    if (action === 'clear') return 0;
    if (action === 'add') return m + value;
    if (action === 'subtract') return m - value;
    if (action === 'recall') setState(s => ({ ...s, display: formatNumber(m), waiting: false }));
    return m;
  });

  const press = (key) => {
    if (/^[0-9]$/.test(key)) inputDigit(key);
    else if (key === '.') inputDecimal();
    else if (['+', '-', '×', '÷', '%'].includes(key)) chooseOperator(key);
    else if (key === '=') equals();
    else if (key === 'C') reset();
    else if (key === '⌫') backspace();
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      const map = { '*': '×', '/': '÷', Enter: '=', Escape: 'C', Backspace: '⌫' };
      const key = map[event.key] || event.key;
      if (/^[0-9.+\-/%]$/.test(event.key) || ['*', '/', 'Enter', 'Escape', 'Backspace'].includes(event.key)) {
        event.preventDefault();
        press(key);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const Button = ({ children, action, className = '' }) => <button className={`button ${className}`} onClick={action}>{children}</button>;

  return (
    <main className={`app ${theme}`}>
      <section className="calculator-shell">
        <div className="topbar">
          <div><span className="dot" /> React Calculator</div>
          <button className="theme-button" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? '☀' : '☾'}</button>
        </div>

        <div className="display-panel">
          <div className="expression">{expression || 'Ready'}</div>
          <div className="display">{state.display}</div>
          <div className="memory-indicator">M: {formatNumber(memory)}</div>
        </div>

        <div className="memory-row">
          <Button action={() => memoryAction('clear')}>MC</Button>
          <Button action={() => memoryAction('recall')}>MR</Button>
          <Button action={() => memoryAction('add')}>M+</Button>
          <Button action={() => memoryAction('subtract')}>M−</Button>
          <Button action={() => setHistory([])}>Clear History</Button>
        </div>

        <div className="keypad">
          <Button action={reset} className="danger">C</Button>
          <Button action={backspace}>⌫</Button>
          <Button action={percent}>%</Button>
          <Button action={() => chooseOperator('÷')} className="operator">÷</Button>
          {[7,8,9].map(n => <Button key={n} action={() => inputDigit(String(n))}>{n}</Button>)}
          <Button action={() => chooseOperator('×')} className="operator">×</Button>
          {[4,5,6].map(n => <Button key={n} action={() => inputDigit(String(n))}>{n}</Button>)}
          <Button action={() => chooseOperator('-')} className="operator">−</Button>
          {[1,2,3].map(n => <Button key={n} action={() => inputDigit(String(n))}>{n}</Button>)}
          <Button action={() => chooseOperator('+')} className="operator">+</Button>
          <Button action={toggleSign}>±</Button>
          <Button action={() => inputDigit('0')} className="zero">0</Button>
          <Button action={inputDecimal}>.</Button>
          <Button action={equals} className="equals">=</Button>
        </div>

        <aside className="history">
          <div className="history-title">History</div>
          {history.length === 0 ? <p>No calculations yet.</p> : history.map((item, index) => <div className="history-item" key={`${item}-${index}`}>{item}</div>)}
        </aside>
        <p className="hint">Keyboard supported · React + JavaScript · No external calculator library</p>
      </section>
    </main>
  );
}
