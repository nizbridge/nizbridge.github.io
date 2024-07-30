const WIDTH = 50;
const HEIGHT = 30;
const PLAYER = '@';
const WALL = '#';
const FLOOR = '.';
const NUM_ROOMS = 10;
const ROOM_MIN_SIZE = 3;
const ROOM_MAX_SIZE = 8;

let player = {
    x: 1,
    y: 1,
    attack: 3,
    defense: 1,
    health: 10
};

let gameMap = [];
let monsters = [];

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

    generateMonsters();
    gameMap[player.y][player.x] = PLAYER;
}

function generateMonsters() {
    let numMonsters = Math.floor(Math.random() * 3) + 1; // 1 to 3 monsters
    for (let i = 0; i < numMonsters; i++) {
        let monster = {
            ...MONSTER_TYPES['a'],
            x: Math.floor(Math.random() * WIDTH),
            y: Math.floor(Math.random() * HEIGHT)
        };
        while (gameMap[monster.y][monster.x] !== FLOOR) {
            monster.x = Math.floor(Math.random() * WIDTH);
            monster.y = Math.floor(Math.random() * HEIGHT);
        }
        monsters.push(monster);
        gameMap[monster.y][monster.x] = 'a';
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
    playerInfoDiv.innerHTML = `Player Info\nAttack: ${player.attack}\nDefense: ${player.defense}\nHealth: ${player.health}`;
}

function movePlayer(dx, dy) {
    let newX = player.x + dx;
    let newY = player.y + dy;

    if (newX >= 0 && newX < WIDTH && newY >= 0 && newY < HEIGHT) {
        let destination = gameMap[newY][newX];

        if (destination === FLOOR) {
            gameMap[player.y][player.x] = FLOOR;
            player.x = newX;
            player.y = newY;
            gameMap[player.y][player.x] = PLAYER;
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
                }
                if (player.health <= 0) {
                    logMessage(`Player is dead. Game over.`);
                    document.removeEventListener('keydown', handleKeydown);
                }
            }
        }
        drawMap();
        updatePlayerInfo(); // Update player info after each move
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
    }
}

document.addEventListener('keydown', handleKeydown);

generateMap();
drawMap();
updatePlayerInfo(); // Initial update of player info