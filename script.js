document.addEventListener('DOMContentLoaded', () => {
    const kenoBoard = document.querySelector('.keno-board');
    const placeBetButton = document.getElementById('place-bet');
    const betAmountInput = document.getElementById('bet-amount');
    const autoSpinButton = document.getElementById('auto-spin');
    const stopSpinButton = document.getElementById('stop-spin');
    const spinCountInput = document.getElementById('spin-count');
    const halveBetButton = document.getElementById('halve-bet');
    const doubleBetButton = document.getElementById('double-bet');
    const classicRiskButton = document.getElementById('classic-risk');
    const highRiskButton = document.getElementById('high-risk');
    const resultDisplay = document.getElementById('result-display');
    const historyList = document.getElementById('history-list');
    let autoSpinInterval = null;

    initializeBoard();

    placeBetButton.addEventListener('click', placeBet);
    autoSpinButton.addEventListener('click', startAutoBet);
    stopSpinButton.addEventListener('click', stopAutoBet);
    halveBetButton.addEventListener('click', halveBet);
    doubleBetButton.addEventListener('click', doubleBet);
    classicRiskButton.addEventListener('click', setClassic);
    highRiskButton.addEventListener('click', setHigh);

    function getSelectedNumbers() {
        return Array.from(document.querySelectorAll('.keno-cell.picked')).map(cell => parseInt(cell.textContent));
    }

    function placeBet() {
        const betAmount = parseInt(betAmountInput.value);
        const playerSelection = getSelectedNumbers();
        if (playerSelection.length === 0 || isNaN(betAmount)) {
            alert('Please select numbers and enter a valid bet amount');
            return;
        }

        const winningNumbers = drawNumbers();
        const payout = calculatePayout(playerSelection, winningNumbers);
        animateDraw(winningNumbers, () => {
            showPopup(playerSelection, winningNumbers, payout);
        });
        showResult(playerSelection, winningNumbers, payout);
        saveHistory(playerSelection, winningNumbers, payout);
    }

    function startAutoBet() {
        const spinCount = parseInt(spinCountInput.value);
        if (isNaN(spinCount) || spinCount < 1) {
            alert('Please enter a valid spin count');
            return;
        }

        autoSpinInterval = setInterval(() => {
            placeBet();
        }, spinCount * 1000);
    }

    function stopAutoBet() {
        clearInterval(autoSpinInterval);
    }

    function halveBet() {
        const currentBet = parseInt(betAmountInput.value);
        betAmountInput.value = Math.max(1, Math.floor(currentBet / 2));
    }

    function doubleBet() {
        const currentBet = parseInt(betAmountInput.value);
        betAmountInput.value = currentBet * 2;
    }

    function initializeBoard() {
        for (let i = 1; i <= 40; i++) {
            const cell = document.createElement('div');
            cell.classList.add('keno-cell');
            cell.textContent = i;
            cell.addEventListener('click', () => {
                cell.classList.toggle('picked');
            });
            kenoBoard.appendChild(cell);
        }
    }

    function drawNumbers() {
        const numbers = [];
        while (numbers.length < 10) {
            const num = Math.floor(Math.random() * 40) + 1;
            if (!numbers.includes(num)) {
                numbers.push(num);
            }
        }
        return numbers;
    }

    function calculatePayout(playerSelection, winningNumbers) {
        const matches = playerSelection.filter(num => winningNumbers.includes(num)).length;
        const payouts = {
            4: [0, 0, 0, 10, 259],
            5: [0, 0, 0, 4.5, 48, 450],
            6: [0, 0, 0, 0, 11, 350, 710],
            7: [0, 0, 0, 0, 7, 90, 400, 600],
            8: [0, 0, 0, 0, 5, 20, 270, 600, 800],
            9: [0, 0, 0, 0, 4, 11, 56, 500, 800, 1000],
            10: [0, 0, 0, 0, 3.5, 8, 13, 63, 500, 800, 1000]
        };
        return payouts[playerSelection.length][matches] || 0;
    }

    function animateDraw(winningNumbers, callback) {
        const cells = document.querySelectorAll('.keno-cell');
        let index = 0;

        function highlightNext() {
            if (index < winningNumbers.length) {
                const cell = Array.from(cells).find(cell => parseInt(cell.textContent) === winningNumbers[index]);
                if (cell) {
                    cell.classList.add('drawn');
                }
                index++;
                setTimeout(highlightNext, 500); // Adjust timing for animation speed
            } else if (callback) {
                callback();
            }
        }

        highlightNext();
    }

    function showResult(playerSelection, winningNumbers, payout) {
        resultDisplay.textContent = `Matched Numbers: ${playerSelection.filter(num => winningNumbers.includes(num)).length} - Payout: ${payout}`;
        document.querySelectorAll('.keno-cell').forEach(cell => {
            const cellNumber = parseInt(cell.textContent);
            if (winningNumbers.includes(cellNumber)) {
                cell.classList.add('matched');
            } else {
                cell.classList.remove('matched');
            }
        });
    }

    function showPopup(playerSelection, winningNumbers, payout) {
        const popup = document.createElement('div');
        const overlay = document.createElement('div');
        overlay.classList.add('popup-overlay');
        popup.classList.add('popup');
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close';
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(popup);
            document.body.removeChild(overlay);
        });

        popup.innerHTML = `
            <h2>Result</h2>
            <p>Selection: ${playerSelection.join(', ')}</p>
            <p>Winning Numbers: ${winningNumbers.join(', ')}</p>
            <p>Matches: ${playerSelection.filter(num => winningNumbers.includes(num)).length}</p>
            <p>Payout: ${payout}</p>
        `;
        popup.appendChild(closeBtn);
        document.body.appendChild(overlay);
        document.body.appendChild(popup);
    }

    function saveHistory(playerSelection, winningNumbers, payout) {
        const historyItem = document.createElement('li');
        historyItem.textContent = `Selection: ${playerSelection} - Winning: ${winningNumbers} - Payout: ${payout}`;
        historyList.appendChild(historyItem);
    }

    function setClassic() {
        resultDisplay.textContent = 'Classic Risk';
    }

    function setHigh() {
        resultDisplay.textContent = 'High Risk';
    }
});
