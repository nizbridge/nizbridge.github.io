const WIDTH = 50;
const HEIGHT = 30;
const PLAYER = '@';
const WALL = '#';
const FLOOR = '.';
const STAIRS = '>';
const NUM_ROOMS = 10;
const ROOM_MIN_SIZE = 3;
const ROOM_MAX_SIZE = 8;
const MONSTER_VISION_RADIUS = 8; // 몬스터가 플레이어를 인식하는 범위

let player = {
    x: 1,
    y: 1,
    attack: 3,
    defense: 1,
    health: 10,
    maxHealth: 10,
    level: 1,
    experience: 0
};

let gameMap = [];
let monsters = [];
let floor = 1;
let stairsPosition = { x: 0, y: 0 }; // Stairs position
let canDescend = false; // Flag to determine if player is on stairs
let restCount = 0; // Rest counter

const MONSTER_TYPES = {
    'a': {
        name: 'slime',
        attack: 2,
        defense: 1,
        speed: 1,
        health: 5
    }
};

function createRoom(x, y, width, height) {
    for (let i = x; i < x + width; i++) {
        for (let j = y; j < y + height; j++) {
            gameMap[j][i] = FLOOR;
        }
    }
}

function createHTunnel(x1, x2, y) {
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
        gameMap[y][x] = FLOOR;
    }
}

function createVTunnel(y1, y2, x) {
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
        gameMap[y][x] = FLOOR;
    }
}

function generateMap() {
    gameMap = [];
    monsters = [];
    for (let y = 0; y < HEIGHT; y++) {
        let row = [];
        for (let x = 0; x < WIDTH; x++) {
            row.push(WALL);
        }
        gameMap.push(row);
    }

    let rooms = [];
    for (let r = 0; r < NUM_ROOMS; r++) {
        let roomWidth = Math.floor(Math.random() * (ROOM_MAX_SIZE - ROOM_MIN_SIZE + 1)) + ROOM_MIN_SIZE;
        let roomHeight = Math.floor(Math.random() * (ROOM_MAX_SIZE - ROOM_MIN_SIZE + 1)) + ROOM_MIN_SIZE;
        let x = Math.floor(Math.random() * (WIDTH - roomWidth - 1));
        let y = Math.floor(Math.random() * (HEIGHT - roomHeight - 1));

        let newRoom = { x: x, y: y, width: roomWidth, height: roomHeight };
        let failed = false;
        for (let otherRoom of rooms) {
            if (newRoom.x <= otherRoom.x + otherRoom.width && newRoom.x + newRoom.width >= otherRoom.x &&
                newRoom.y <= otherRoom.y + otherRoom.height && newRoom.y + newRoom.height >= otherRoom.y) {
                failed = true;
                break;
            }
        }

        if (!failed) {
            createRoom(newRoom.x, newRoom.y, newRoom.width, newRoom.height);
            if (rooms.length !== 0) {
                let prevRoom = rooms[rooms.length - 1];
                createHTunnel(prevRoom.x + Math.floor(prevRoom.width / 2), newRoom.x + Math.floor(newRoom.width / 2), prevRoom.y + Math.floor(prevRoom.height / 2));
                createVTunnel(prevRoom.y + Math.floor(prevRoom.height / 2), newRoom.y + Math.floor(newRoom.height / 2), newRoom.x + Math.floor(newRoom.width / 2));
            } else {
                player.x = newRoom.x + Math.floor(newRoom.width / 2);
                player.y = newRoom.y + Math.floor(newRoom.height / 2);
            }
            rooms.push(newRoom);
        }
    }

    placeStairs();
    generateMonsters();
    gameMap[player.y][player.x] = PLAYER;
    canDescend = false; // Reset flag
}

function placeStairs() {
    let room = gameMap.find(row => row.includes(FLOOR));
    if (room) {
        let x = Math.floor(Math.random() * WIDTH);
        let y = Math.floor(Math.random() * HEIGHT);
        while (gameMap[y][x] !== FLOOR) {
            x = Math.floor(Math.random() * WIDTH);
            y = Math.floor(Math.random() * HEIGHT);
        }
        gameMap[y][x] = STAIRS;
        stairsPosition = { x, y }; // Save the stairs position
    }
}

