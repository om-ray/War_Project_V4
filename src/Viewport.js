let Viewport = function (x, y, w, h) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;

  this.scroll = function (x, y, w, h) {
    this.x = x;
    this.y = y;
    // this.w = w;
    // this.h = h;
  };
};

export default Viewport;
