import Bullet from "./Bullet";
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let playerSpeed = 5;
let playerDamage = 1;
let mapWidth;
let Img = {};

let Male1 = function () {
  Img.player = new Image();
  Img.player.src = "../images/Male1.png";
  Img.player.onload = () => {
    return Img.player;
  };
};

let Male2 = function () {
  Img.player = new Image();
  Img.player.src = "../images/Male2.png";
  Img.player.onload = () => {
    return Img.player;
  };
};

let Female1 = function () {
  Img.player = new Image();
  Img.player.src = "../images/Female1.png";
  Img.player.onload = () => {
    return Img.player;
  };
};

let Female2 = function () {
  Img.player = new Image();
  Img.player.src = "../images/Female2.png";
  Img.player.onload = () => {
    return Img.player;
  };
};

Img.forcefield = new Image();
Img.forcefield.src = "../images/shield_Edit.png";

Math.radians = function (degrees) {
  return (degrees * Math.PI) / 180;
};

let sprites = [Male1, Male2, Female1, Female2];
let mapJson;

let Player = function (props) {
  let p = props;
  this.id = Math.floor(Math.random() * 1000000);
  this.sprite = sprites[0]();
  this.username = p.username;
  this.email = p.email;
  this.drawn = false;
  this.type = p.type;
  this.x = p.x;
  this.y = p.y;
  this.width = 32;
  this.height = 48;
  this.speed = { left: playerSpeed, right: playerSpeed, up: playerSpeed, down: playerSpeed };
  this.health = p.health;
  this.damage = playerDamage;
  this.keys = p.keys;
  this.timesReloaded = 0;
  this.needsToReload = false;
  this.above = false;
  this.below = true;
  this.healthMax = 100;
  this.score = 0;
  this.sx = 0;
  this.sy = 0;
  this.loggedIn = false;
  this.afk = false;
  this.worldSelected = false;
  this.currentWorld;
  this.paused = false;
  this.prevX;
  this.prevY;
  this.bulletList = [];
  this.ammoLimit = 500;
  this.justRespawned = false;
  this.ammoLeft = this.ammoLimit;
  this.collisionBox = {
    x: this.x,
    y: this.y,
    xMax: this.x + this.width,
    yMax: this.y + this.height,
  };
  this.direction = {
    up: false,
    down: false,
    left: false,
    right: false,
  };
  this.collisionDirection = {
    up: false,
    down: false,
    left: false,
    right: false,
  };
  this.lastDirection = "down";
  this.attacking = false;
  this.reloading = false;

  if (this.worldSelected) {
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        mapJson = JSON.parse(this.responseText);
      }
    };
    xmlhttp.open("GET", "/warmap", true);
    xmlhttp.send(this.currentWorld);
    mapWidth = mapJson?.layers[0]?.width;
  }

  this.draw = () => {
    if (this.loggedIn == true && this.drawn == false) {
      ctx.drawImage(
        Img.player,
        this.sx,
        this.sy,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
      // if (this.loggedIn == false) {
      // ctx.drawImage(Img.forcefield, this.x - this.width / 1.4, this.y - this.height / 4, this.height + 30, this.height + 30);
      // }
      if (this.afk == true) {
        ctx.fillStyle = "black";
        ctx.font = "13px courier";
        ctx.fillText("This player is AFK", this.x - 50, this.y - 20);
        ctx.drawImage(
          Img.forcefield,
          this.x - this.width / 1.4,
          this.y - this.height / 4,
          this.height + 30,
          this.height + 30
        );
      }
      if (this.paused == true) {
        ctx.fillStyle = "black";
        ctx.font = "13px courier";
        ctx.fillText("This player is paused", this.x - 50, this.y - 20);
        ctx.drawImage(
          Img.forcefield,
          this.x - this.width / 1.4,
          this.y - this.height / 4,
          this.height + 30,
          this.height + 30
        );
      }
      for (let i in this.bulletList) {
        this.bulletList[i].move();
        this.bulletList[i].draw();
      }
      // this.drawAccesories();
      this.resetBulletlist();
      this.action();
      // this.drawn = true;
    }
  };

  this.delete = () => {
    ctx.clearRect(this.x, this.y, this.width, this.height);
  };

  this.resetSx = function () {
    if (this.sx >= 96) {
      this.sx = 0;
    }
  };

  this.drawAccesories = function () {
    let healthBar = new HealthBar({
      x: this.x - 15,
      y: this.y + 5,
      width: 15,
      value: this.health,
      thickness: 2,
    });

    let ammoBar = new AmmoBar({
      x: this.x + 45,
      y: this.y + 35,
      width: 15,
      value: this.ammoLeft,
      thickness: 2,
    });

    let score = new Score({
      x: this.x,
      y: this.y + 35,
      value: this.score,
    });

    let usernameLabel = new UsernameLabel({
      x: this.x + 5,
      y: this.y,
      value: this.username,
      main: this.type == "main" ? true : false,
    });

    let reloadState = new ReloadState({
      x: this.x - 20,
      y: this.y - 20,
      value: "",
    });

    ctx.strokeStyle = "red";
    ctx.strokeRect(
      this.collisionBox.x1,
      this.collisionBox.y1,
      this.collisionBox.xMax1 - this.collisionBox.x1,
      this.collisionBox.yMax1 - this.collisionBox.y1
    );

    healthBar.draw();
    ammoBar.draw();
    score.draw();
    usernameLabel.draw();
    if (this.reloading) {
      reloadState.value = "Reloading...";
      reloadState.draw();
    }
    if (this.ammoLeft <= 0) {
      this.attacking = false;
      reloadState.value = "Press 'r' to reload";
      reloadState.draw();
    }
  };

  this.resetBulletlist = function () {
    if (this.bulletList.length >= 500) {
      this.bulletList.splice(0, 1);
    }
  };

  this.reload = function () {
    if (this.reloading) {
      if (this.ammoLeft <= this.ammoLimit) {
        this.attacking = false;
        this.bulletList.unshift();
        this.ammoLeft += 1;
      }
      if (this.ammoLeft == this.ammoLimit) {
        this.reloading = false;
        this.timesReloaded += 1;
        this.needsToReload = false;
      }
    }
  };

  this.action = () => {
    this.prevY = this.y;
    this.prevX = this.x;
    if (this.direction.up && !this.collisionDirection.up) {
      this.sy = 144;
      this.sx += this.width;
      this.y -= this.speed.up;
      this.justRespawned = false;
      this.direction.down = false;
      // ctx.translate(0, this.speed);
    }
    if (this.direction.left && !this.collisionDirection.left) {
      this.sy = 48;
      this.sx += this.width;
      this.x -= this.speed.left;
      this.justRespawned = false;
      this.direction.right = false;
      // ctx.translate(this.speed, 0);
    }
    if (this.direction.down && !this.collisionDirection.down) {
      this.sy = 0;
      this.sx += this.width;
      this.y += this.speed.down;
      this.justRespawned = false;
      this.direction.up = false;
      // ctx.translate(0, -this.speed);
    }
    if (this.direction.right && !this.collisionDirection.right) {
      this.sy = 96;
      this.sx += this.width;
      this.x += this.speed.right;
      this.justRespawned = false;
      this.direction.left = false;
      // ctx.translate(-this.speed, 0);
    }
    // if (!this.direction.up && !this.direction.left && !this.direction.down && !this.direction.right) {
    //   // this.prevX = this.x;
    //   // this.prevY = this.y;
    // } else if (typeof this.prevX == "undefined" || typeof this.prevY == "undefined") {
    //   this.prevX = this.x;
    //   this.prevY = this.y;
    // }
    if (this.attacking && this.ammoLeft !== 0 && !this.reloading) {
      let newBullet = new Bullet({
        x: this.x + this.width / 4,
        y: this.y + this.height / 2,
        direction: this.lastDirection,
        shooter: this.id,
        substitute: false,
        index: this.bulletList.length - 1,
      });

      this.bulletList.push(newBullet);
      // newBullet.draw();
      this.ammoLeft -= 1;
    }
    this.resetSx();
    this.resetBulletlist();
    this.update();
  };

  this.respawn = function () {
    this.health = this.healthMax;
    this.x = Math.floor(Math.random() * (mapWidth * (16 * 5) - 16 * 5 * 2));
    this.y = Math.floor(Math.random() * (mapWidth * (16 * 5) - 16 * 5 * 2));
    this.direction.up = false;
    this.direction.down = false;
    this.direction.right = false;
    this.direction.left = false;
    this.justRespawned = true;
  };

  this.resetSpeed = function () {
    this.speed = { left: playerSpeed, right: playerSpeed, up: playerSpeed, down: playerSpeed };
  };

  this.update = function () {
    if (!this.x) {
      this.respawn();
    }
    if (!this.y) {
      this.respawn();
    }
    this.collisionBox = {
      x: this.x,
      y: this.y,
      xMax: this.x + this.width,
      yMax: this.y + this.height,
    };
    if (this.health <= 0) {
      this.respawn();
    }
    if (this.reloading) {
      this.reload();
    }
    if (this.ammoLeft >= this.ammoLimit) {
      this.reloading = false;
    }
    if (this.ammoLeft <= 0) {
      this.needsToReload = true;
      this.attacking = false;
    }
    if (this.below) {
      this.above = false;
    } else if (this.above) {
      this.below = false;
    }
    mapWidth = mapJson?.layers[0]?.width;
  };
};