function generateMonsters() {
    let numMonsters = Math.floor(Math.random() * 4) + 3; // 3~6마리
    for (let i = 0; i < numMonsters; i++) {
        let x = Math.floor(Math.random() * WIDTH);
        let y = Math.floor(Math.random() * HEIGHT);
        while (gameMap[y][x] !== FLOOR) {
            x = Math.floor(Math.random() * WIDTH);
            y = Math.floor(Math.random() * HEIGHT);
        }
        let monsterType = 'a';
        monsters.push({ ...MONSTER_TYPES[monsterType], x: x, y: y });
        gameMap[y][x] = monsterType;
    }
}

function drawMap() {
    let gameDiv = document.getElementById('game');
    gameDiv.innerHTML = '';
    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
            if (gameMap[y][x] === 'a') {
                gameDiv.innerHTML += `<span class="red">${gameMap[y][x]}</span>`;
            } else {
                gameDiv.innerHTML += gameMap[y][x];
            }
        }
        gameDiv.innerHTML += '\n';
    }
}

function logMessage(message) {
    let logDiv = document.getElementById('log');
    logDiv.innerHTML += message + '\n';
    logDiv.scrollTop = logDiv.scrollHeight;  // Scroll to the bottom
}

function attack(attacker, defender) {
    let damage = Math.max(0, Math.floor(Math.random() * attacker.attack) + 1 - defender.defense);
    defender.health -= damage;
    return damage;
}


function updatePlayerInfo() {
    let playerInfoDiv = document.getElementById('player-info');
    playerInfoDiv.innerHTML = `Player Info\nLevel: ${player.level}\nExperience: ${player.experience}\nAttack: ${player.attack}\nDefense: ${player.defense}\nHealth: ${player.health}/${player.maxHealth}`;
}

function updateFloorInfo() {
    let floorDiv = document.getElementById('floor-number');
    floorDiv.innerHTML = floor;
}


function movePlayer(dx, dy) {
    let newX = player.x + dx;
    let newY = player.y + dy;

    if (newX >= 0 && newX < WIDTH && newY >= 0 && newY < HEIGHT) {
        let destination = gameMap[newY][newX];

        if (destination === FLOOR || destination === STAIRS) {
            // Move player to new position
            gameMap[player.y][player.x] = (player.x === stairsPosition.x && player.y === stairsPosition.y) ? STAIRS : FLOOR;
            player.x = newX;
            player.y = newY;

            // If the player moves off the stairs, restore the stairs tile
            if (player.x !== stairsPosition.x || player.y !== stairsPosition.y) {
                gameMap[stairsPosition.y][stairsPosition.x] = STAIRS;
            }

            gameMap[player.y][player.x] = PLAYER;
            
            // Set canDescend flag if on stairs
            if (destination === STAIRS) {
                canDescend = true;
                logMessage(`You are on stairs. Press '>' to move to the next floor.`);
            } else {
                canDescend = false; // Reset flag if player moves off stairs

            }
        } else if (destination === 'a') {
            let monster = monsters.find(m => m.x === newX && m.y === newY);
            if (monster) {
                let playerDamage = attack(player, monster);
                let monsterDamage = attack(monster, player);
                logMessage(`Player attacks ${monster.name} for ${playerDamage} damage.`);
                logMessage(`${monster.name} attacks Player for ${monsterDamage} damage.`);
                if (monster.health <= 0) {
                    logMessage(`${monster.name} is dead.`);
                    gameMap[monster.y][monster.x] = FLOOR;
                    monsters = monsters.filter(m => m !== monster);
                    player.experience += 1; // Gain experience for killing a monster

                    if (player.experience >= player.level * 10) {
                        player.experience -= player.level * 10;
                        player.level += 1;
                        player.attack += 1;
                        player.defense += 1;
                        player.maxHealth += 1;
                        player.health = player.maxHealth; // Fully heal on level up

                        logMessage(`Player leveled up to level ${player.level}!`);
                    }
                }
                if (player.health <= 0) {
                    logMessage(`Player is dead. Game over.`);
                    document.removeEventListener('keydown', handleKeydown);
                    showGameOver();
                }
            }
        }
        moveMonsters();
        drawMap();
        updatePlayerInfo(); // Update player info after each move
    }
}

