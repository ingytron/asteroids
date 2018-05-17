
/**
  File: A3.pde
  Group: Ingrid Molloy, Mirabai Perrier, Matthew Tolmie
  Date: April 16, 2018
  Course: COSC101 - Software Development Studio 1
  Desc: Asteroids game
  Usage: Make sure to run in the processing environment and press play
         Controls:
         Turn left = a, left arrow, num pad 4
         Turn right = d, right arrow, num pad 6
         Forward = w, up arrow, num pad 8
         Fire weapon = space
         Emergency brake = e

  Notes: MP3 files source - recordings of Matt's kids
  background picture from http://hubblesite.org/image/3920/gallery 
  copyright info at http://hubblesite.org/about_us/copyright.php
  
  Bonus work includes:
  - Hubble telescope picture background
  - Asteroids progressively shrink when hit until they are wiped out
  - Vector based motion (Matt - could you pad this out?), 
  - Acceleration and constant motion of ship to reflect Newton's laws of motion in a vacuum
  - Emergency brake
  - Advanced levelling system where more asteroids are introduced for the harder levels (???)
  - Sound effects - Matt you mentioned something about recordings of your kids
      are you planning on adding these in? If not I've got ableton sound production workstation so
      I could potentially find some synth sounds to add in, or Ingrid, do you have any sound effects?
  
*/

PShape shipShape, shipBody, shipTail, shipCockpit, shipShoot;  // shapes making ship
PShape thrusterShape, thrusterMain, thrusterBack, thrusterLeft, thrusterRight;
PShape[] astShapes = new PShape[3];  // array of different asteroid size PShapes
PImage hubble;

Ship myShip;

int currentScore = 0;
String score = "Score";
int round = 1;
String level = "Level";
String highScore = "High Score";
int lives = 3;
boolean gameOver = false;

float speed = 0;
float maxSpeed = 4;
float shipSize = 1.0; // define the scale of the ship (and thruster) shape
float radiansDir = radians(270); //if your ship is facing up (like in atari game)

ArrayList<Asteroid> asteroids = new ArrayList<Asteroid>();
int numAsteroids = 4; // initial number of asteroids
float asteroidScaleSize = 1; // define the scale of the full size asteroid
int killAsteroidsCounter = 0; // counter I'm using to kill the asteroids periodically

ArrayList<Shot> shots = new ArrayList<Shot>();

boolean sUP = false, sDOWN = false, sRIGHT = false, sLEFT = false;
// int score = 0;
boolean alive = true;
void setup() {
  size(1200, 800);
  
  hubble = loadImage("hubble.jpg");
  hubble.resize(1200,800);
  
  // initialise shapes for ship
  buildShip();
  buildThrusters();

  // initialise shapes for different asteroid sizes
  astShapes[0] = buildAsteroids(asteroidScaleSize / 4);
  astShapes[1] = buildAsteroids(asteroidScaleSize / 2);
  astShapes[2] = buildAsteroids(asteroidScaleSize);

  // create the ship
  myShip = new Ship();

  // add initial number of asteroids to the arraylist
  for (int i = 0; i < numAsteroids; i++) {
    asteroids.add(new Asteroid());
  }
}

void draw() {
  image (hubble,0,0);
  
  //might be worth checking to see if you are still alive first
  moveShip();
  collisionDetectBullets();
  collisionDetectShip();
  drawShots();
  // draw ship - call shap(..) if Pshape
  // report if game over or won
  drawAstroids();
  drawScore();
  drawLevel();
  drawLives();
}

/**
  Function: moveShip()
  Parameters: None
  Returns: Void
  Desc: Draws ship to current location based on direction and velocity.
        Responds to keypress actions, updating rotation and speed accordingly,
        and also verifies location in relation to display limits.
*/
void moveShip() {
  //this function should update if keys are pressed down 
     // - this creates smooth movement
  //update rotation,speed and update current location
  //you should also check to make sure your ship is not outside of the window
  if (sUP) {
    if (speed < maxSpeed) {
      speed += 0.1;
    }

    // define direction using speed and current angle of ship
    PVector direction = new PVector(cos(radiansDir), sin(radiansDir));
    direction.mult(speed);
    direction.normalize();
    myShip.velocity.add(direction);
  }
  if (sDOWN) {
    if (speed > 0) {
      speed -= 0.1;
    }

    // define direction using speed and current angle of ship
    PVector direction = new PVector(cos(radiansDir), sin(radiansDir));
    // normalize direction
    direction.normalize();

    myShip.velocity.sub(direction);
  }
  if (sRIGHT) {
    // increment radians 
    radiansDir += radians(2);
    // check if radians passing 360 degrees and reset if so
    if (radiansDir > radians(360)) {
      radiansDir -= radians(360);
    }
    // rotate the ship and thruster groups
    shipShape.rotate(radians(2));
    thrusterShape.rotate(radians(2));
  }
  if (sLEFT) {
    // decrement radians 
    radiansDir -= radians(2);
    // check if radians passing 0 degrees and reset if so
    if (radiansDir < radians(0)) {
      radiansDir += radians(360);
    }
    // rotate the ship and thruster groups
    shipShape.rotate(-radians(2));
    thrusterShape.rotate(-radians(2));
  }
    myShip.update();
    myShip.checkEdges();
    myShip.display(); 
}

