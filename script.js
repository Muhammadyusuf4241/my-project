class Calculator {
  constructor(previousOperandElement, currentOperandElement) {
    this.previousOperandElement = previousOperandElement;
    this.currentOperandElement = currentOperandElement;
    this.clear();
  }

  clear() {
    this.currentOperand = '0';
    this.previousOperand = '';
    this.operation = undefined;
    this.shouldResetScreen = false;
  }

  delete() {
    if (this.shouldResetScreen) {
      this.clear();
      return;
    }
    if (this.currentOperand === '0' || this.currentOperand === 'Xatolik' || this.currentOperand === "0 ga bo'lib bo'lmaydi") {
      this.currentOperand = '0';
      return;
    }
    if (this.currentOperand.length === 1 || (this.currentOperand.length === 2 && this.currentOperand.startsWith('-'))) {
      this.currentOperand = '0';
    } else {
      this.currentOperand = this.currentOperand.slice(0, -1);
    }
  }

  appendNumber(number) {
    if (this.shouldResetScreen) {
      this.currentOperand = '';
      this.shouldResetScreen = false;
    }
    if (this.currentOperand === '0' && number !== '.') {
      this.currentOperand = number.toString();
      return;
    }
    if (number === '.' && this.currentOperand.includes('.')) return;
    if (this.currentOperand.length >= 15) return; // Prevent excessive length

    this.currentOperand = this.currentOperand.toString() + number.toString();
  }

  appendDecimal() {
    if (this.shouldResetScreen) {
      this.currentOperand = '0';
      this.shouldResetScreen = false;
    }
    if (!this.currentOperand.includes('.')) {
      this.currentOperand += '.';
    }
  }

  toggleSign() {
    if (this.currentOperand === '0' || this.isErrorState()) return;
    if (this.currentOperand.startsWith('-')) {
      this.currentOperand = this.currentOperand.slice(1);
    } else {
      this.currentOperand = '-' + this.currentOperand;
    }
  }

  applyPercent() {
    if (this.isErrorState()) return;
    const current = parseFloat(this.currentOperand);
    if (isNaN(current)) return;

    if (this.previousOperand !== '' && this.operation) {
      const prev = parseFloat(this.previousOperand);
      // If previous operand exists, compute percent of previous (e.g. 200 + 10% = 200 + 20)
      if (!isNaN(prev)) {
        const percentValue = (prev * current) / 100;
        this.currentOperand = this.formatCalculatedResult(percentValue);
        return;
      }
    }

    this.currentOperand = this.formatCalculatedResult(current / 100);
  }

  chooseOperation(operation) {
    if (this.isErrorState()) {
      this.clear();
      return;
    }
    if (this.currentOperand === '') return;
    if (this.previousOperand !== '') {
      this.compute();
    }
    this.operation = operation;
    this.previousOperand = this.currentOperand;
    this.shouldResetScreen = true;
  }

  compute() {
    let computation;
    const prev = parseFloat(this.previousOperand);
    const current = parseFloat(this.currentOperand);
    if (isNaN(prev) || isNaN(current)) return;

    switch (this.operation) {
      case '+':
        computation = prev + current;
        break;
      case '−':
      case '-':
        computation = prev - current;
        break;
      case '×':
      case '*':
        computation = prev * current;
        break;
      case '÷':
      case '/':
        if (current === 0) {
          this.currentOperand = "0 ga bo'lib bo'lmaydi";
          this.previousOperand = '';
          this.operation = undefined;
          this.shouldResetScreen = true;
          return;
        }
        computation = prev / current;
        break;
      default:
        return;
    }

    this.currentOperand = this.formatCalculatedResult(computation);
    this.operation = undefined;
    this.previousOperand = '';
    this.shouldResetScreen = true;
  }

  formatCalculatedResult(number) {
    if (!isFinite(number)) return 'Xatolik';
    // Fix floating point issues like 0.1 + 0.2 = 0.30000000000000004
    const rounded = Math.round((number + Number.EPSILON) * 1e12) / 1e12;
    return rounded.toString();
  }

  isErrorState() {
    return this.currentOperand === 'Xatolik' || this.currentOperand === "0 ga bo'lib bo'lmaydi";
  }

  getDisplayNumber(numberStr) {
    if (numberStr === "0 ga bo'lib bo'lmaydi" || numberStr === 'Xatolik') {
      return numberStr;
    }
    const parts = numberStr.toString().split('.');
    const integerDigits = parseFloat(parts[0]);
    const decimalDigits = parts[1];
    let integerDisplay;

    if (isNaN(integerDigits)) {
      integerDisplay = parts[0] === '-' ? '-' : '';
    } else {
      integerDisplay = integerDigits.toLocaleString('uz-UZ', { maximumFractionDigits: 0 });
    }

    if (decimalDigits != null) {
      return `${integerDisplay}.${decimalDigits}`;
    } else {
      return integerDisplay || '0';
    }
  }

  updateDisplay() {
    this.currentOperandElement.innerText = this.getDisplayNumber(this.currentOperand);
    if (this.operation != null && this.previousOperand !== '') {
      this.previousOperandElement.innerText = `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
    } else {
      this.previousOperandElement.innerText = '';
    }

    // Dynamic font sizing for long numbers
    const len = this.currentOperandElement.innerText.length;
    if (len > 14) {
      this.currentOperandElement.style.fontSize = '1.4rem';
    } else if (len > 10) {
      this.currentOperandElement.style.fontSize = '1.75rem';
    } else {
      this.currentOperandElement.style.fontSize = '2.25rem';
    }
  }
}

// Initialization and Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  const previousOperandElement = document.getElementById('previous-operand');
  const currentOperandElement = document.getElementById('current-operand');
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = themeToggle.querySelector('.theme-icon');

  const calculator = new Calculator(previousOperandElement, currentOperandElement);

  // Theme Management
  const savedTheme = localStorage.getItem('calc-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeIcon.textContent = savedTheme === 'light' ? '☀️' : '🌙';

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('calc-theme', newTheme);
    themeIcon.textContent = newTheme === 'light' ? '☀️' : '🌙';
  });

  // Button clicks
  const buttons = document.querySelectorAll('.buttons-grid .btn');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      handleButtonAction(button);
      triggerButtonAnimation(button);
    });
  });

  function handleButtonAction(button) {
    if (button.dataset.number !== undefined) {
      calculator.appendNumber(button.dataset.number);
      calculator.updateDisplay();
    } else if (button.dataset.operator !== undefined) {
      calculator.chooseOperation(button.dataset.operator);
      calculator.updateDisplay();
    } else if (button.dataset.action !== undefined) {
      const action = button.dataset.action;
      switch (action) {
        case 'clear':
          calculator.clear();
          calculator.updateDisplay();
          break;
        case 'delete':
          calculator.delete();
          calculator.updateDisplay();
          break;
        case 'percent':
          calculator.applyPercent();
          calculator.updateDisplay();
          break;
        case 'negate':
          calculator.toggleSign();
          calculator.updateDisplay();
          break;
        case 'decimal':
          calculator.appendDecimal();
          calculator.updateDisplay();
          break;
        case 'equals':
          calculator.compute();
          calculator.updateDisplay();
          break;
      }
    }
  }

  function triggerButtonAnimation(button) {
    button.classList.add('pressed');
    setTimeout(() => {
      button.classList.remove('pressed');
    }, 120);
  }

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    let handled = false;
    let targetButton = null;

    if ((e.key >= '0' && e.key <= '9')) {
      calculator.appendNumber(e.key);
      targetButton = document.querySelector(`[data-number="${e.key}"]`);
      handled = true;
    } else if (e.key === '.' || e.key === ',') {
      calculator.appendDecimal();
      targetButton = document.querySelector('[data-action="decimal"]');
      handled = true;
    } else if (e.key === '+') {
      calculator.chooseOperation('+');
      targetButton = document.querySelector('[data-operator="+"]');
      handled = true;
    } else if (e.key === '-') {
      calculator.chooseOperation('−');
      targetButton = document.querySelector('[data-operator="−"]');
      handled = true;
    } else if (e.key === '*') {
      calculator.chooseOperation('×');
      targetButton = document.querySelector('[data-operator="×"]');
      handled = true;
    } else if (e.key === '/') {
      e.preventDefault(); // Prevent Firefox quick search
      calculator.chooseOperation('÷');
      targetButton = document.querySelector('[data-operator="÷"]');
      handled = true;
    } else if (e.key === 'Enter' || e.key === '=') {
      e.preventDefault();
      calculator.compute();
      targetButton = document.querySelector('[data-action="equals"]');
      handled = true;
    } else if (e.key === 'Backspace') {
      calculator.delete();
      targetButton = document.querySelector('[data-action="delete"]');
      handled = true;
    } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
      calculator.clear();
      targetButton = document.querySelector('[data-action="clear"]');
      handled = true;
    } else if (e.key === '%') {
      calculator.applyPercent();
      targetButton = document.querySelector('[data-action="percent"]');
      handled = true;
    }

    if (handled) {
      calculator.updateDisplay();
      if (targetButton) {
        triggerButtonAnimation(targetButton);
      }
    }
  });

  calculator.updateDisplay();
});
