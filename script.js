const canvas = document.getElementById('game');
const playAgain = document.getElementById('gameOver');
const context = canvas.getContext('2d');
const grid = 15;
const paddleHeight = grid * 5; // 80
const maxPaddleY = canvas.height - grid - paddleHeight;
const trashTalkMessage = document.getElementById('trashTalkMessage');

var paddleSpeed = 6;
var ballSpeed = 5;

var leftScore = 0;
var rightScore = 0;

const leftPaddle = {
  // start in the middle of the game on the left side
  x: grid * 2,
  y: canvas.height / 2 - paddleHeight / 2,
  width: grid,
  height: paddleHeight,

  // paddle velocity
  dy: 0
};
const rightPaddle = {
  // start in the middle of the game on the right side
  x: canvas.width - grid * 3,
  y: canvas.height / 2 - paddleHeight / 2,
  width: grid,
  height: paddleHeight,

  // paddle velocity
  dy: 0
};
const ball = {
  // start in the middle of the game
  x: canvas.width / 2,
  y: canvas.height / 2,
  width: grid,
  height: grid,

  // keep track of when need to reset the ball position
  resetting: false,

  // ball velocity (start going to the top-right corner)
  dx: ballSpeed,
  dy: -ballSpeed
};

// check for collision between two objects using axis-aligned bounding box (AABB)
// @see https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
function collides(obj1, obj2) {
  return obj1.x < obj2.x + obj2.width &&
         obj1.x + obj1.width > obj2.x &&
         obj1.y < obj2.y + obj2.height &&
         obj1.y + obj1.height > obj2.y;
}

// game loop
function loop() {
  requestAnimationFrame(loop);
  context.clearRect(0,0,canvas.width,canvas.height);

  // move paddles by their velocity
  leftPaddle.y += leftPaddle.dy;
  rightPaddle.y += rightPaddle.dy;

  // prevent paddles from going through walls
  if (leftPaddle.y < grid) {
    leftPaddle.y = grid;
  }
  else if (leftPaddle.y > maxPaddleY) {
    leftPaddle.y = maxPaddleY;
  }

  if (rightPaddle.y < grid) {
    rightPaddle.y = grid;
  }
  else if (rightPaddle.y > maxPaddleY) {
    rightPaddle.y = maxPaddleY;
  }

  // draw paddles
  context.fillStyle = 'white';
  context.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
  context.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);

  // move ball by its velocity
  ball.x += ball.dx;
  ball.y += ball.dy;

  // prevent ball from going through walls by changing its velocity
  if (ball.y < grid) {
    ball.y = grid;
    ball.dy *= -1;
  }
  else if (ball.y + grid > canvas.height - grid) {
    ball.y = canvas.height - grid * 2;
    ball.dy *= -1;
  }
  
  // left score
  context.font = "30px solid";
  context.fillText(leftScore, 180, 100);
  
  // right score
  context.font = "30px solid";
  context.fillText(rightScore, 600, 100);
  
  // reset ball if it goes past paddle (but only if we haven't already done so)
  if ( (ball.x < 0 || ball.x > canvas.width) && !ball.resetting) {
    ball.resetting = true;

    // add to score if point is scored
    if(ball.x < 0) {
      rightScore += 1;
      trashTalk();
      trashTalkMessage.hidden = false;
    }

    if(ball.x > canvas.width) {
      leftScore += 1;
      positiveTrashTalk();
      trashTalkMessage.hidden = false;
    }

    // give some time for the player to recover before launching the ball again
    setTimeout(() => {
      ball.resetting = false;
      ball.x = canvas.width / 2;
      ball.y = canvas.height / 2;
    }, 400);
  }

  // check to see if ball collides with paddle. if they do change x velocity
  if (collides(ball, leftPaddle)) {
    ball.dx *= -1;

    // move ball next to the paddle otherwise the collision will happen again
    // in the next frame
    ball.x = leftPaddle.x + leftPaddle.width;
  }
  else if (collides(ball, rightPaddle)) {
    ball.dx *= -1;

    // move ball next to the paddle otherwise the collision will happen again
    // in the next frame
    ball.x = rightPaddle.x - ball.width;
  }

  // draw ball
  context.fillRect(ball.x, ball.y, ball.width, ball.height);

  // draw walls
  context.fillStyle = 'lightgrey';
  context.fillRect(0, 0, canvas.width, grid);
  context.fillRect(0, canvas.height - grid, canvas.width, canvas.height);

  // draw dotted line down the middle
  for (let i = grid; i < canvas.height - grid; i += grid * 2) {
    context.fillRect(canvas.width / 2 - grid / 2, i, grid, grid);
  }
  
  // does paddle track ball?
  let num = Math.floor(Math.random() * 6);
  if(num === 0){
    rightPaddle.dy = 0;
  } else {
    rightPaddle.dy = ball.dy;
  }

  // game over, first one to seven
  if(rightScore >= 7 || leftScore >= 7){
    canvas.hidden = true;
    playAgain.hidden = false;
    trashTalkMessage.hidden = true;
  }
  
}

// start game again function
function startAgain(){
  canvas.hidden = false;
  playAgain.hidden = true;  
  leftScore = 0;
  rightScore = 0;
  ball.dx = 2;
  ball.dy = 2;
  requestAnimationFrame(loop);
}

// listen to keyboard events to move the paddles
document.addEventListener('keydown', function(e) {
  // w key
  if (e.which === 87) {
    leftPaddle.dy = -paddleSpeed;
  }
  // a key
  else if (e.which === 83) {
    leftPaddle.dy = paddleSpeed;
  }
});

// listen to keyboard events to stop the paddle if key is released
document.addEventListener('keyup', function(e) {
  if (e.which === 83 || e.which === 87) {
    leftPaddle.dy = 0;
  }
  
});

// start the game
requestAnimationFrame(loop);

function trashTalk() {
  var message;
  switch (Math.floor(Math.random() * 10)) {
      case 0:
          message = "I remember the first time I played pong";
          break;
      case 1:
          message = "Does your paddle have a hole in it?";
          break;
      case 2:
          message = "Let me know when you start trying";
          break;
      case 3:
          message = "Your mom is cheering for me";
          break;
      case 4:
          message = "Maybe you should reevaluate your life";
          break;
      case 5:
          message = "You can do better than that";
          break;
      case 6:
          message = "You better pick it up";
          break;
      case 7:
          message = "Don't let Dr. Matta down";
          break;
      case 8:
          message = "I've seen better swings in a backyard";
          break;
      case 9:
          message = "Can you even see the ball?";
          break;
  }
  trashTalkMessage.innerText = message;
}

function positiveTrashTalk() {
  var message;
  switch (Math.floor(Math.random() * 10)) {
      case 0:
          message = "Nice swing";
          break;
      case 1:
          message = "This game will be over in no time";
          break;
      case 2:
          message = "Keep it up";
          break;
      case 3:
          message = "You're a professional";
          break;
      case 4:
          message = "Good work";
          break;
      case 5:
          message = "Great point";
          break;
      case 6:
          message = "Comin' in hot!";
          break;
      case 7:
          message = "Dr. Matta would be proud";
          break;
      case 8:
          message = "Serena Williams in the house";
          break;
      case 9:
          message = "You got this";
          break;
  }
  trashTalkMessage.innerText = message;
}
