import Player from "./Player";
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let newPlayer;
let w = window.innerWidth;
let h = window.innerHeight;
let mainPlayer;
let x1;
let y1;
let xMax1;
let yMax1;
let x2;
let y2;
let xMax2;
let yMax2;

export let createPlayer = function (type) {
  type == "main"
    ? (newPlayer = new Player({
        username: "",
        email: "null",
        x: w / 2,
        y: w / 2,
        type: type,
        health: 100,
        keys: ["w", "a", "s", "d", " ", "r"],
      }))
    : type == "other"
    ? (newPlayer = new Player({
        username: "",
        email: "null",
        x: w / 2,
        y: h / 2,
        health: 100,
        type: type,
        keys: ["w", "a", "s", "d", " ", "r"],
      }))
    : null;
  newPlayer.draw();
  mainPlayer = newPlayer;
  return newPlayer;
};

export let basename = function (path) {
  return path.split("/").reverse()[0];
};

export function roundRect(ctx, x, y, width, height, radius, fill, stroke, fillcolor, strokecolor) {
  if (typeof stroke === "undefined") {
    stroke = true;
  }
  if (typeof radius === "undefined") {
    radius = 5;
  }
  if (typeof radius === "number") {
    radius = { tl: radius.tl, tr: radius.tr, br: radius.br, bl: radius.bl };
  } else {
    let defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
    for (let side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side];
    }
  }
  ctx.fillStyle = fillcolor;
  ctx.strokeStyle = strokecolor;
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  ctx.fillStyle = fillcolor;
  ctx.lineWidth = "1px";
  ctx.strokeStyle = strokecolor;
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }
}

export let removeDupes = function (arr) {
  // let uniq = [...new Set(arr)];
  // console.log(uniq);
  return [...new Set(arr)];
};

export let sortArray = async function (arr, fallback) {
  await arr.sort((a, b) => {
    if (fallback) {
      if (a.score !== b.score) {
        return b.score - a.score;
      } else if (a.score == b.score) {
        if (a.username < b.username) {
          return -1;
        }
        if (a.username > b.username) {
          return 1;
        }
        return 0;
      }
    } else if (!fallback) {
      return b.score - a.score;
    }
  });
};

export let sortArrayByDate = async function (arr) {
  await arr.sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });
};

export let actionLogic = function (Player) {
  Player.prevX = Player.x;
  Player.prevY = Player.y;
  document.onkeydown = (e) => {
    Player.prevX = Player.x;
    Player.prevY = Player.y;
    if (e.key === Player.keys[0] && !Player.collisionDirection.up) {
      Player.prevX = Player.x;
      Player.prevY = Player.y;
      Player.direction.up = true;
      Player.lastDirection = "up";
    }
    if (e.key === Player.keys[1] && !Player.collisionDirection.left) {
      Player.prevX = Player.x;
      Player.prevY = Player.y;
      Player.direction.left = true;
      Player.lastDirection = "left";
    }
    if (e.key === Player.keys[2] && !Player.collisionDirection.down) {
      Player.prevX = Player.x;
      Player.prevY = Player.y;
      Player.direction.down = true;
      Player.lastDirection = "down";
    }
    if (e.key === Player.keys[3] && !Player.collisionDirection.right) {
      Player.prevX = Player.x;
      Player.prevY = Player.y;
      Player.direction.right = true;
      Player.lastDirection = "right";
    }
    if (e.key === Player.keys[4] && !Player.reloading && Player.ammoLeft > 0) {
      Player.attacking = true;
    } else if (e.key === Player.keys[4] && !Player.reloading && Player.ammoLeft == 0) {
      Player.attacking = false;
    }
    if (e.key === Player.keys[5] && Player.ammoLeft <= 0 && !Player.reloading) {
      Player.reloading = true;
    }
  };

  document.onkeyup = (e) => {
    if (e.key === Player.keys[0]) {
      Player.direction.up = false;
      Player.sx = 0;
    }
    if (e.key === Player.keys[1]) {
      Player.direction.left = false;
      Player.sx = 0;
    }
    if (e.key === Player.keys[2]) {
      Player.direction.down = false;
      Player.sx = 0;
    }
    if (e.key === Player.keys[3]) {
      Player.direction.right = false;
      Player.sx = 0;
    }
    if (e.key === Player.keys[4]) {
      Player.attacking = false;
    }
  };

  Player.action();
};

export let runXMLHttpRequest = function (request, cb, type, route, body) {
  request.onreadystatechange = function () {
    cb(this);
  };
  request.open(type, route, true);
  request.send(body);
};

export let in_range_of_player = function (x, y, w, h, player) {
  if (player) {
    let overflow = 5;
    ctx.strokeRect(player.x - overflow, player.y - overflow, 1, 1);
    ctx.strokeRect(player.x + player.width + overflow, player.y - overflow, 1, 1);
    ctx.strokeRect(player.x - overflow, player.y + player.height + overflow, 1, 1);
    ctx.strokeRect(player.x + player.width + overflow, player.y + player.height + overflow, 1, 1);

    let playerCollision = {
      collisionBox: {
        x: player.x - overflow,
        y: player.y - overflow,
        xMax: player.x + player.width + overflow,
        yMax: player.y + player.height + overflow,
      },
    };

    let objectCollision = {
      collisionBox: {
        x: x,
        y: y,
        xMax: x + w,
        yMax: y + h,
      },
    };

    // x >= player.x - overflow &&
    // x <= player.x + player.width + overflow &&
    // y >= player.y - overflow &&
    // y <= player.y + player.height + overflow

    if (checkCollision(playerCollision, objectCollision)) {
      // ctx.strokeStyle = "red";
      // ctx.strokeRect(x1, y1, xMax1 - x1, yMax1 - y1);
      // ctx.strokeRect(x2, y2, xMax2 - x2, yMax2 - y2);
      return true;
    } else {
      // ctx.strokeStyle = "red";
      // ctx.strokeRect(x1, y1, xMax1 - x1, yMax1 - y1);
      // ctx.strokeRect(x2, y2, xMax2 - x2, yMax2 - y2);
      return false;
    }
  }
};

export let fastMap_noNull = function (arr, cb) {
  // console.log(cb);
  let i = arr.length;
  let ret = [];
  while (i--) {
    if (arr[i]) {
      // console.log("arr[i]", arr[i], "i", i);
      ret.push(cb(arr[i], i));
    }
  }
  return ret.filter((e) => {
    return e;
  });
};

export let checkCollision = function (object1, object2) {
  x1 = object1.collisionBox.x;
  y1 = object1.collisionBox.y;
  xMax1 = object1.collisionBox.xMax;
  yMax1 = object1.collisionBox.yMax;
  x2 = object2.collisionBox.x;
  y2 = object2.collisionBox.y;
  xMax2 = object2.collisionBox.xMax;
  yMax2 = object2.collisionBox.yMax;

  // ctx.strokeRect(x1, y1, xMax1 - x1, yMax1 - y1);
  // ctx.strokeRect(x2, y2, xMax2 - x2, yMax2 - y2);

  if (x1 < xMax2 && xMax1 > x2 && y1 < yMax2 && yMax1 > y2) {
    // console.log("colliding");
    return true;
  }
};

export function removeElementsByClass(className) {
  let elements = document.getElementsByClassName(className);
  while (elements.length > 0) {
    elements[0].parentNode.removeChild(elements[0]);
  }
}
