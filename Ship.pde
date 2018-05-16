class Ship {
  int astSize = 25; // defines default asteroid size
  
PVector velocity;
PVector location;

  Ship() {
    // assign initial ship location
    location = new PVector(width/2, height/2);

    // define velocity using random direction
    velocity = new PVector(0, 0);
  }

  void update() {
    velocity.limit(maxSpeed);
    
    // update location maxSpeedplying velocity to current location
    location.add(velocity);
  }

  void display() {
    pushMatrix();
    translate(location.x, location.y);
    shape(thrusterShape);
    shape(shipShape);
    popMatrix();
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
      location.y =height;
    }
  }
}
