const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 910;
canvas.height = 450;
let bird = {
  x: 50,
  y: canvas.height / 2,
  width: 20,
  height: 20,
  gravity: 0.1,
  lift: -3,
  velocity: 0,
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
  const px = bird.x;
  const py = bird.y;
  const size = bird.width; // assume square
  const unit = size / 5;   // 5x5 pixel grid

  // Body (main yellow square)
  ctx.fillStyle = "yellow";
  ctx.fillRect(px + unit, py + unit, unit * 3, unit * 3);

  // Wing (orange block on the side)
  ctx.fillStyle = "orange";
  ctx.fillRect(px, py + unit * 2, unit, unit);

  // Eye (white square)
  ctx.fillStyle = "white";
  ctx.fillRect(px + unit * 3, py + unit, unit, unit);

  // Pupil (black pixel inside eye)
  ctx.fillStyle = "black";
  ctx.fillRect(px + unit * 3.25, py + unit + unit * 0.25, unit / 2, unit / 2);

  // Beak (orange blocky triangle-ish look)
  ctx.fillStyle = "orange";
  ctx.fillRect(px + unit * 4, py + unit * 2, unit, unit);
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
    const pipeColor = "#2ecc71";   // green body
    const borderColor = "#27ae60"; // darker green border
    const lipColor = "#1e8449";    // lip shade
    const unit = 6; // pixel block size

    // Top pipe body
    ctx.fillStyle = pipeColor;
    ctx.fillRect(pipe.x, 0, pipe.width, pipe.top);

    // Top pipe border (darker outline)
    ctx.fillStyle = borderColor;
    ctx.fillRect(pipe.x, 0, unit, pipe.top); // left border
    ctx.fillRect(pipe.x + pipe.width - unit, 0, unit, pipe.top); // right border

    // Top pipe lip (the fat rim at the bottom of top pipe)
    ctx.fillStyle = lipColor;
    ctx.fillRect(pipe.x - unit, pipe.top - unit * 2, pipe.width + unit * 2, unit * 2);

    // Bottom pipe body
    ctx.fillStyle = pipeColor;
    ctx.fillRect(pipe.x, pipe.bottom, pipe.width, canvas.height - pipe.bottom);

    // Bottom pipe border
    ctx.fillStyle = borderColor;
    ctx.fillRect(pipe.x, pipe.bottom, unit, canvas.height - pipe.bottom); // left
    ctx.fillRect(pipe.x + pipe.width - unit, pipe.bottom, unit, canvas.height - pipe.bottom); // right

    // Bottom pipe lip (rim at the top of bottom pipe)
    ctx.fillStyle = lipColor;
    ctx.fillRect(pipe.x - unit, pipe.bottom, pipe.width + unit * 2, unit * 2);
  });
}


function updatePipes() {
  if (gameOver) return;

  if (frame % 150 === 0) {
    let gap = 100;
    let topHeight = Math.floor(Math.random() * (canvas.height / 2));
    pipes.push({
      x: canvas.width,
      width: 30,
      top: topHeight,
      bottom: topHeight + gap,
    });
  }
  pipes.forEach((pipe) => {
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
  pipes.forEach((pipe) => {
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
  document.querySelector(".game-over").style.display = "block";
  document.getElementById("final-score").innerText = highScore;
}

function resetGame() {
  bird.y = canvas.height / 2;
  bird.velocity = 0;
  pipes = [];
  score = 0;
  frame = 0;
  gameOver = false;
  document.querySelector(".game-over").style.display = "none";
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

  ctx.fillStyle = "#FFD700"; // gold like title
  ctx.font = "14px 'Press Start 2P', cursive";
  ctx.textAlign = "left";
  ctx.fillText("Score: " + score, 20, 40);

  ctx.textAlign = "right";
  ctx.fillText("High Score: " + highScore, canvas.width - 20, 40);

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

// Start screen logic
document.getElementById("play-button").addEventListener("click", () => {
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("gameCanvas").style.display = "block";
  gameLoop();
});
