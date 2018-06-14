import processing.sound.*;
SoundFile pew, boom;

// Initialize graphic attributes
PShape shipShape, shipBody, shipTail, shipCockpit, shipShoot;  // ship shapes
PShape thrusterShape, thrusterMain, thrusterBack, thrusterLeft, thrusterRight;
PShape[] astShapes = new PShape[3];  // array of different asteroid size PShapes
PImage bimg; // background image

// Initialize player attributes
int currentScore = 0, level = 1, lives = 3, lifeTarget = 10000;
boolean gameOver = false;

// Initialize ship attributes
Ship myShip;
float speed = 0, maxSpeed = 4;
float shipSize = 1.0; // define the scale of the ship (and thruster) shape
float shipDir = radians(270); //if your ship is facing up (like in atari game)

// Initialize asteroid attributes
ArrayList<Asteroid> asteroids = new ArrayList<Asteroid>();
int numAsteroids = 4; // initial number of asteroids
float asteroidScaleSize = 1; // define the scale of the full size asteroid
float standardRadius = 35; // standard asteroid size (used for clash detection)

// Initialize projectile/shot attributes
ArrayList<Shot> shots = new ArrayList<Shot>();

// Initialize keypress/control attributes
boolean sUP = false, sDOWN = false, sRIGHT = false, sLEFT = false;

function draw(){
  background(bimg); // set the background

  collisionDetect(); // check for collisions between asteroids, shots, and ship
  moveShip(); // update location and draw the ship to screen
  drawShots(); // update location and draw the shots to screen
  drawAsteroids(); // update location and draw the asteroids to screen

  // draw scoreboard or game over screen based on boolean
  if (gameOver) {
    drawGameOver();
  } else {
    drawStats();
  }
}