function moveMonsters() {
    for (let monster of monsters) {
        let distanceX = player.x - monster.x;
        let distanceY = player.y - monster.y;

        if (Math.abs(distanceX) <= MONSTER_VISION_RADIUS && Math.abs(distanceY) <= MONSTER_VISION_RADIUS) {
            let dx = distanceX > 0 ? 1 : (distanceX < 0 ? -1 : 0);
            let dy = distanceY > 0 ? 1 : (distanceY < 0 ? -1 : 0);
            
            let newX = monster.x + dx;
            let newY = monster.y + dy;

            if (newX === player.x && newY === player.y) {
                let monsterDamage = attack(monster, player);
                logMessage(`${monster.name} attacks Player for ${monsterDamage} damage.`);
                if (player.health <= 0) {
                    logMessage(`Player is dead. Game over.`);
                    document.removeEventListener('keydown', handleKeydown);
                    showGameOver();
                }
            } else if (gameMap[newY][newX] === FLOOR) {
                gameMap[monster.y][monster.x] = FLOOR;
                monster.x = newX;
                monster.y = newY;
                gameMap[monster.y][monster.x] = 'a';
            }
        }
    }
}

function handleKeydown(event) {
    switch (event.key) {
        case 'ArrowUp':
            movePlayer(0, -1);
            break;
        case 'ArrowDown':
            movePlayer(0, 1);
            break;
        case 'ArrowLeft':
            movePlayer(-1, 0);
            break;
        case 'ArrowRight':
            movePlayer(1, 0);
            break;
        case '>':
            // Only allow descending if on stairs
            if (canDescend) {
                floor++;
                updateFloorInfo();
                generateMap();
                drawMap();
                updatePlayerInfo(); // Update player info after map generation
                logMessage(`Descending to floor ${floor}.`);
            } else {
                logMessage(`You must be on stairs to descend.`);
            }
            break;
        case '.':
            // Resting
            restCount++;
            if (restCount >= 5) {
                restCount = 0;
                if (player.health < player.maxHealth) {
                    player.health = Math.min(player.maxHealth, player.health + 1);
                    logMessage(`Player rests and heals 1 health.`);
                }
            }
            moveMonsters();
            drawMap();
            updatePlayerInfo();
            break;
    }
}


function calculateScore() {
    return (floor * 5) + (player.level * 10) + player.experience;
}

function showGameOver() {
    let overlay = document.getElementById('game-over-overlay');
    let scoreElement = document.getElementById('score');
    let score = calculateScore();
    scoreElement.innerHTML = `Your score: ${score}`;
    overlay.style.display = 'flex';
}

function restartGame() {
    let overlay = document.getElementById('game-over-overlay');
    overlay.style.display = 'none';
    
    // 초기화
    player = {
        x: 1,
        y: 1,
        attack: 3,
        defense: 1,
        health: 10,
        maxHealth: 10,
        level: 1,
        experience: 0
    };
    floor = 1;
    restCount = 0; // Rest counter 초기화
    canDescend = false; // Flag 초기화
    
    // 로그 초기화
    let logDiv = document.getElementById('log');
    logDiv.innerHTML = '';

    generateMap();
    drawMap();
    updatePlayerInfo();
    updateFloorInfo();
    document.addEventListener('keydown', handleKeydown);
}

document.addEventListener('keydown', handleKeydown);

generateMap();
drawMap();
updatePlayerInfo(); // Initial update of player info
updateFloorInfo(); // Initial update of floor info