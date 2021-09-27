class Persona {
    constructor(imgPath, text, x, y, poem) {
      this.img = loadImage(imgPath);
      this.size = 100;
      this.text = text;
      this.x = x;
      this.y = y;
      this.poem = poem;
      this.selected = false;
    }

    clicked (_x, _y) {
        if (_x > this.x && _x<this.x+this.size && _y > this.y && _y<this.y+this.size ) {
            this.selected = true;
            return true;
        }
    }
  }