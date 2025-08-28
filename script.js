const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 350;

let bird = {
    x: 50,
    y: canvas.height / 2,
    width: 20,
    height: 20,
    gravity: 0.1,
    lift: -3,
    velocity: 0
};

let pipes = [];
let frame = 0;
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let gameOver = false;



// Load background image
const bgImg = new Image();
bgImg.src = "blue-sky-background-pixel-art-style_475147-2665.avif";
let bgX = 0;
let bgSpeed = 1.5; // adjust for faster/slower scrolling


function drawBackground() {
    // draw two images side by side for looping
    ctx.drawImage(bgImg, bgX, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImg, bgX + canvas.width, 0, canvas.width, canvas.height);

    // move background
    bgX -= bgSpeed;

    // reset when first image fully off screen
    if (bgX <= -canvas.width) {
        bgX = 0;
    }
}

function drawBird() {
    ctx.fillStyle = "yellow";
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
}

function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (bird.y + bird.height > canvas.height) {
        bird.y = canvas.height - bird.height;
        bird.velocity = 0;
        if (!gameOver) {
            endGame();
        }
    }

    if (bird.y < 0) {
        bird.y = 0;
        bird.velocity = 0;
    }
}

function drawPipes() {
    pipes.forEach(pipe => {
        ctx.fillStyle = "green";
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.top);
        ctx.fillRect(pipe.x, pipe.bottom, pipe.width, canvas.height - pipe.bottom);
    });
}

function updatePipes() {
    if (gameOver) return;

    if (frame % 150 === 0) {
        let gap = 100;
        let topHeight = Math.floor(Math.random() * (canvas.height / 2));
        pipes.push({ x: canvas.width, width: 30, top: topHeight, bottom: topHeight + gap });
    }
    pipes.forEach(pipe => {
        pipe.x -= 2;
        if (pipe.x + pipe.width < 0) {
            pipes.shift();
            score++;
            if (score > highScore) {
                highScore = score;
                localStorage.setItem("highScore", highScore);
            }
        }
    });
}

function checkCollision() {
    pipes.forEach(pipe => {
        if (bird.x < pipe.x + pipe.width && bird.x + bird.width > pipe.x) {
            if (bird.y < pipe.top || bird.y + bird.height > pipe.bottom) {
                if (!gameOver) {
                    endGame();
                }
            }
        }
    });
}

function endGame() {
    gameOver = true;
    cancelAnimationFrame(gameLoopID);
    document.querySelector('.game-over').style.display = 'block'; 
    document.getElementById("final-score").innerText = highScore; 
}

function resetGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    frame = 0;
    gameOver = false;
    document.querySelector('.game-over').style.display = 'none'; 
    gameLoop(); 
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground(); // draw moving background

    drawBird();
    updateBird();
    drawPipes();
    updatePipes();
    checkCollision();

    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 30);
    ctx.fillText("High Score: " + highScore, canvas.width - 150, 30);

    frame++;
    if (!gameOver) {
        gameLoopID = requestAnimationFrame(gameLoop);
    }
}

document.addEventListener("click", () => {
    if (!gameOver) bird.velocity = bird.lift;
});

document.addEventListener("keydown", (event) => {
    if ((event.key === " " || event.key === "ArrowUp") && !gameOver) {
        bird.velocity = bird.lift;
    }
});

gameLoop();
