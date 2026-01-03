let currentInput = '0';
let expression = '';
let shouldResetDisplay = false;
let lastOperator = null;

const resultDisplay = document.getElementById('result');
const expressionDisplay = document.getElementById('expression');

function updateDisplay() {
    resultDisplay.textContent = formatNumber(currentInput);
    expressionDisplay.textContent = expression;
}

function formatNumber(num) {
    if (num === '') return '0';
    const number = parseFloat(num);
    if (isNaN(number)) return '0';
    
    // Format large numbers with scientific notation if needed
    if (Math.abs(number) > 999999999) {
        return number.toExponential(6);
    }
    
    // Format with appropriate decimal places
    const str = number.toString();
    if (str.includes('.')) {
        const parts = str.split('.');
        if (parts[1].length > 8) {
            return number.toFixed(8).replace(/\.?0+$/, '');
        }
    }
    
    return str;
}

function appendNumber(num) {
    if (shouldResetDisplay) {
        currentInput = '0';
        shouldResetDisplay = false;
    }
    
    if (currentInput === '0' && num !== '.') {
        currentInput = num;
    } else {
        currentInput += num;
    }
    
    updateDisplay();
}

function appendDecimal() {
    if (shouldResetDisplay) {
        currentInput = '0';
        shouldResetDisplay = false;
    }
    
    if (!currentInput.includes('.')) {
        currentInput += '.';
    }
    
    updateDisplay();
}

function appendOperator(operator) {
    if (shouldResetDisplay) {
        shouldResetDisplay = false;
    } else if (lastOperator && !shouldResetDisplay) {
        calculate();
    }
    
    const displayValue = currentInput;
    expression = displayValue + ' ' + operator;
    lastOperator = operator;
    currentInput = displayValue;
    shouldResetDisplay = true;
    
    updateDisplay();
}

function calculate() {
    if (!lastOperator || shouldResetDisplay) {
        return;
    }
    
    const prevValue = parseFloat(expression.split(' ')[0]);
    const currentValue = parseFloat(currentInput);
    
    if (isNaN(prevValue) || isNaN(currentValue)) {
        return;
    }
    
    let result;
    switch (lastOperator) {
        case '+':
            result = prevValue + currentValue;
            break;
        case '−':
            result = prevValue - currentValue;
            break;
        case '×':
            result = prevValue * currentValue;
            break;
        case '÷':
            if (currentValue === 0) {
                resultDisplay.textContent = 'Error';
                expressionDisplay.textContent = '';
                currentInput = '0';
                expression = '';
                lastOperator = null;
                shouldResetDisplay = false;
                return;
            }
            result = prevValue / currentValue;
            break;
        default:
            return;
    }
    
    // Round to avoid floating point precision issues
    result = Math.round(result * 100000000) / 100000000;
    
    expression = '';
    currentInput = result.toString();
    lastOperator = null;
    shouldResetDisplay = true;
    
    updateDisplay();
}

function clearAll() {
    currentInput = '0';
    expression = '';
    lastOperator = null;
    shouldResetDisplay = false;
    updateDisplay();
}

function clearEntry() {
    currentInput = '0';
    updateDisplay();
}

function toggleSign() {
    if (currentInput === '0' || currentInput === '') return;
    
    if (currentInput.startsWith('-')) {
        currentInput = currentInput.substring(1);
    } else {
        currentInput = '-' + currentInput;
    }
    
    updateDisplay();
}

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') {
        appendNumber(e.key);
    } else if (e.key === '.') {
        appendDecimal();
    } else if (e.key === '+') {
        appendOperator('+');
    } else if (e.key === '-') {
        appendOperator('−');
    } else if (e.key === '*') {
        appendOperator('×');
    } else if (e.key === '/') {
        e.preventDefault();
        appendOperator('÷');
    } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calculate();
    } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        clearAll();
    } else if (e.key === 'Backspace') {
        if (currentInput.length > 1) {
            currentInput = currentInput.slice(0, -1);
        } else {
            currentInput = '0';
        }
        updateDisplay();
    }
});

// Initialize display
updateDisplay();

