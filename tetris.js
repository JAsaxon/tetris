const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 500; // Increase the width to fit the next and hold Tetriminos
canvas.height = 640;
const blockSize = 32;
const theme = {
  backgroundColor: '#212121',
  titleColor: '#FFFFFF',
  textColor: '#E0E0E0',
  primaryColor: '#607D8B',
  accentColor: '#FF9800',
  tetriminoColors: {
    I: '#00BCD4',
    O: '#FFEB3B',
    T: '#9C27B0',
    J: '#2196F3',
    L: '#FF9800',
    S: '#4CAF50',
    Z: '#F44336',
  },
  font: 'Inter',
};

const tetriminos = {
  I: {
    shape: [[[1, 1, 1, 1]], [[1], [1], [1], [1]]],
    color: theme.tetriminoColors.I,
  },
  O: {
    shape: [
      [
        [1, 1],
        [1, 1],
      ],
    ],
    color: theme.tetriminoColors.O,
  },
  T: {
    shape: [
      [
        [0, 1, 0],
        [1, 1, 1],
      ],
      [
        [1, 0],
        [1, 1],
        [1, 0],
      ],
      [
        [1, 1, 1],
        [0, 1, 0],
      ],
      [
        [0, 1],
        [1, 1],
        [0, 1],
      ],
    ],
    color: theme.tetriminoColors.T,
  },
  J: {
    shape: [
      [
        [1, 0, 0],
        [1, 1, 1],
      ],
      [
        [1, 1],
        [1, 0],
        [1, 0],
      ],
      [
        [1, 1, 1],
        [0, 0, 1],
      ],
      [
        [0, 1],
        [0, 1],
        [1, 1],
      ],
    ],
    color: theme.tetriminoColors.J,
  },
  L: {
    shape: [
      [
        [0, 0, 1],
        [1, 1, 1],
      ],
      [
        [1, 0],
        [1, 0],
        [1, 1],
      ],
      [
        [1, 1, 1],
        [1, 0, 0],
      ],
      [
        [1, 1],
        [0, 1],
        [0, 1],
      ],
    ],
    color: theme.tetriminoColors.L,
  },
  S: {
    shape: [
      [
        [0, 1, 1],
        [1, 1, 0],
      ],
      [
        [1, 0],
        [1, 1],
        [0, 1],
      ],
    ],
    color: theme.tetriminoColors.S,
  },
  Z: {
    shape: [
      [
        [1, 1, 0],
        [0, 1, 1],
      ],
      [
        [0, 1],
        [1, 1],
        [1, 0],
      ],
    ],
    color: theme.tetriminoColors.Z,
  },
};
// Game variables
let board = createEmptyBoard(10, 20);
let position = { x: Math.floor(board[0].length / 2) - 1, y: 0 };
let dropCounter = 0;
let dropInterval = 1000; // In milliseconds
let lastTime = 0;

// Create an empty game board
function createEmptyBoard(width, height) {
  return new Array(height).fill(null).map(() => new Array(width).fill(0));
}

const tetriminoQueue = [];
const queueSize = 3;

function fillTetriminoQueue() {
  while (tetriminoQueue.length < queueSize) {
    const randomType = "IOTJLSZ"[Math.floor(Math.random() * 7)];
    tetriminoQueue.push(createTetrimino(randomType));
  }
}

function getNextTetrimino() {
  fillTetriminoQueue();
  return tetriminoQueue.shift();
}

function createRandomTetrimino() {
  return getNextTetrimino();
}

// Fill the queue initially
fillTetriminoQueue();

// Update the currentTetrimino
let currentTetrimino = createRandomTetrimino();
let holdTetrimino = null;

function hold() {
  if (!holdTetrimino) {
    holdTetrimino = currentTetrimino;
    currentTetrimino = createRandomTetrimino();
  } else {
    const temp = currentTetrimino;
    currentTetrimino = holdTetrimino;
    holdTetrimino = temp;
  }
  position.y = 0;
  position.x = Math.floor(board[0].length / 2) - 1;
}

// Merge a Tetrimino with the game board
function merge(board, tetrimino, position) {
  for (let row = 0; row < tetrimino.shape[tetrimino.rotation].length; row++) {
    for (
      let col = 0;
      col < tetrimino.shape[tetrimino.rotation][row].length;
      col++
    ) {
      if (tetrimino.shape[tetrimino.rotation][row][col]) {
        board[row + position.y][col + position.x] = tetrimino.color;
      }
    }
  }
}

// Check for collisions
function collide(board, tetrimino, position) {
  for (let row = 0; row < tetrimino.shape[tetrimino.rotation].length; row++) {
    for (
      let col = 0;
      col < tetrimino.shape[tetrimino.rotation][row].length;
      col++
    ) {
      if (
        tetrimino.shape[tetrimino.rotation][row][col] &&
        (board[row + position.y] &&
          board[row + position.y][col + position.x]) !== 0
      ) {
        return true;
      }
    }
  }
  return false;
}