let HealthBar = function (props) {
  let p = props;
  this.x = p.x;
  this.y = p.y;
  this.width = p.width;
  this.radius = this.width;
  this.value = p.value;
  this.thickness = p.thickness;

  this.draw = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, -Math.PI / 2, Math.radians(this.value * 3.6) - Math.PI / 2, false);
    ctx.arc(
      this.x,
      this.y,
      this.radius - this.thickness,
      Math.radians(this.value * 3.6) - Math.PI / 2,
      -Math.PI / 2,
      true
    );
    ctx.lineWidth = 1;
    ctx.fillStyle = "black";
    ctx.font = "10px courier";
    ctx.textAlign = "left";
    ctx.fillText(this.value, this.x - 9, this.y + 3);

    if (this.value >= (100 / 4) * 3) {
      ctx.fillStyle = "green";
    } else if (this.value >= (100 / 4) * 2) {
      ctx.fillStyle = "gold";
    } else if (this.value >= (100 / 4) * 1) {
      ctx.fillStyle = "orange";
    } else {
      ctx.fillStyle = "red";
    }
    ctx.closePath();
    ctx.fill();
  };
};

let AmmoBar = function (props) {
  let p = props;
  this.x = p.x;
  this.y = p.y;
  this.width = p.width;
  this.radius = this.width;
  this.value = p.value;
  this.thickness = p.thickness;

  this.draw = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, -Math.PI / 2, Math.radians(this.value * 0.72) - Math.PI / 2, false);
    ctx.arc(
      this.x,
      this.y,
      this.radius - this.thickness,
      Math.radians(this.value * 0.72) - Math.PI / 2,
      -Math.PI / 2,
      true
    );
    ctx.lineWidth = 1;
    ctx.fillStyle = "black";
    ctx.font = "10px courier";
    ctx.textAlign = "left";
    ctx.fillText(this.value, this.x - 9, this.y + 3);

    if (this.value >= (500 / 4) * 3) {
      ctx.fillStyle = "red";
    } else if (this.value >= (500 / 4) * 2) {
      ctx.fillStyle = "orange";
    } else if (this.value >= (500 / 4) * 1) {
      ctx.fillStyle = "gold";
    } else {
      ctx.fillStyle = "green";
    }
    ctx.closePath();
    ctx.fill();
  };
};

let Score = function (props) {
  let p = props;
  this.x = p.x;
  this.y = p.y;
  this.value = p.value;

  this.draw = function () {
    ctx.fillStyle = "black";
    ctx.textAlign = "right";
    ctx.font = "15px courier";
    ctx.fillText(this.value, this.x, this.y);
  };
};

let UsernameLabel = function (props) {
  let p = props;
  this.x = p.x;
  this.y = p.y;
  this.value = p.value;
  this.main = p.main;

  this.draw = function () {
    ctx.textAlign = "left";
    ctx.font = "15px courier";
    if (this.main) {
      ctx.fillStyle = "#363930";
      ctx.fillRect(this.x - 3, this.y - 15, this.value.toString().length * 11, 15);
    }
    ctx.fillStyle = this.main ? "rgb(225 103 253)" : "red";
    ctx.fillText(this.value, this.x, this.y - 3);
  };
};

let ReloadState = function (props) {
  let p = props;
  this.x = p.x;
  this.y = p.y;
  this.value = p.value;

  this.draw = function () {
    ctx.textAlign = "left";
    ctx.font = "10px courier";
    ctx.fillStyle = "rgba(255, 0, 0, 1)";
    ctx.fillText(this.value, this.x, this.y);
  };
};

export default Player;
