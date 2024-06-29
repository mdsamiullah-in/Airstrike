let score = 0;
let highScore = 0;

function createAirplane() {
    const airplane = document.createElement('img');
    airplane.src = 'aero-removebg-preview.png';
    airplane.className = 'aero';
    airplane.style.right = '5%';
    airplane.style.top = `${Math.random() * 10 + 10}%`; // Random vertical position
    airplane.style.animation = `anim ${Math.random() * 8 + 5}s linear`;

    airplane.exploded = false; // Custom property to check if the airplane has already exploded

    document.body.appendChild(airplane);

    // Remove airplane from DOM when animation ends
    airplane.addEventListener('animationend', () => {
        airplane.remove();
    });
}

function spawnAirplanes() {
    const numberOfAirplanes = Math.floor(Math.random() * 2) + 2; // 2 or 3 airplanes
    for (let i = 0; i < numberOfAirplanes; i++) {
        createAirplane();
    }
}

setInterval(spawnAirplanes, 3000);

function loadHighScore() {
    const savedHighScore = localStorage.getItem('highScore');
    if (savedHighScore !== null) {
        highScore = parseInt(savedHighScore, 10);
    }
    updateHighScore();
}

function updateScore() {
    const scoreElement = document.getElementById('score');
    scoreElement.textContent = `Score: ${score}`;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore); // Save high score to localStorage
        updateHighScore();
    }
}

function updateHighScore() {
    const highScoreElement = document.getElementById('highScore');
    highScoreElement.textContent = `High Score: ${highScore}`;
}

loadHighScore();
updateScore();

const launcher = document.getElementById('launcher');
const missile = document.getElementById('missile'); // Ensure correct ID is used
const bullet = document.getElementById('bullet');

document.addEventListener('mousemove', function(event) {
    const launcherRect = launcher.getBoundingClientRect();
    const launcherCenterX = launcherRect.left + launcherRect.width / 2;
    const launcherCenterY = launcherRect.top + launcherRect.height / 2;
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    const angle = Math.atan2(mouseY - launcherCenterY, mouseX - launcherCenterX);
    const angleDegrees = angle * (180 / Math.PI);
    launcher.style.transform = `rotate(${angleDegrees}deg)`;
    missile.style.transform = `rotate(${angleDegrees}deg)`;
});

document.addEventListener('click', function(event) {
    const launcherRect = launcher.getBoundingClientRect();
    const angleRadians = parseFloat(launcher.style.transform.match(/rotate\(([-\d.]+)deg\)/)[1]) * (Math.PI / 180);
    const missileEndX = launcherRect.left + launcherRect.width / 2 + Math.cos(angleRadians) * (launcherRect.height / 2);
    const missileEndY = launcherRect.top + launcherRect.height / 2 + Math.sin(angleRadians) * (launcherRect.height / 2);

    bullet.style.left = `${missileEndX}px`;
    bullet.style.top = `${missileEndY}px`;
    bullet.style.display = 'block';

    const mouseX = event.clientX;
    const mouseY = event.clientY;
    const angle = Math.atan2(mouseY - missileEndY, mouseX - missileEndX);
    const speed = 5; // Speed of the bullet
    const velocityX = Math.cos(angle) * speed;
    const velocityY = Math.sin(angle) * speed;

    function moveBullet() {
        const currentX = parseFloat(bullet.style.left);
        const currentY = parseFloat(bullet.style.top);
        bullet.style.left = `${currentX + velocityX}px`;
        bullet.style.top = `${currentY + velocityY}px`;

        if (
            currentX + velocityX > window.innerWidth || currentX + velocityX < 0 ||
            currentY + velocityY > window.innerHeight || currentY + velocityY < 0
        ) {
            bullet.style.display = 'none';
        } else {
            // Check for collision with airplanes
            const airplanes = document.querySelectorAll('.aero');
            airplanes.forEach(airplane => {
                if (!airplane.exploded && isColliding(bullet, airplane)) {
                    explodeAirplane(airplane);
                    dropBomb(airplane); // New function call to drop bomb
                }
            });

            requestAnimationFrame(moveBullet);
        }
    }

    moveBullet();
});

function isColliding(bullet, airplane) {
    const bulletRect = bullet.getBoundingClientRect();
    const airplaneRect = airplane.getBoundingClientRect();

    return !(
        bulletRect.top > airplaneRect.bottom ||
        bulletRect.bottom < airplaneRect.top ||
        bulletRect.left > airplaneRect.right ||
        bulletRect.right < airplaneRect.left
    );
}

function explodeAirplane(airplane) {
    airplane.exploded = true;
    airplane.style.rotate = "20deg";
    airplane.style.transition = "margin-top 2s ease-in";
    airplane.src  = "blast3-removebg-preview.png"
    airplane.style.marginTop = '400px';
    setTimeout(function(){
        let blastSound = new Audio('medium-explosion-40472.mp3');
        blastSound.play();
    }, 2000);
    airplane.style.animationPlayState = 'paused'; // Stop animation

    // After transition ends, make the airplane position fixed
    airplane.addEventListener('transitionend', function () {
        airplane.style.position = 'absolute';
        airplane.style.marginTop = ''; // Clear marginTop to avoid conflicts with position
        airplane.style.top = `${airplane.getBoundingClientRect().top}px`;
        airplane.style.right = `${airplane.getBoundingClientRect().right}px`;
        airplane.style.transform = 'none'; // Clear any transformations applied by animation
        airplane.style.transition = 'none'; // Clear transition styles
        airplane.style.display = "none";
    });

    score++;
    updateScore();
    
    let gunSound = new Audio('medium-explosion-40472.mp3');
    gunSound.play();
}

function dropBomb(airplane) {
    const bomb = document.createElement('div');
    bomb.className = 'bomb';
    bomb.style.left = `${airplane.getBoundingClientRect().left}px`;
    bomb.style.top = `${airplane.getBoundingClientRect().top}px`;
    document.body.appendChild(bomb);

    setTimeout(function(){
        bomb.style.top = `${window.innerHeight}px`; // Drop the bomb to the bottom of the screen
        setTimeout(function(){
            bomb.remove(); // Remove the bomb after it hits the ground
        }, 2000); // Adjust the time according to your preference
    }, 1000); // Adjust the time according to your preference
}