function setup() {
  createCanvas(1200, 800);
  var bimg = loadImage("hubble.jpg");
  var bimg.resize(1200, 800);

  // load the sound files
  var pew = new SoundFile(this, "pew.mp3");
  var boom = new SoundFile(this, "boom.mp3");

  // initialise shapes for ship
  buildShip();
  buildThrusters();

  // initialise shapes for different asteroid sizes
  astShapes[0] = buildAsteroids(asteroidScaleSize / 4);
  astShapes[1] = buildAsteroids(asteroidScaleSize / 2);
  astShapes[2] = buildAsteroids(asteroidScaleSize);

  // create the ship
  var myShip = new Ship();

  // add initial number of asteroids to the arraylist
  for (int i = 0; i < numAsteroids; i++) {
    asteroids.add(new Asteroid());
  }
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
  if (sUP) {
    if (speed < maxSpeed) {
      speed += 0.1;
    }
    // define direction using speed and current angle of ship
    PVector direction = new PVector(cos(shipDir), sin(shipDir));
    // apply speed
    direction.mult(speed);
    // apply new direction to ship's motion
    myShip.velocity.add(direction);
  }

  if (sDOWN) {
    // decrease speed if above 0
    if (speed > 0) {
      speed -= 0.1;
    }
    // define direction using speed and current angle of ship
    PVector direction = new PVector(cos(shipDir), sin(shipDir));
    // round the speed
    direction.normalize();
    // apply new direction to ship's motion
    myShip.velocity.sub(direction);
  }

  if (sRIGHT) {
    if (!gameOver) {
      // increment radians
      shipDir += radians(2);
      // check if radians passing 360 degrees and reset if so
      if (shipDir > radians(360)) {
        shipDir -= radians(360);
      }
      // rotate the ship and thruster groups (unless the game is over)
      shipShape.rotate(radians(2));
      thrusterShape.rotate(radians(2));
    }
  }

  if (sLEFT) {
    if (!gameOver) {
      // decrement radians
      shipDir -= radians(2);
      // check if radians passing 0 degrees and reset if so
      if (shipDir < radians(0)) {
        shipDir += radians(360);
      }
      // rotate the ship and thruster groups
      shipShape.rotate(-radians(2));
      thrusterShape.rotate(-radians(2));
    }
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
 Function: drawAsteroids()
 Parameters: None
 Returns: Void
 Desc: Checks if an asteroid in not already and, if not, draws it at it's
 current location. Also verifies location in relation to display limits.
 */
void drawAsteroids() {
  // create a new temporary ArrayList to store asteroids that are still alive
  ArrayList<Asteroid> asteroidsAlive = new ArrayList<Asteroid>();

  for (Asteroid a : asteroids) {
    a.update();

    // check if asteroid still alive
    // (add to new ArrayList, check edges, and display if so)
    if (a.getSize() >= 0) {
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
    level++; // Level up when all asteroids have been destroyed
    asteroids = new ArrayList<Asteroid>();
    for (int i = 0; i < numAsteroids; i++) {
      asteroids.add(new Asteroid());
    }
  }
}

/**
 Function: drawStats()
 Parameters: None
 Returns: Void
 Desc: Creates a scoreboard for the current player's score, level, and remaining
       lives and displays it on the game area
 */
void drawStats() {
  // draw the score
  textSize(32);
  fill(#fefefe);
  text("Score " + currentScore, 100, 715);

  // draw the level
  textSize(24);
  fill(#8E97CB);
  text("Level: " + level, 100, 746);

  // draw the remaining lives
  text("Lives left: " + lives, 100, 776);
}

/**
 Function drawGameOver()
 Parameters: None
 Returns: Void
 Desc: Displays the end game message and player score
 */
void drawGameOver() {
  if (lives <= 0) {
    textSize(64);
    fill(#fefefe);
    text("G A M E  O V E R \n\nFinal score: " + currentScore, 350, 350);
    textSize(24);
    fill(#F7D170);
    text("Press n to play again", 500, 600);  }
}

/**
 Function newGame()
 Parameters: None
 Returns: Void
 Desc: Starts a new game for the player
 */
void newGame() {
  gameOver = false;
  currentScore = 0;
  lives = 3;
  level = 0;
  numAsteroids = 4;
  asteroids = new ArrayList<Asteroid>();
  for (int i = 0; i < numAsteroids; i++) {
    asteroids.add(new Asteroid());
  }
}

/**
 Function: collisionDetection()
 Parameters: None
 Returns: Void
 Desc: Checks if shots have hit an asteroid(s) or if the ship has collided
       with any asteroids or any shots
 */
void collisionDetect() {
  float modifiedRadius = 0;

  for (Asteroid a : asteroids) {
    // create a new temporary ArrayList to store shots that are still alive
    ArrayList<Shot> shotsAlive = new ArrayList<Shot>();

    // check size of asteroid to determine radius of clash detection
    if (a.getSize() == 0) {
      modifiedRadius = standardRadius*(asteroidScaleSize/4);
    } else if (a.getSize() == 1) {
      modifiedRadius = standardRadius*(asteroidScaleSize/2);
    } else {
      modifiedRadius = standardRadius;
    }

    // check if ship clashes with asteroid
    if (dist(a.getX(), a.getY(),
              // calculating X coordinate for the middle of the ship
              myShip.getX() - (30 * cos(shipDir)),
              // calculating Y coordinate just below the middle of the ship
              myShip.getY() - (40 * sin(shipDir))
            ) <= 50) {
      // reset ship and lose a life (if you have lives left)
      myShip.reset();
      if (lives > 0) {
        lives--;
      } else {
        gameOver = true;
      }
      a.hit();
      // play sound of explosion
      boom.play();
    }

    // check if shots clash with current asteroid, then check if shots clash
    // with ship. Add shot to a new shots array if no collision was detected
    for (Shot s : shots) {
      if (dist(a.getX(), a.getY(), s.getX(), s.getY()) <= modifiedRadius) {
        a.hit();
        // play sound of explosion
        boom.play();
      } else if (dist(s.getX(), s.getY(),
              // calculating X coordinate for the middle of the ship
              myShip.getX() - (30 * cos(shipDir)),
              // calculating Y coordinate just below the middle of the ship
              myShip.getY() - (35 * sin(shipDir))
            ) <= 25) {
        // reset ship and lose a life (if you have lives left)
        myShip.reset();
        if (lives > 0) {
          lives--;
        } else {
          gameOver = true;
        }
        // play sound of explosion
        boom.play();
      } else {
        shotsAlive.add(s);
      }

      // update shots ArrayList to only those shots that are still alive
      shots = shotsAlive;
    }
  }
}

/**
 Function: keyPressed()
 Parameters: None
 Returns: Void
 Desc: Defines actions performed when pressing specific keys
 */
void keyPressed() {
  if (key == CODED) {
    if (keyCode == UP) {
      sUP=true;
      if (!gameOver) {
        thrusterMain.setVisible(true);
      }
    }
    if (keyCode == DOWN) {
      sDOWN=true;
      if (!gameOver) {
        thrusterBack.setVisible(true);
      }
    }
    if (keyCode == RIGHT) {
      sRIGHT=true;
      if (!gameOver) {
        thrusterRight.setVisible(true);
      }
    }
    if (keyCode == LEFT) {
      sLEFT=true;
      if (!gameOver) {
        thrusterLeft.setVisible(true);
      }
    }
  }
  if (key == ' ' && !gameOver) { // fire a shot
    shipShoot.setVisible(true);
    shots.add(new Shot());
    // play sound of firing
    pew.play();
  }
  if (key == 'n' && gameOver) {
    newGame();
  }
}

/**
 Function: keyReleased()
 Parameters: None
 Returns: Void
 Desc: Defines actions performed when releasing specific keys
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
  shipBody.fill(#8E97CB);
  shipBody.noStroke();
  shipBody.vertex(0, 0);
  shipBody.vertex(15, 50);
  shipBody.vertex(0, 40);
  shipBody.vertex(-15, 50);
  shipBody.endShape(CLOSE);

  // tail of ship
  shipTail = createShape();
  shipTail.beginShape();
  shipTail.fill(#F7D170);
  shipTail.noStroke();
  shipTail.vertex(0, 41);
  shipTail.vertex(25, 60);
  shipTail.vertex(0, 50);
  shipTail.vertex(-25, 60);
  shipTail.endShape(CLOSE);

  // cockpit of ship
  shipCockpit = createShape();
  shipCockpit.beginShape();
  shipCockpit.fill(#eeeeee);
  shipCockpit.stroke(#333333);
  shipCockpit.strokeWeight(1);
  shipCockpit.vertex(0, 15);
  shipCockpit.vertex(5, 30);
  shipCockpit.vertex(0, 32);
  shipCockpit.vertex(-5, 30);
  shipCockpit.endShape(CLOSE);

  // flash blast of ship shooting
  shipShoot = createShape();
  shipShoot.beginShape();
  shipShoot.setVisible(false);
  shipShoot.fill(253, 208, 35);
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
  thrusterShape = createShape(GROUP); // Create grouped shape for the thrusters

  // main thruster of ship
  thrusterMain = createShape();
  thrusterMain.beginShape();
  thrusterMain.setVisible(false);
  thrusterMain.fill(235, 235, 0);
  thrusterMain.stroke(255, 0, 0);
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
  thrusterBack.fill(235, 235, 0);
  thrusterBack.stroke(255, 0, 0);
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
  thrusterLeft.fill(235, 235, 0);
  thrusterLeft.stroke(255, 0, 0);
  thrusterLeft.strokeWeight(1);
  thrusterLeft.vertex(-10, 36);
  thrusterLeft.vertex(-22, 40);
  thrusterLeft.vertex(-10, 46);
  thrusterLeft.endShape(CLOSE);

  // right turn thruster of ship
  thrusterRight= createShape();
  thrusterRight.beginShape();
  thrusterRight.setVisible(false);
  thrusterRight.fill(235, 235, 0);
  thrusterRight.stroke(255, 0, 0);
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
  result.stroke(#333333);
  result.fill(#555352);
  result.strokeWeight(3);
  for (float a = -PI; a < 3.2; a += 0.16) {
    float r = random(30, 35);
    result.vertex(r*cos(a), r*sin(a));
  }
  result.endShape();
  result.scale(percentageSize);

  return result;
}


class Asteroid {
  PVector location;
  PVector velocity;
  int astSize = 2; // defines default asteroid size

  /**
   Function Asteroid()
   Parameters: None
   Returns: Void
   Desc: Constructor for an asteroid object
   */
  Asteroid() {
    // randomly assign location
    location = new PVector(random(width), random(height));

    // ensure that no asteroids are created sitting on top of the new ship.
    while (
      (location.x > myShip.getX() - 40) && (location.x < myShip.getX() + 40) ||
      (location.y > myShip.getY() - 40) && (location.y > myShip.getY() + 40)) {
      location = new PVector(random(width), random(height));
    }

    // define velocity using random direction
    velocity = new PVector(cos(radians(random(360))),
      sin(radians(random(360))));
  }

  /**
   Function getX()
   Parameters: None
   Returns: Float of asteroid's X coordinate
   Desc: Returns the current X coordinate of the asteroid
   */
  float getX() {
    return location.x;
  }

  /**
   Function getY()
   Parameters: None
   Returns: Float of asteroid's Y coordinate
   Desc: Returns the current Y coordinate of the asteroid
   */
  float getY() {
    return location.y;
  }

  /**
   Function getSize()
   Parameters: None
   Returns: Int of asteroid's size field
   Desc: Returns the current size of the asteroid
   */
  int getSize() {
    return astSize;
  }

  /**
   Function update()
   Parameters: None
   Returns: Void
   Desc: Calculates the new location of the asteroid after adding velocity
   */
  void update() {
    if (!gameOver) {
      // normalize velocity to standardize speed
      velocity.normalize();

      // update location by applying velocity to current location
      location.add(velocity);
    }
  }

  /**
   Function hit()
   Parameters: None
   Returns: Void
   Desc: Applies points to the score based on the asteroids size and then
         decrements the asteroid's size value
   */
  void hit() {
    int points;
    // big asteroids worth 20, medium worth 50, small worth 100
    if (astSize == 2) {
      points = 20;
    } else if (astSize == 1) {
      points = 50;
    } else {
      points = 100;
    }
    currentScore += points;
    if (currentScore > lifeTarget) {
      lives++;
      lifeTarget += 10000;
    }
    astSize--;
  }

  /**
   Function display()
   Parameters: None
   Returns: Void
   Desc: Draws the asteroid based on it's current location
   */
  void display() {
    pushMatrix();
    translate(location.x, location.y);
    shape(astShapes[astSize]);
    popMatrix();
  }

  /**
   Function checkEdges()
   Parameters: None
   Returns: Void
   Desc: Checks if the asteroid has gone beyond the edges of the display and
         wraps it around to the opposite side if so
   */
  void checkEdges() {
    // check if X coordinate is off the right or left of display
    if (location.x > width) {
      location.x = 0;
    } else if (location.x < 0) {
      location.x = width;
    }

    // check if Y coordinate is off the top or bottom of display
    if (location.y > height) {
      location.y = 0;
    } else if (location.y < 0) {
      location.y = height;
    }
  }
}


class Ship {
  PVector velocity;
  PVector location;

/**
 Function Ship()
 Parameters: None
 Returns: Void
 Desc: Constructor for a ship object
 */
  Ship() {
    // assign initial ship location
    location = new PVector(width/2, height/2);

    // define velocity using random direction
    velocity = new PVector(0, 0);
  }

  /**
   Function getX()
   Parameters: None
   Returns: Float of ship's X coordinate
   Desc: Returns the current X coordinate of the ship
   */
  float getX() {
    return location.x;
  }

  /**
   Function getY()
   Parameters: None
   Returns: Float of ship's Y coordinate
   Desc: Returns the current Y coordinate of the ship
   */
  float getY() {
    return location.y;
  }

  /**
   Function update()
   Parameters: None
   Returns: Void
   Desc: Calculates the new location of the ship after adding velocity
   */
  void update() {
    if (!gameOver) {
      velocity.limit(maxSpeed);

      // update location maxSpeedplying velocity to current location
      location.add(velocity);
    }
  }

  /**
   Function display()
   Parameters: None
   Returns: Void
   Desc: Draws the ship based on it's current location
   */
  void display() {
    pushMatrix();
    translate(location.x, location.y);
    shape(thrusterShape);
    shape(shipShape);
    popMatrix();
  }

  /**
   Function checkEdges()
   Parameters: None
   Returns: Void
   Desc: Checks if the ship has gone beyond the edges of the display and wraps
         it around to the opposite side if so
   */
  void checkEdges() {
    // check if X coordinate is off the right or left of display
    if (location.x > width) {
      location.x = 0;
    } else if (location.x < 0) {
      location.x = width;
    }

    // check if Y coordinate is off the top or bottom of display
    if (location.y > height) {
      location.y = 0;
    } else if (location.y < 0) {
      location.y =height;
    }
  }

  /**
   Function reset()
   Parameters: None
   Returns: Void
   Desc: Resets the location, velocity, the PShapes of the ship and the
         direction it is facing
   */
  void reset() {
    location = new PVector(width/2, height/2);
    velocity = new PVector(0, 0);
    thrusterShape.resetMatrix();
    shipShape.resetMatrix();
    shipDir = radians(270);
  }
}


class Shot {
  PVector location;
  PVector velocity;
  int shotTimer; // counter for how long shot persists

/**
 Function Shot()
 Parameters: None
 Returns: Void
 Desc: Constructor for a shot object
 */
  Shot() {
    // copy ship coord as intial location
    location = myShip.location.copy();

    // define velocity using random direction
    velocity = new PVector(cos(shipDir), sin(shipDir));

    // defines how long (in frames) the shot will survive
    shotTimer = 100;
  }

  /**
   Function getX()
   Parameters: None
   Returns: Float of shot's X coordinate
   Desc: Returns the current X coordinate of the shot
   */
  float getX() {
    return location.x;
  }

  /**
   Function getY()
   Parameters: None
   Returns: Float of shot's Y coordinate
   Desc: Returns the current Y coordinate of the shot
   */
  float getY() {
    return location.y;
  }

  /**
   Function update()
   Parameters: None
   Returns: Void
   Desc: Calculates the new location of the shot after adding velocity.
         Also decrements the shotTimer so the shot doesn't persist too long
   */
  void update() {
    if (!gameOver) {
      // normalize velocity to standardize speed
      // (making sure the shots are faster than the ship)
      velocity.mult(maxSpeed + 1);
      velocity.limit(maxSpeed + 1);

      // update location by applying velocity to current location
      location.add(velocity);

      shotTimer--;
    }
  }

  /**
   Function display()
   Parameters: None
   Returns: Void
   Desc: Draws the shot based on it's current location
   */
  void display() {
    stroke(125);
    strokeWeight(3);
    point(location.x, location.y);
  }

  /**
   Function checkEdges()
   Parameters: None
   Returns: Void
   Desc: Checks if the shot has gone beyond the edges of the display and wraps
         it around to the opposite side if so
   */
  void checkEdges() {
    // check if X coordinate is off the right or left of display
    if (location.x > width) {
      location.x = 0;
    } else if (location.x < 0) {
      location.x = width;
    }

    // check if Y coordinate is off the top or bottom of display
    if (location.y > height) {
      location.y = 0;
    } else if (location.y < 0) {
      location.y = height;
    }
  }
}
