let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let bulletSpeed = 20;
let width = 16;
let height = 16;
let bulletImage = new Image();
bulletImage.src = "../images/bullets.png";

let Bullet = function (props) {
  let p = props;
  this.x = p.x;
  this.y = p.y;
  this.id = Math.floor(Math.random() * 1000);
  this.width = width;
  this.height = height;
  this.speed = bulletSpeed;
  this.direction = p.direction;
  this.shooter = p.shooter;
  this.substitute = p.substitute;
  this.color = "white";
  this.Image = bulletImage;
  this.sx = 0;
  this.sy = 0;
  this.index = p.index;
  this.collisionBox = {
    x: this.x,
    y: this.y,
    xMax: this.x + this.width,
    yMax: this.y + this.height,
  };

  let label = new UsernameLabel({
    x: this.x + 10,
    y: this.y,
    value: this.id,
  });

  this.draw = function () {
    // ctx.fillStyle = this.color;
    // ctx.strokeStyle = "black";
    // ctx.lineWidth = "1px";
    // ctx.fillRect(this.x, this.y, this.width, this.height);
    // ctx.strokeRect(this.x - 1, this.y - 1, this.width + 1, this.height + 1);
    if (this.direction == "right") {
      let radgrad4 = ctx.createRadialGradient(this.x + 8, this.y + 8, 8, this.x, this.y, 32);
      radgrad4.addColorStop(0, "rgba(0, 150, 255, 0.5)");
      radgrad4.addColorStop(0.5, "rgba(0, 200, 255, 0.5)");
      radgrad4.addColorStop(1, "rgba(255, 255, 255, 0.01)");
      ctx.fillStyle = radgrad4;
      ctx.beginPath();
      ctx.moveTo(this.x + 8, this.y);
      ctx.lineTo(this.x - 20, this.y + 8);
      ctx.lineTo(this.x + 8, this.y + 16);
      ctx.fill();
    }
    if (this.direction == "up") {
      let radgrad4 = ctx.createRadialGradient(this.x + 8, this.y + 8, 8, this.x, this.y, 32);
      radgrad4.addColorStop(0, "rgba(0, 150, 255, 0.5)");
      radgrad4.addColorStop(0.5, "rgba(0, 200, 255, 0.5)");
      radgrad4.addColorStop(1, "rgba(255, 255, 255, 0.01)");
      ctx.fillStyle = radgrad4;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y + 8);
      ctx.lineTo(this.x + 8, this.y + 28);
      ctx.lineTo(this.x + 16, this.y + 8);
      ctx.fill();
    }
    if (this.direction == "left") {
      let radgrad4 = ctx.createRadialGradient(this.x + 8, this.y + 8, 8, this.x, this.y, 32);
      radgrad4.addColorStop(0, "rgba(0, 150, 255, 0.5)");
      radgrad4.addColorStop(0.5, "rgba(0, 200, 255, 0.5)");
      radgrad4.addColorStop(1, "rgba(255, 255, 255, 0.01)");
      ctx.fillStyle = radgrad4;
      ctx.beginPath();
      ctx.moveTo(this.x + 8, this.y);
      ctx.lineTo(this.x + 28, this.y + 8);
      ctx.lineTo(this.x + 8, this.y + 16);
      ctx.fill();
    }
    if (this.direction == "down") {
      let radgrad4 = ctx.createRadialGradient(this.x + 8, this.y + 8, 8, this.x, this.y, 32);
      radgrad4.addColorStop(0, "rgba(0, 150, 255, 0.5)");
      radgrad4.addColorStop(0.5, "rgba(0, 200, 255, 0.5)");
      radgrad4.addColorStop(1, "rgba(255, 255, 255, 0.01)");
      ctx.fillStyle = radgrad4;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y + 8);
      ctx.lineTo(this.x + 8, this.y - 20);
      ctx.lineTo(this.x + 16, this.y + 8);
      ctx.fill();
    }
    // ctx.fillRect(this.x - 32 + 8, this.y, 32, 4);
    // ctx.fillStyle = "rgba(0, 150, 255, 0.2)";
    // ctx.fillRect(this.x - 40 + 8, this.y + 4, 40, 8);
    // ctx.fillStyle = "rgba(0, 150, 255, 0.1)";
    // ctx.fillRect(this.x - 32 + 8, this.y + 12, 32, 4);
    ctx.drawImage(this.Image, this.sx, this.sy, 16, 16, this.x, this.y, 16, 16);
    // label.draw();
  };

  this.move = function () {
    if (this.direction === "up") {
      // this.sx += 16;
      this.y -= this.speed;
    }
    if (this.direction === "left") {
      // this.sx += 16;
      this.x -= this.speed;
    }
    if (this.direction === "down") {
      // this.sx += 16;
      this.y += this.speed;
    }
    if (this.direction === "right") {
      // this.sx += 16;
      this.x += this.speed;
    }
    this.update();
    this.draw();
  };

  // this.resetSx = function () {
  //   if (this.sx >= 32) {
  //     this.sx = 0;
  //   }
  // };

  this.erase = function () {
    ctx.clearRect(this.x, this.y, this.width, this.height);
  };

  this.setValues = function (x, y, substitute, id, direction) {
    this.x = x;
    this.y = y;
    this.substitute = substitute;
    this.id = id;
    this.direction = direction;
    // console.log(`x: ${x}, y: ${y}`);
  };

  this.update = function () {
    this.collisionBox = {
      x: this.x,
      y: this.y,
      xMax: this.x + this.width,
      yMax: this.y + this.height,
    };
    label.x = this.x;
    label.y = this.y;
    // this.resetSx();
  };
};

let UsernameLabel = function (props) {
  let p = props;
  this.x = p.x;
  this.y = p.y;
  this.value = p.value;

  this.draw = function () {
    ctx.textAlign = "left";
    ctx.font = "15px courier";
    ctx.fillStyle = "red";
    ctx.fillText(this.value, this.x, this.y);
  };
};

export default Bullet;
