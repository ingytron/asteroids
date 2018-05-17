class Shot {
  PVector location;
  PVector velocity;
  int shotTimer;
  boolean hasExploded = false;

  Shot() {
    // copy ship coord as intial location
    location = myShip.location.copy();

    // define velocity using random direction
    velocity = new PVector(cos(radiansDir), sin(radiansDir));
    
    // defines how long (in frames) the shot will survive
    shotTimer = 100;
  }

  void update() {
    // normalize velocity to standardize speed
    velocity.mult(maxSpeed + 1);
    velocity.limit(maxSpeed + 1);
    
    // update location by applying velocity to current location
    location.add(velocity);

    shotTimer--;
}


  void display() {
    stroke(125);
    strokeWeight(3);
    point(location.x, location.y);
  }

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
    }  else if (location.y < 0) {
      location.y = height;
    }
  }
}
