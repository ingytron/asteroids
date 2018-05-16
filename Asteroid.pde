class Asteroid {
  PVector location;
  PVector velocity;
  int astSize = 2; // defines default asteroid size
  boolean hasExploded = false;

  Asteroid() {
    // randomly assign location
    location = new PVector(random(width), random(height));

    // define velocity using random direction
    velocity = new PVector(cos(radians(random(360))), sin(radians(random(360))));
  }
  
  /* int getSize(){
    return astSize;
  }*/

  void update() {
    // normalize velocity to standardize speed
    velocity.normalize();

    // update location by applying velocity to current location
    location.add(velocity);
  }

  void hit() {
    astSize--;
  }

  void display() {
    pushMatrix();
    translate(location.x, location.y);
    shape(astShapes[astSize]);
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
      location.y = height;
    }
  }
}
