const board = document.getElementById('board');
const statusText = document.getElementById('status');
const blackCountEl = document.getElementById('black-count');
const whiteCountEl = document.getElementById('white-count');
const resetBtn = document.getElementById('reset');

const SIZE = 8;
let currentPlayer = 'black';
let cells = [];

function createBoard() {
  board.innerHTML = '';
  cells = [];
  for (let y = 0; y < SIZE; y++) {
    cells[y] = [];
    for (let x = 0; x < SIZE; x++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.x = x;
      cell.dataset.y = y;
      cell.addEventListener('click', () => handleClick(x, y));
      board.appendChild(cell);
      cells[y][x] = cell;
    }
  }

  // 초기 돌 배치
  cells[3][3].classList.add('white');
  cells[4][4].classList.add('white');
  cells[3][4].classList.add('black');
  cells[4][3].classList.add('black');

  updateHints();
  updateScore();
}

function handleClick(x, y) {
  const cell = cells[y][x];
  if (cell.classList.contains('black') || cell.classList.contains('white')) return;

  const flipped = getFlippedStones(x, y, currentPlayer);
  if (flipped.length === 0) return;

  cell.classList.add(currentPlayer);
  for (const [fx, fy] of flipped) {
    cells[fy][fx].classList.remove('black', 'white');
    cells[fy][fx].classList.add(currentPlayer);
  }

  currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
  statusText.textContent = `${currentPlayer === 'black' ? '흑돌' : '백돌'} 차례`;

  updateScore();
  updateHints();
}

function getFlippedStones(x, y, player) {
  const opponent = player === 'black' ? 'white' : 'black';
  const directions = [
    [1,0], [0,1], [-1,0], [0,-1],
    [1,1], [1,-1], [-1,1], [-1,-1]
  ];
  let flipped = [];

  for (const [dx, dy] of directions) {
    let path = [];
    let cx = x + dx;
    let cy = y + dy;

    while (cx >= 0 && cx < SIZE && cy >= 0 && cy < SIZE) {
      const cell = cells[cy][cx];
      if (cell.classList.contains(opponent)) {
        path.push([cx, cy]);
      } else if (cell.classList.contains(player)) {
        flipped = flipped.concat(path);
        break;
      } else {
        break;
      }
      cx += dx;
      cy += dy;
    }
  }

  return flipped;
}

function updateHints() {
  // 힌트 초기화
  for (let row of cells) {
    for (let cell of row) {
      cell.classList.remove('hint');
    }
  }

  // 새 힌트 표시
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const cell = cells[y][x];
      if (!cell.classList.contains('black') && !cell.classList.contains('white')) {
        const flips = getFlippedStones(x, y, currentPlayer);
        if (flips.length > 0) {
          cell.classList.add('hint');
        }
      }
    }
  }
}

function updateScore() {
  let black = 0, white = 0;
  for (let row of cells) {
    for (let cell of row) {
      if (cell.classList.contains('black')) black++;
      if (cell.classList.contains('white')) white++;
    }
  }
  blackCountEl.textContent = black;
  whiteCountEl.textContent = white;
}

resetBtn.addEventListener('click', () => {
  currentPlayer = 'black';
  statusText.textContent = `흑돌 차례`;
  createBoard();
});

createBoard();
