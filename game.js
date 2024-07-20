const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('finalScore');
const highScoreElement = document.getElementById('highScore');
const leaderboardElement = document.getElementById('leaderboard');
const resetButton = document.getElementById('resetButton');
let score = 0;
let highScore = 0;
let gameOver = false;
let keys = {};

const images = {
    spaceship: new Image(),
    bullet: new Image(),
    enemy: new Image()
};

// Load images
images.spaceship.src = 'images/spaceship.png';
images.bullet.src = 'images/bullet.png';
images.enemy.src = 'images/enemy.png';

class GameObject {
    constructor(x, y, width, height, image) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = image;
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

class Spaceship extends GameObject {
    constructor(x, y) {
        super(x, y, 50, 50, images.spaceship);
        this.dx = 5;
    }

    move() {
        if (keys['d'] && this.x + this.width < canvas.width) {
            this.x += this.dx;
        } else if (keys['a'] && this.x > 0) {
            this.x -= this.dx;
        }
    }
}

class Bullet extends GameObject {
    constructor(x, y) {
        super(x, y, 5, 10, images.bullet);
    }

    update() {
        this.y -= 7;
    }
}

class Enemy extends GameObject {
    constructor(x, y) {
        super(x, y, 50, 50, images.enemy);
    }

    update() {
        this.y += 2;
    }
}

const spaceship = new Spaceship(canvas.width / 2, canvas.height - 60);
let bullets = [];
let enemies = [];

function spawnEnemy() {
    const x = Math.random() * (canvas.width - 50);
    enemies.push(new Enemy(x, 0));
}

function detectCollisions() {
    bullets.forEach((bullet, bIndex) => {
        enemies.forEach((enemy, eIndex) => {
            if (bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {
                bullets.splice(bIndex, 1);
                enemies.splice(eIndex, 1);
                score += 2;
                scoreElement.textContent = `Score: ${score}`;
            }
        });
    });
}

function update() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    spaceship.move();
    spaceship.draw();
    
    bullets.forEach((bullet, index) => {
        bullet.update();
        if (bullet.y < 0) {
            bullets.splice(index, 1);
        } else {
            bullet.draw();
        }
    });

    enemies.forEach((enemy, index) => {
        enemy.update();
        if (enemy.y > canvas.height) {
            enemies.splice(index, 1);
        } else {
            enemy.draw();
        }
    });

    detectCollisions();
    checkGameOver();

    requestAnimationFrame(update);
}

function saveScore(score) {
    fetch('save_score.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `score=${score}`
    })
    .then(response => response.text())
    .then(data => {
        if (data === 'New record created successfully') {
            fetchLeaderboard();
        }
    })
    .catch(error => console.error('Error:', error));
}

function fetchHighScore() {
    fetch('get_high_score.php')
        .then(response => response.json())
        .then(data => {
            highScore = data.highScore;
            highScoreElement.textContent = `High Score: ${highScore}`;
        })
        .catch(error => console.error('Error:', error));
}

function fetchLeaderboard() {
    fetch('get_leaderboard.php')
        .then(response => response.json())
        .then(data => {
            leaderboardElement.innerHTML = 'Leaderboard:<br>';
            data.forEach((entry, index) => {
                leaderboardElement.innerHTML += `${index + 1}. ${entry.score}<br>`;
            });
        })
        .catch(error => console.error('Error:', error));
}

function checkGameOver() {
    enemies.forEach((enemy) => {
        if (enemy.y + enemy.height >= canvas.height) {
            gameOver = true;
            saveScore(score);
            finalScoreElement.textContent = `Game Over! Final Score: ${score}`;
            if (score > highScore) {
                highScore = score;
                highScoreElement.textContent = `High Score: ${highScore}`;
            }
            resetButton.style.display = 'block';
        }
    });
}

function resetGame() {
    score = 0;
    gameOver = false;
    bullets = [];
    enemies = [];
    spaceship.x = canvas.width / 2;
    spaceship.y = canvas.height - 60;
    scoreElement.textContent = `Score: ${score}`;
    finalScoreElement.textContent = '';
    resetButton.style.display = 'none';
    update();
}

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ') {
        bullets.push(new Bullet(spaceship.x + spaceship.width / 2 - 2.5, spaceship.y));
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

setInterval(spawnEnemy, 2000);

fetchHighScore();
fetchLeaderboard();
update();
