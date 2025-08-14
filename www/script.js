document.addEventListener('DOMContentLoaded', () => {
    const mainDisplay = document.getElementById('main-display');
    const historyPanel = document.getElementById('history-panel');
    const historyContent = document.getElementById('history-content');
    const memoryIndicator = document.getElementById('memory-indicator');
    
    let expression = '0';
    let memory = 0;
    let calculationHistory = [];

    function updateDisplay() {
        mainDisplay.textContent = expression.replace(/\*/g, '×').replace(/\//g, '÷');
        memoryIndicator.classList.toggle('active', memory !== 0);
    }

    function calculate() {
        if (expression === 'Error') return;
        try {
            let evalExpression = expression.replace(/×/g, '*').replace(/÷/g, '/').replace(/√\(/g, 'Math.sqrt(');
            
             evalExpression = evalExpression.replace(/(\d+)%/g, "($1/100)");
             evalExpression = evalExpression.replace(/%/g, '/100');
             evalExpression = evalExpression.replace(/(\d)\(/g, '$1*(').replace(/\)(\d)/g, ')*$1').replace(/\)\(/g,')*(');

            const result = eval(evalExpression);
            if (isNaN(result) || !isFinite(result)) {
                throw new Error("Invalid calculation");
            }
            const formattedResult = Number(result.toPrecision(12)).toString();
            addToHistory(`${expression}`, formattedResult);
            expression = formattedResult;
        } catch (error) {
            console.error(error);
            expression = 'Error';
        }
        updateDisplay();
    }

    function handleInput(value) {
        if (expression === 'Error' && value !== 'clear') return;

        switch(value) {
            case 'clear':
                expression = '0';
                memory = 0;
                calculationHistory = [];
                renderHistory();
                break;
            case 'backspace':
                expression = expression.length > 1 ? expression.slice(0, -1) : '0';
                break;
            case '=':
                calculate();
                break;
            case 'sqrt':
                expression = expression === '0' ? '√(' : expression + '√(';
                break;
            case '.':
                const lastNum = expression.split(/[\+\-\*\/()]/).pop();
                if (lastNum && !lastNum.includes('.')) {
                    expression += '.';
                }
                break;
            case 'm-plus':
                try { if(expression !== 'Error') memory += eval(expression.replace(/×/g, '*').replace(/÷/g, '/')); } catch {}
                break;
            case 'm-minus':
                try { if(expression !== 'Error') memory -= eval(expression.replace(/×/g, '*').replace(/÷/g, '/')); } catch {}
                break;
            case 'm-recall':
                expression = expression === '0' ? memory.toString() : expression + memory.toString();
                break;
            default: // Numbers, operators, parens
                if (expression === '0' && !'()+-×÷.%'.includes(value)) {
                    expression = value;
                } else {
                    expression += value;
                }
                break;
        }
        updateDisplay();
    }

    document.querySelector('.keypad-container').addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (button) handleInput(button.dataset.value);
    });
    
    document.getElementById('theme-switcher').addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-theme');
        document.body.classList.toggle('light-theme', !isDark);
    });

    document.getElementById('history-toggle').addEventListener('click', (e) => {
        e.stopPropagation();
        historyPanel.classList.toggle('visible');
    });
    
    document.addEventListener('click', (e) => {
        if (!historyPanel.contains(e.target) && !e.target.closest('#history-toggle')) {
            historyPanel.classList.remove('visible');
        }
    });

    function addToHistory(exp, res) {
        calculationHistory.unshift({ expression: exp.replace(/\*/g, '×').replace(/\//g, '÷'), result: res });
        if (calculationHistory.length > 50) calculationHistory.pop();
        renderHistory();
    }

    function renderHistory() {
        historyContent.innerHTML = calculationHistory.length === 0 
            ? 'Your calculations will appear here.'
            : calculationHistory.map(item => `<div class="history-item"><span>${item.expression} =</span><span>${item.result}</span></div>`).join('');
    }

    updateDisplay();
    renderHistory();
});