// Move the Tetrimino left or right
function move(dir) {
  position.x += dir;
  if (collide(board, currentTetrimino, position)) {
    position.x -= dir;
  }
}

// Rotate the Tetrimino
function rotate() {
  const prevRotation = currentTetrimino.rotation;
  currentTetrimino.rotation =
    (currentTetrimino.rotation + 1) % currentTetrimino.shape.length;
  if (collide(board, currentTetrimino, position)) {
    currentTetrimino.rotation = prevRotation;
  }
}

function drop() {
  position.y++;
  if (collide(board, currentTetrimino, position)) {
    position.y--;
    merge(board, currentTetrimino, position);
    currentTetrimino = createRandomTetrimino();
    position.y = 0;
    position.x = Math.floor(board[0].length / 2) - 1;
    clearLines();
    clearLines();
    clearLines();
    clearLines();

    if (isGameOver()) {
      // Handle game over
      alert('Game Over!');
      board = createEmptyBoard(10, 20);
      score = 0;
    }
  }
  dropCounter = 0;
}


function createTetrimino(type) {
  const tetrimino = tetriminos[type];
  return {
    shape: tetrimino.shape,
    color: tetrimino.color,
    rotation: 0,
  };
}
function clearLines() {
  outer: for (let row = board.length - 1; row >= 0; row--) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] === 0) {
        continue outer;
      }
    }
    board.splice(row, 1);
    board.unshift(new Array(board[0].length).fill(0));
  }
}
// Add a gameOver variable to track the game state
let gameOver = false;

function checkGameOver() {
  // Check for a collision at the starting position
  if (collide(board, currentTetrimino, position)) {
    // If there is a collision, the game is over
    return true;
  }
  return false;
}

// Draw the game over message
function drawGameOver() {
  ctx.font = "24px Inter";
  ctx.fillStyle = "red";
  console.log(gameOver)
  ctx.fillText("GAME OVER", (canvas.width / 2) - 60, canvas.height / 2);
}

function isGameOver() {
  return collide(board, currentTetrimino, position);
}


function darkenColor(color, amount) {
  const amountAdjusted = amount || 20;
  const colorInt = parseInt(color.slice(1), 16);
  const r = Math.max((colorInt >> 16) - amountAdjusted, 0);
  const g = Math.max(((colorInt >> 8) & 0x00FF) - amountAdjusted, 0);
  const b = Math.max((colorInt & 0x0000FF) - amountAdjusted, 0);
  const darkerColorInt = (r << 16) | (g << 8) | b;
  const darkerColorHex = `#${darkerColorInt.toString(16).padStart(6, '0')}`;
  return darkerColorHex;
}

function drawBlock(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
  ctx.strokeStyle = darkenColor(color,75);
  ctx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
}

// Handle user input
document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    move(-1);
  } else if (event.key === "ArrowRight") {
    move(1);
  } else if (event.key === "ArrowDown") {
    drop();
  } else if (event.key === "ArrowUp") {
    rotate();
  } else if (event.key === " ") {
    hardDrop();
  }
  if (event.key === "Shift") {
    hold();
  }
});
function hardDrop() {
  let dropDistance = 0;
  while (!collide(board, currentTetrimino, position)) {
    position.y++;
    dropDistance++;
  }
  position.y--;
  dropDistance--;
  score += dropDistance;
  drop();
}
let score = 0;

function clearLines() {
  outer: for (let row = board.length - 1; row >= 0; row--) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] === 0) {
        continue outer;
      }
    }
    board.splice(row, 1);
    board.unshift(new Array(board[0].length).fill(0));
    score += 100; // Increase the score for each cleared line
  }
}
function drawScore() {
  ctx.font = "20px Inter";
  ctx.fillStyle = "white";
  ctx.fillText(`Score: ${score}`, 8, 30);
}

function drawNextTetriminos() {
  ctx.font = "16px Inter";
  ctx.fillStyle = "white";
  ctx.fillText("Next:", 350, 30);

  tetriminoQueue.forEach((tetrimino, index) => {
    const shape = tetrimino.shape[0];
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          drawBlock(11 + col, 1 + row + 4 * index, tetrimino.color);
        }
      }
    }
  });
}

function drawHoldTetrimino() {
  ctx.font = "16px Inter";
  ctx.fillStyle = "white";
  ctx.fillText("Hold:", 350, 300);

  if (holdTetrimino) {
    const shape = holdTetrimino.shape[0];
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          drawBlock(11 + col, 10 + row, holdTetrimino.color);
        }
      }
    }
  }
}

// Draw the game board and current Tetrimino
function draw() {
  // Draw the game board

  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      drawBlock(col, row, board[row][col] || "#222");
    }
  }

  // Draw the current Tetrimino
  const shape = currentTetrimino.shape[currentTetrimino.rotation];
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        drawBlock(col + position.x, row + position.y, currentTetrimino.color);
      }
    }
  }
  drawScore();
  drawNextTetriminos();
  drawHoldTetrimino();
}

// Update the game
function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;

  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    drop();
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  draw();
  requestAnimationFrame(update);
}

update();
