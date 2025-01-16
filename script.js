const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const startButton = document.getElementById('startButton');
const retryButton = document.getElementById('retryButton');

canvas.width = 320;
canvas.height = 480;

let score = 0;
let gameOver = false;
let gameStarted = false;

const gravity = 0.4;
const lift = -6;
const pipeSpeed = 2;

// Load bird image
const birdImage = new Image();
birdImage.src = 'https://i.postimg.cc/FHjz2wcy/Whats-App-Image-2024-11-30-at-15-39-32-e09d8f42.jpg'; // Replace with your bird image

// Load pillar image
const pillarImage = new Image();
pillarImage.src = 'https://i.postimg.cc/cJDc644M/pillar.jpg'; // Replace with your pillar image

// Load background image
const backgroundImage = new Image();
backgroundImage.src = 'https://i.postimg.cc/y8xxsVtz/background.jpg'; // Replace with your background image

let bird = {
    x: 50,
    y: canvas.height / 2,
    width: 40,
    height: 30,
    velocity: 0,
    draw() {
        ctx.drawImage(birdImage, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    },
    move() {
        if (gameStarted) {
            this.velocity += gravity;
            this.y += this.velocity;

            // Prevent the bird from falling off-screen
            if (this.y > canvas.height - this.height / 2) {
                this.y = canvas.height - this.height / 2;
                gameOver = true;
            }

            // Prevent the bird from going above the screen
            if (this.y < this.height / 2) {
                this.y = this.height / 2;
                this.velocity = 0;
            }
        }
    }
};

class Pipe {
    constructor(x) {
        this.x = x;
        this.width = 50;
        this.gap = 120;
        this.topHeight = Math.random() * (canvas.height / 2);
        this.bottomHeight = canvas.height - this.topHeight - this.gap;
        this.scored = false;
    }

    draw() {
        // Draw top pillar
        ctx.drawImage(pillarImage, this.x, 0, this.width, this.topHeight);

        // Draw bottom pillar
        ctx.drawImage(pillarImage, this.x, canvas.height - this.bottomHeight, this.width, this.bottomHeight);
    }

    move() {
        this.x -= pipeSpeed;
    }

    offscreen() {
        return this.x + this.width < 0;
    }

    hits(bird) {
        return (
            bird.x + bird.width / 2 > this.x &&
            bird.x - bird.width / 2 < this.x + this.width &&
            (bird.y - bird.height / 2 < this.topHeight || bird.y + bird.height / 2 > canvas.height - this.bottomHeight)
        );
    }
}

let pipes = [];

function spawnPipe() {
    pipes.push(new Pipe(canvas.width));
}

function update() {
    if (gameOver) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background image
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    bird.move();
    bird.draw();

    pipes.forEach((pipe, index) => {
        pipe.move();
        if (pipe.hits(bird)) {
            gameOver = true;
        }
        if (pipe.offscreen()) {
            pipes.splice(index, 1);
        }
        if (!pipe.scored && pipe.x + pipe.width < bird.x) {
            score += 10; // Increment score by 10 points
            pipe.scored = true;
        }
        pipe.draw();
    });

    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
        spawnPipe();
    }

    // Display score
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);

    if (!gameOver) {
        requestAnimationFrame(update);
    } else {
        ctx.fillStyle = 'black';
        ctx.font = '30px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 75, canvas.height / 2 - 20);
        retryButton.style.display = 'block';
    }
}

document.addEventListener('click', () => {
    if (gameStarted && !gameOver) {
        bird.velocity = lift; // Apply upward force when tapped
    }
});

startButton.addEventListener('click', () => {
    startButton.style.display = 'none';
    retryButton.style.display = 'none';
    gameStarted = true;
    score = 0;
    pipes = [];
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    spawnPipe();
    update();
});

retryButton.addEventListener('click', () => {
    retryButton.style.display = 'none';
    gameOver = false;
    gameStarted = true;
    score = 0;
    pipes = [];
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    spawnPipe();
    update();
});
