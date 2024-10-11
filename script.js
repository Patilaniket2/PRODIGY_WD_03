// script.js

// Select DOM elements
const cells = document.querySelectorAll('.cell');
const gameStatus = document.getElementById('game-status');
const resetButton = document.getElementById('reset-button');
const modeButton = document.getElementById('mode-button');

// Sound Effects (Optional)
const clickSound = document.getElementById('click-sound');
const winSound = document.getElementById('win-sound');
const drawSound = document.getElementById('draw-sound');

// Game variables
let currentPlayer = 'X';
let gameActive = true;
let gameState = ["", "", "", "", "", "", "", "", ""];
let vsAI = false;

// Winning combinations
const winningConditions = [
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,3,6],
    [1,4,7],
    [2,5,8],
    [0,4,8],
    [2,4,6]
];

// Messages
const winningMessage = (player) => `Player ${player} has won!`;
const drawMessage = () => `It's a draw!`;
const currentPlayerTurn = (player) => `Player ${player}'s Turn`;

// Initialize game
gameStatus.innerHTML = currentPlayerTurn(currentPlayer);

// Handle cell click
function handleCellClick(clickedCellEvent) {
    const clickedCell = clickedCellEvent.target;
    const clickedIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (gameState[clickedIndex] !== "" || !gameActive) {
        return;
    }

    playSound(clickSound);
    handleCellPlayed(clickedCell, clickedIndex);
    handleResultValidation();

    if (vsAI && gameActive && currentPlayer === 'O') {
        setTimeout(aiMove, 500);
    }
}

// Handle cell played
function handleCellPlayed(clickedCell, clickedIndex) {
    gameState[clickedIndex] = currentPlayer;
    clickedCell.classList.add(currentPlayer);
    // Trigger marker animation by adding class (handled in CSS)
}

// Switch player
function handlePlayerChange() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    gameStatus.innerHTML = currentPlayerTurn(currentPlayer);
    gameStatus.style.color = currentPlayer === 'X' ? '#ff6347' : '#4da6ff';
}

// Handle result validation with highlighting
function handleResultValidation() {
    let roundWon = false;
    let winningCombination = [];

    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        let a = gameState[winCondition[0]];
        let b = gameState[winCondition[1]];
        let c = gameState[winCondition[2]];

        if (a === '' || b === '' || c === '') {
            continue;
        }

        if (a === b && b === c) {
            roundWon = true;
            winningCombination = winCondition;
            break;
        }
    }

    if (roundWon) {
        gameStatus.innerHTML = winningMessage(currentPlayer);
        gameStatus.style.color = '#90ee90';
        gameActive = false;
        highlightWinningCells(winningCombination);
        playSound(winSound);
        return;
    }

    let roundDraw = !gameState.includes("");
    if (roundDraw) {
        gameStatus.innerHTML = drawMessage();
        gameStatus.style.color = '#ffd700';
        gameActive = false;
        playSound(drawSound);
        return;
    }

    handlePlayerChange();
}

// Highlight winning cells
function highlightWinningCells(winCondition) {
    winCondition.forEach(index => {
        cells[index].classList.add('win-cell');
    });
}

// Reset game
function handleRestartGame() {
    currentPlayer = 'X';
    gameActive = true;
    gameState = ["", "", "", "", "", "", "", "", ""];
    gameStatus.innerHTML = currentPlayerTurn(currentPlayer);
    gameStatus.style.color = '#555';
    cells.forEach(cell => {
        cell.innerHTML = "";
        cell.classList.remove('X', 'O', 'win-cell');
    });
    // Remove any lingering animations
}

// Toggle game mode
function toggleGameMode() {
    vsAI = !vsAI;
    modeButton.innerHTML = vsAI ? "Play vs Player" : "Play vs AI";
    handleRestartGame();
}

// AI Move (Minimax Algorithm)
function aiMove() {
    if (!gameActive) return;

    const bestMove = findBestMove();
    if (bestMove === -1) return;

    const aiCell = document.querySelector(`.cell[data-index='${bestMove}']`);
    playSound(clickSound);
    handleCellPlayed(aiCell, bestMove);
    handleResultValidation();
}

// Find the best move for AI
function findBestMove() {
    let bestVal = -1000;
    let bestMove = -1;

    for (let i = 0; i < gameState.length; i++) {
        if (gameState[i] === "") {
            gameState[i] = 'O';
            let moveVal = minimax(gameState, 0, false);
            gameState[i] = "";
            if (moveVal > bestVal) {
                bestMove = i;
                bestVal = moveVal;
            }
        }
    }

    return bestMove;
}

// Minimax Algorithm
function minimax(state, depth, isMax) {
    const score = evaluate(state);

    // If AI has won the game, return evaluated score
    if (score === 10) return score - depth;

    // If Human has won the game, return evaluated score
    if (score === -10) return score + depth;

    // If no more moves and no winner, it's a tie
    if (!state.includes("")) return 0;

    if (isMax) {
        let best = -1000;

        for (let i = 0; i < state.length; i++) {
            if (state[i] === "") {
                state[i] = 'O';
                best = Math.max(best, minimax(state, depth + 1, !isMax));
                state[i] = "";
            }
        }
        return best;
    } else {
        let best = 1000;

        for (let i = 0; i < state.length; i++) {
            if (state[i] === "") {
                state[i] = 'X';
                best = Math.min(best, minimax(state, depth + 1, !isMax));
                state[i] = "";
            }
        }
        return best;
    }
}

// Evaluate the game state
function evaluate(state) {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (state[a] && state[a] === state[b] && state[b] === state[c]) {
            if (state[a] === 'O') return 10;
            else if (state[a] === 'X') return -10;
        }
    }
    return 0;
}

// Play sound
function playSound(sound) {
    if (sound) {
        sound.currentTime = 0;
        sound.play();
    }
}

// Add event listeners to cells
cells.forEach(cell => cell.addEventListener('click', handleCellClick));

// Add event listeners to buttons
resetButton.addEventListener('click', handleRestartGame);
modeButton.addEventListener('click', toggleGameMode);
