const board = document.getElementById('board');
const statusText = document.getElementById('status');
const blackCountEl = document.getElementById('black-count');
const whiteCountEl = document.getElementById('white-count');
const resetBtn = document.getElementById('reset');

let mode = 'human';
let isAIMode = false;
let aiLevel = 1;


const SIZE = 8;
let currentPlayer = 'black';
let cells = [];

function startGame(selectedMode) {
  mode = selectedMode;
  isAIMode = (mode === 'ai');

  document.getElementById('mode-select').style.display = 'none';

  if (isAIMode) {
    document.getElementById('ai-level-select').style.display = 'block';
  } else {
    document.getElementById('game-container').style.display = 'flex';
    createBoard();
  }
}

// 난이도 선택
function startGameWithLevel(level) {
  aiLevel = level;
  document.getElementById('ai-level-select').style.display = 'none';
  document.getElementById('game-container').style.display = 'flex';
  createBoard();
}


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

  currentPlayer = 'black';
  statusText.textContent = `⚫ 흑돌 차례`;
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
  statusText.textContent = `${currentPlayer === 'black' ? '⚫ 흑돌' : '⚪ 백돌'} 차례`;

  updateScore();
  updateHints();

  if (isAIMode && currentPlayer === 'white') {
    setTimeout(makeAIMove, 500);  // AI가 0.5초 뒤 자동 진행
  }
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

function updateHints() {
  for (let row of cells) {
    for (let cell of row) {
      cell.classList.remove('hint');
    }
  }

  const hasMoves = highlightValidMoves(currentPlayer);
  const opponent = currentPlayer === 'black' ? 'white' : 'black';
  const opponentHasMoves = hasValidMove(opponent);

  if (!hasMoves && !opponentHasMoves) {
    finishGame();
  } else if (!hasMoves && opponentHasMoves) {
    statusText.textContent = `${currentPlayer === 'black' ? '⚫ 흑돌' : '⚪ 백돌'}는 둘 곳이 없습니다. 턴을 넘깁니다.`;
    currentPlayer = opponent;
    setTimeout(() => {
      statusText.textContent = `${currentPlayer === 'black' ? '⚫ 흑돌' : '⚪ 백돌'} 차례`;
      updateHints();
    }, 1000);
  }
}

function highlightValidMoves(player) {
  let found = false;
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const cell = cells[y][x];
      if (!cell.classList.contains('black') && !cell.classList.contains('white')) {
        const flips = getFlippedStones(x, y, player);
        if (flips.length > 0) {
          if (player === currentPlayer) {
            cell.classList.add('hint');
          }
          found = true;
        }
      }
    }
  }
  return found;
}

function hasValidMove(player) {
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const cell = cells[y][x];
      if (!cell.classList.contains('black') && !cell.classList.contains('white')) {
        const flips = getFlippedStones(x, y, player);
        if (flips.length > 0) return true;
      }
    }
  }
  return false;
}

function finishGame() {
  updateScore();
  let black = parseInt(blackCountEl.textContent);
  let white = parseInt(whiteCountEl.textContent);

  let result = '';
  if (black > white) {
    result = '⚫ 흑돌 승리!';
  } else if (white > black) {
    result = '⚪ 백돌 승리!';
  } else {
    result = '무승부!';
  }

  statusText.innerHTML = `<span style="font-size: 1.5em; animation: flash 1s infinite alternate;">🎉 게임 종료! ${result}</span>`;
  
  // 클릭 비활성화
  for (let row of cells) {
    for (let cell of row) {
      const newCell = cell.cloneNode(true);
      cell.replaceWith(newCell);
    }
  }

  // 리셋 버튼 강조
  resetBtn.style.display = 'inline-block';
  resetBtn.style.animation = 'pulse 1s infinite alternate';
}

function makeAIMove() {
  const moves = [];

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const cell = cells[y][x];
      if (!cell.classList.contains('black') && !cell.classList.contains('white')) {
        const flips = getFlippedStones(x, y, 'white');
        if (flips.length > 0) {
          moves.push({ x, y, flips });
        }
      }
    }
  }

  if (moves.length === 0) {
    const hasHumanMoves = hasValidMove('black');
    if (!hasHumanMoves) {
      finishGame();
    } else {
      currentPlayer = 'black';
      statusText.textContent = `⚫ 흑돌 차례`;
      updateHints();
    }
    return;
  }

  let selectedMove;
  switch (aiLevel) {
    case 1:
      selectedMove = moves[Math.floor(Math.random() * moves.length)];
      break;
    case 2:
      moves.sort((a, b) => b.flips.length - a.flips.length);
      selectedMove = moves[0];
      break;
    case 3:
      moves.sort((a, b) => {
        const centerScore = (m) => -Math.abs(3.5 - m.x) - Math.abs(3.5 - m.y);
        return centerScore(b) - centerScore(a);
      });
      selectedMove = moves[0];
      break;
    case 4:
      selectedMove = moves.find(m => isEdge(m.x, m.y)) || moves[0];
      break;
    case 5:
      selectedMove =
        moves.find(m => isCorner(m.x, m.y)) ||
        moves.find(m => isEdge(m.x, m.y)) ||
        moves.find(m => isCenter(m.x, m.y)) ||
        moves[0];
      break;
  }

  // 실행
  const cell = cells[selectedMove.y][selectedMove.x];
  cell.classList.add('white');
  for (const [fx, fy] of selectedMove.flips) {
    cells[fy][fx].classList.remove('black', 'white');
    cells[fy][fx].classList.add('white');
  }

  currentPlayer = 'black';
  statusText.textContent = `⚫ 흑돌 차례`;
  updateScore();
  updateHints();
}

// 위치 판단 보조 함수
function isCorner(x, y) {
  return (x === 0 || x === 7) && (y === 0 || y === 7);
}
function isEdge(x, y) {
  return (x === 0 || x === 7 || y === 0 || y === 7) && !isCorner(x, y);
}
function isCenter(x, y) {
  return x >= 2 && x <= 5 && y >= 2 && y <= 5;
}


// 리셋 버튼 클릭 시
resetBtn.addEventListener('click', () => {
  document.getElementById('game-container').style.display = 'none';
  document.getElementById('mode-select').style.display = 'block';
});

createBoard();