/**
  Function: drawShots()
  Parameters: None
  Returns: Void
  Desc: Draws points for each shot from the spacecraft after updating to new
        location. Also verifies location in relation to display limits.
*/
void drawShots() {
  // create a new temporary ArrayList to store shots that are still alive
  ArrayList<Shot> shotsAlive = new ArrayList<Shot>();

  for (Shot s : shots) {
    // update shot
    s.update();
    
    // check if shot is still alive
    // (add to new ArrayList, check edges, and display if so)
    if (s.shotTimer > 0) {
      shotsAlive.add(s);
      s.checkEdges();
      s.display(); 
    }    
  }
  // update shots ArrayList to only those shots that are still alive
  shots = shotsAlive;
}
/**
  Function: drawScore()
  Parameters: Function to display the current player's score
  Returns: Player score
  Desc: Creates a scoreboard for the current player's score and displays it on the game area.
*/
void drawScore() {
  textSize(32);
  fill(#fefefe);
  text(score + " " + currentScore, 125, 125);
}

/**
  Function drawLevel()
  Parameters: Function to display the current player's level
  Returns: Player score
  Desc: Displays the  player's current level, which increments as the game progresses.
*/
void drawLevel() {
  textSize(24);
  fill(#fefefe);
  text(level + " " + round, 125, 154); 
}

/**
  Function drawLives()
  Parameters: Function to display the current player's remaining lives
  Returns: Player lives left
  Desc: Displays the  player's available lives, that are reduced when a ship 
  collides with an asteroid.
  */
void drawLives() {
  textSize(24);
  fill(#fefefe);
  text( "Ships left: " + lives, 125, 180); 
}

/**
  Function: checkHighScore()
  Parameters: Runs at the end of the game to check if a new high score has been reached.
  Returns: Congratulatory message
  Desc: This is the message that is displayed when a player gets a high score.
*/
void highScore() {
  // if (currentScore >= highScore){
    // replace background, maybe remove the current one and have black for a contrast
    // draw a message in the centre of the screen to say ("Congratulations! /n New High Score")
    // Then print the score in a large font
    // save off the new score as the new high score
    // prompt to "Click for new game"
  //}
}


/**
  Function: drawAstroids()
  Parameters: None
  Returns: Void
  Desc: Checks if an asteroid in not already and, if not, draws it at it's
        current location. Also verifies location in relation to display limits.
*/
void drawAstroids() {
  // create a new temporary ArrayList to store asteroids that are still alive
  ArrayList<Asteroid> asteroidsAlive = new ArrayList<Asteroid>();

  for (Asteroid a : asteroids) {
    a.update();
    // check if asteroid still alive
    // (add to new ArrayList, check edges, and display if so)
    if (a.astSize >= 0) {
      asteroidsAlive.add(a);
      a.checkEdges();
      a.display(); 
    }
  }

  // update asteroids ArrayList to only those asteroids that are still alive
  asteroids = asteroidsAlive;

  // check if asteroids ArrayList is empty and create a new (larger) one if so,
  // and increment the player level (round)
  if (asteroids.size() == 0) {
    numAsteroids += 2;
    round++;
    asteroids = new ArrayList<Asteroid>();
    for (int i = 0; i < numAsteroids; i++) {
      asteroids.add(new Asteroid());
    }
  }
}

/**
  Function: collisionDetection()
  Parameters: None
  Returns: Void
  Desc: Checks if shots have hit an asteroid(s) or if the ship has collided
        with any asteroids.
*/
void collisionDetectBullets() {
  for(Asteroid a : asteroids) {
    // create a new temporary ArrayList to store shots that are still alive
    ArrayList<Shot> shotsAlive = new ArrayList<Shot>();

float modifiedRadius = 0;
  if (a.astSize == 0)
    modifiedRadius = a.standardRadius*(asteroidScaleSize/4);
  else if (a.astSize == 1)
    modifiedRadius = a.standardRadius*(asteroidScaleSize/2);
  else
    modifiedRadius = a.standardRadius;

  for(Shot s : shots) {
    if (dist(a.location.x, a.location.y, s.location.x, s.location.y)<= modifiedRadius) {
      a.hit();
      } else {
        shotsAlive.add(s);
      }
    }
    // update shots ArrayList to only those shots that are still alive
    shots = shotsAlive;
  }
} 

void collisionDetectShip(){
  for(Asteroid a : asteroids){
    
    float modifiedRadius = 0;
    if (a.astSize == 0)
      modifiedRadius = a.standardRadius*(asteroidScaleSize/4);
    else if (a.astSize == 1)
       modifiedRadius = a.standardRadius*(asteroidScaleSize/2);
    else
      modifiedRadius = a.standardRadius;

    if (dist(a.location.x, a.location.y, myShip.location.x, myShip.location.y)<= modifiedRadius){
      myShip.location.x = width/2;
      myShip.location.y = height/2;
      lives--; // lose a life if you lose your ship 
      
      // TODO 
      // it resets to the centre and you don't move and an asteroid goes through the ship it 
      // deducts heaps of points (per frame I think. I think this is because it's reseting 
      // each loop)
      //myShip.velocity = new PVector(0, 0); 
      //I couldn't work out how to get the ship to face upwards 
      //can you guys help?  
    }
  }
}

/**
  Function: keyPressed()
  Parameters: None
  Returns: Void
  Desc: Defines actions performed when pressing specific keys.
*/
void keyPressed() {
  if (key == CODED) {
    if (keyCode == UP) {
      sUP=true;
      thrusterMain.setVisible(true);
    }
    if (keyCode == DOWN) {
      sDOWN=true;
      thrusterBack.setVisible(true);
    } 
    if (keyCode == RIGHT) {
      sRIGHT=true;
      thrusterRight.setVisible(true);
    }
    if (keyCode == LEFT) {
      sLEFT=true;
      thrusterLeft.setVisible(true);
    }
  }
  if (key == ' ') {
    // fire a shot
    shipShoot.setVisible(true);
    shots.add(new Shot());
  }
    if (key == 'e') {
    // emergency stop (for testing)
    myShip.emergencyStop();
 
  }
}

/**
  Function: keyReleased()
  Parameters: None
  Returns: Void
  Desc: Defines actions performed when releasing specific keys.
*/
void keyReleased() {
  if (key == CODED) {
    if (keyCode == UP) {
      sUP=false;
      thrusterMain.setVisible(false);
    }
    if (keyCode == DOWN) {
      sDOWN=false;
      thrusterBack.setVisible(false);
    } 
    if (keyCode == RIGHT) {
      sRIGHT=false;
      thrusterRight.setVisible(false);
    }
    if (keyCode == LEFT) {
      sLEFT=false;
      thrusterLeft.setVisible(false);
    }
  }
  if (key == ' ') {
    shipShoot.setVisible(false);
  }
}

/**
  Function: buildShip()
  Parameters: None
  Returns: Void
  Desc: Creates the PShape group that defines all the ship properties. 
        Various shapes for different ship components are defined and then
        grouped together. Certain components (e.g. flames) are not initially
        displayed and are tied to keypress functions.
*/
void buildShip() {
  shipShape = createShape(GROUP); // Create the grouped shape for the ship
  
  // main body of ship
  shipBody = createShape();
  shipBody.beginShape();
  shipBody.fill(125);
  shipBody.noStroke();
  shipBody.vertex(0, 0);
  shipBody.vertex(15, 50);
  shipBody.vertex(0, 40);
  shipBody.vertex(-15, 50);
  shipBody.endShape(CLOSE);
  
  // tail of ship
  shipTail = createShape();
  shipTail.beginShape();
  shipTail.fill(75);
  shipTail.noStroke();
  shipTail.vertex(0, 41);
  shipTail.vertex(25, 60);
  shipTail.vertex(0, 50);
  shipTail.vertex(-25, 60);
  shipTail.endShape(CLOSE);

  // cockpit of ship
  shipCockpit = createShape();
  shipCockpit.beginShape();
  shipCockpit.fill(25);
  shipCockpit.noStroke();
  shipCockpit.vertex(0, 15);
  shipCockpit.vertex(5, 30);
  shipCockpit.vertex(0, 32);
  shipCockpit.vertex(-5, 30);
  shipCockpit.endShape(CLOSE);

  // flash blast of ship shooting
  shipShoot = createShape();
  shipShoot.beginShape();
  shipShoot.setVisible(false);
  shipShoot.fill(253,208,35);
  shipShoot.stroke(255);
  shipShoot.strokeWeight(1);
  float angle = TWO_PI / 11;
  float halfAngle = angle/2.0;
  for (float a = 0; a < TWO_PI; a += angle) {
    float sx = cos(a) * 2;
    float sy = sin(a) * 2;
    shipShoot.vertex(sx, sy);
    sx = cos(a+halfAngle) * 1;
    sy = sin(a+halfAngle) * 1;
    shipShoot.vertex(sx, sy);
  }
  shipShoot.endShape(CLOSE);
  
  // combine ship group
  shipShape.addChild(shipBody);
  shipShape.addChild(shipShoot);
  shipShape.addChild(shipTail);
  shipShape.addChild(shipCockpit);

  // define size of ship
  shipShape.scale(shipSize);
}

/**
  Function: buildThrusters()
  Parameters: None
  Returns: Void
  Desc: Creates the PShape group that defines all the ship thrusters. 
        These components (e.g. flames) are not initially
        displayed and are tied to keypress functions.
*/
void buildThrusters() {
  thrusterShape = createShape(GROUP); // Create the grouped shape for the thrusters
  
  // main thruster of ship
  thrusterMain = createShape();
  thrusterMain.beginShape();
  thrusterMain.setVisible(false);
  thrusterMain.fill(235,235,0);
  thrusterMain.stroke(255,0,0);
  thrusterMain.strokeWeight(3);
  thrusterMain.vertex(0, 47);
  thrusterMain.vertex(10, 52);
  thrusterMain.vertex(7, 65);
  thrusterMain.vertex(5, 55);
  thrusterMain.vertex(0, 75);
  thrusterMain.vertex(-5, 55);
  thrusterMain.vertex(-7, 65);
  thrusterMain.vertex(-10, 52);
  thrusterMain.endShape(CLOSE);

  // reverse thruster of ship
  thrusterBack = createShape();
  thrusterBack.beginShape();
  thrusterBack.setVisible(false);
  thrusterBack.fill(235,235,0);
  thrusterBack.stroke(255,0,0);
  thrusterBack.strokeWeight(1);
  thrusterBack.vertex(4, 35);
  thrusterBack.vertex(7, 10);
  thrusterBack.vertex(11, 38);
  thrusterBack.vertex(-11, 38);
  thrusterBack.vertex(-7, 10);
  thrusterBack.vertex(-4, 35);
  thrusterBack.endShape(CLOSE);
  
  // left turn thruster of ship
  thrusterLeft = createShape();
  thrusterLeft.beginShape();
  thrusterLeft.setVisible(false);
  thrusterLeft.fill(235,235,0);
  thrusterLeft.stroke(255,0,0);
  thrusterLeft.strokeWeight(1);
  thrusterLeft.vertex(-10, 36);
  thrusterLeft.vertex(-22, 40);
  thrusterLeft.vertex(-10, 46);
  thrusterLeft.endShape(CLOSE);
  
  // right turn thruster of ship
  thrusterRight= createShape();
  thrusterRight.beginShape();
  thrusterRight.setVisible(false);
  thrusterRight.fill(235,235,0);
  thrusterRight.stroke(255,0,0);
  thrusterRight.strokeWeight(1);
  thrusterRight.vertex(10, 36);
  thrusterRight.vertex(22, 40);
  thrusterRight.vertex(10, 46);
  thrusterRight.endShape(CLOSE);
    
  // combine thruster group
  thrusterShape.addChild(thrusterMain);
  thrusterShape.addChild(thrusterBack);
  thrusterShape.addChild(thrusterLeft);
  thrusterShape.addChild(thrusterRight);

  // define size of thrusters
  thrusterShape.scale(shipSize);
}

/**
  Function: buildAsteroids()
  Parameters: Float determining size of asteroid
  Returns: PShape of asteroid
  Desc: Creates the PShape for the asteroids (designed
        to build different asteroid sizes and return a
        PShape relative to the defined size)
*/
PShape buildAsteroids(float percentageSize) {
  PShape result = createShape();
  result.beginShape();
  result.fill(25);
  result.stroke(125);
  result.strokeWeight(3);
  for (float a = -PI; a < 3.2; a += 0.16) {
    float r = random(30, 35);
    result.vertex(r*cos(a), r*sin(a));
  }
  result.endShape();
  result.scale(percentageSize);

  return result;
}
