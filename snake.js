// 遊戲配置
const GAME_CONFIG = {
    gridSize: 20,
    canvasWidth: 400,
    canvasHeight: 400,
    initialSpeed: 150, // 毫秒
    speedIncrement: 5,  // 每次吃到食物速度增加
    colors: {
        snake: '#4ecdc4',
        snakeHead: '#ff6b6b',
        food: '#ffd93d',
        background: '#2c3e50',
        grid: 'rgba(255, 255, 255, 0.1)'
    }
};

// 遊戲狀態
let gameState = {
    snake: [{x: 10, y: 10}],
    direction: {x: 0, y: 0},
    food: {x: 15, y: 15},
    score: 0,
    gameRunning: false,
    gamePaused: false,
    gameSpeed: GAME_CONFIG.initialSpeed
};

// DOM 元素
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');

// 初始化遊戲
function initGame() {
    // 從 localStorage 讀取最高分
    const savedHighScore = localStorage.getItem('snakeHighScore');
    if (savedHighScore) {
        highScoreElement.textContent = savedHighScore;
    }
    
    resetGame();
    drawGame();
    
    // 添加鍵盤事件監聽
    document.addEventListener('keydown', handleKeyPress);
    
    // 開始遊戲循環
    startGame();
}

// 重置遊戲狀態
function resetGame() {
    gameState.snake = [{x: 10, y: 10}];
    gameState.direction = {x: 0, y: 0};
    gameState.score = 0;
    gameState.gameRunning = false;
    gameState.gamePaused = false;
    gameState.gameSpeed = GAME_CONFIG.initialSpeed;
    
    generateFood();
    updateScore();
    gameOverElement.style.display = 'none';
}

// 開始遊戲
function startGame() {
    if (!gameState.gameRunning && !gameState.gamePaused) {
        gameState.gameRunning = true;
        gameLoop();
    }
}

// 遊戲主循環
function gameLoop() {
    if (!gameState.gameRunning || gameState.gamePaused) return;
    
    update();
    drawGame();
    
    setTimeout(() => {
        if (gameState.gameRunning) {
            gameLoop();
        }
    }, gameState.gameSpeed);
}

// 更新遊戲狀態
function update() {
    if (gameState.direction.x === 0 && gameState.direction.y === 0) return;
    
    // 移動蛇頭
    const head = {
        x: gameState.snake[0].x + gameState.direction.x,
        y: gameState.snake[0].y + gameState.direction.y
    };
    
    // 檢查邊界碰撞
    if (head.x < 0 || head.x >= GAME_CONFIG.canvasWidth / GAME_CONFIG.gridSize ||
        head.y < 0 || head.y >= GAME_CONFIG.canvasHeight / GAME_CONFIG.gridSize) {
        gameOver();
        return;
    }
    
    // 檢查自身碰撞
    if (gameState.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }
    
    gameState.snake.unshift(head);
    
    // 檢查是否吃到食物
    if (head.x === gameState.food.x && head.y === gameState.food.y) {
        gameState.score += 10;
        updateScore();
        generateFood();
        // 增加遊戲速度
        gameState.gameSpeed = Math.max(50, gameState.gameSpeed - GAME_CONFIG.speedIncrement);
    } else {
        gameState.snake.pop();
    }
}

// 繪製遊戲
function drawGame() {
    // 清空畫布
    ctx.fillStyle = GAME_CONFIG.colors.background;
    ctx.fillRect(0, 0, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);
    
    // 繪製網格
    drawGrid();
    
    // 繪製蛇
    drawSnake();
    
    // 繪製食物
    drawFood();
}

// 繪製網格
function drawGrid() {
    ctx.strokeStyle = GAME_CONFIG.colors.grid;
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= GAME_CONFIG.canvasWidth; i += GAME_CONFIG.gridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, GAME_CONFIG.canvasHeight);
        ctx.stroke();
    }
    
    for (let i = 0; i <= GAME_CONFIG.canvasHeight; i += GAME_CONFIG.gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(GAME_CONFIG.canvasWidth, i);
        ctx.stroke();
    }
}

// 繪製蛇
function drawSnake() {
    gameState.snake.forEach((segment, index) => {
        const x = segment.x * GAME_CONFIG.gridSize;
        const y = segment.y * GAME_CONFIG.gridSize;
        
        if (index === 0) {
            // 蛇頭
            ctx.fillStyle = GAME_CONFIG.colors.snakeHead;
            ctx.fillRect(x + 1, y + 1, GAME_CONFIG.gridSize - 2, GAME_CONFIG.gridSize - 2);
            
            // 添加眼睛
            ctx.fillStyle = 'white';
            const eyeSize = 3;
            const eyeOffset = 5;
            
            if (gameState.direction.x === 1) { // 向右
                ctx.fillRect(x + GAME_CONFIG.gridSize - eyeOffset, y + 4, eyeSize, eyeSize);
                ctx.fillRect(x + GAME_CONFIG.gridSize - eyeOffset, y + GAME_CONFIG.gridSize - 7, eyeSize, eyeSize);
            } else if (gameState.direction.x === -1) { // 向左
                ctx.fillRect(x + 2, y + 4, eyeSize, eyeSize);
                ctx.fillRect(x + 2, y + GAME_CONFIG.gridSize - 7, eyeSize, eyeSize);
            } else if (gameState.direction.y === -1) { // 向上
                ctx.fillRect(x + 4, y + 2, eyeSize, eyeSize);
                ctx.fillRect(x + GAME_CONFIG.gridSize - 7, y + 2, eyeSize, eyeSize);
            } else if (gameState.direction.y === 1) { // 向下
                ctx.fillRect(x + 4, y + GAME_CONFIG.gridSize - eyeOffset, eyeSize, eyeSize);
                ctx.fillRect(x + GAME_CONFIG.gridSize - 7, y + GAME_CONFIG.gridSize - eyeOffset, eyeSize, eyeSize);
            }
        } else {
            // 蛇身
            ctx.fillStyle = GAME_CONFIG.colors.snake;
            ctx.fillRect(x + 1, y + 1, GAME_CONFIG.gridSize - 2, GAME_CONFIG.gridSize - 2);
        }
    });
}

// 繪製食物
function drawFood() {
    const x = gameState.food.x * GAME_CONFIG.gridSize;
    const y = gameState.food.y * GAME_CONFIG.gridSize;
    
    ctx.fillStyle = GAME_CONFIG.colors.food;
    ctx.beginPath();
    ctx.arc(
        x + GAME_CONFIG.gridSize / 2,
        y + GAME_CONFIG.gridSize / 2,
        GAME_CONFIG.gridSize / 2 - 2,
        0,
        2 * Math.PI
    );
    ctx.fill();
    
    // 添加光暈效果
    ctx.fillStyle = 'rgba(255, 217, 61, 0.5)';
    ctx.beginPath();
    ctx.arc(
        x + GAME_CONFIG.gridSize / 2,
        y + GAME_CONFIG.gridSize / 2,
        GAME_CONFIG.gridSize / 2,
        0,
        2 * Math.PI
    );
    ctx.fill();
}

// 生成食物
function generateFood() {
    const maxX = GAME_CONFIG.canvasWidth / GAME_CONFIG.gridSize;
    const maxY = GAME_CONFIG.canvasHeight / GAME_CONFIG.gridSize;
    
    do {
        gameState.food = {
            x: Math.floor(Math.random() * maxX),
            y: Math.floor(Math.random() * maxY)
        };
    } while (gameState.snake.some(segment => 
        segment.x === gameState.food.x && segment.y === gameState.food.y
    ));
}

// 處理鍵盤輸入
function handleKeyPress(event) {
    if (!gameState.gameRunning && event.code !== 'Space') {
        startGame();
    }
    
    switch (event.code) {
        case 'ArrowUp':
            if (gameState.direction.y === 0) {
                gameState.direction = {x: 0, y: -1};
            }
            break;
        case 'ArrowDown':
            if (gameState.direction.y === 0) {
                gameState.direction = {x: 0, y: 1};
            }
            break;
        case 'ArrowLeft':
            if (gameState.direction.x === 0) {
                gameState.direction = {x: -1, y: 0};
            }
            break;
        case 'ArrowRight':
            if (gameState.direction.x === 0) {
                gameState.direction = {x: 1, y: 0};
            }
            break;
        case 'Space':
            event.preventDefault();
            togglePause();
            break;
    }
}

// 切換暫停狀態
function togglePause() {
    if (!gameState.gameRunning) return;
    
    gameState.gamePaused = !gameState.gamePaused;
    
    if (!gameState.gamePaused) {
        gameLoop();
    }
}

// 更新分數顯示
function updateScore() {
    scoreElement.textContent = gameState.score;
    
    // 更新最高分
    const currentHighScore = parseInt(highScoreElement.textContent);
    if (gameState.score > currentHighScore) {
        highScoreElement.textContent = gameState.score;
        localStorage.setItem('snakeHighScore', gameState.score);
    }
}

// 遊戲結束
function gameOver() {
    gameState.gameRunning = false;
    finalScoreElement.textContent = gameState.score;
    gameOverElement.style.display = 'block';
}

// 重新開始遊戲
function restartGame() {
    resetGame();
    drawGame();
}

// 頁面加載完成後初始化遊戲
window.addEventListener('load', initGame);

// 防止方向鍵滾動頁面
window.addEventListener('keydown', (e) => {
    if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
    }
});