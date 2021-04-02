let express = require("express");
let app = express();
let fs = require("fs");
let server = require("http").createServer(app);
let io = require("socket.io")(server);
let mongoose = require("mongoose");
let PlayerModel = require("./Server/Schemas/PlayerModel");
let ProgressModel = require("./Server/Schemas/ProgressSchema");
let WorldModel = require("./Server/Schemas/WorldSchema");
let nodemailer = require("nodemailer");
let url = require("url");
let fetch = require("node-fetch");
let MONGODB_URI =
  "mongodb+srv://123om123:crbBhQirzfyonefb@cluster0.c3yq9.mongodb.net/test?retryWrites=true&w=majority";
let options = {
  server: {
    socketOptions: {
      socketTimeoutMS: 100000,
      connectTimeoutMS: 100000,
    },
  },
};
let adminPanel;

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("Mongoose is connected");
});

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/warmap", function (req, res) {
  let worldName = url.parse(req.url, true).query.worldName;
  res.sendFile(__dirname + `/src/Assets/${worldName}/Maps/test-small.json`);
});

app.get("/objects", function (req, res) {
  let worldName = url.parse(req.url, true).query.worldName;
  res.sendFile(__dirname + `/src/Assets/${worldName}/Objects/objects.json`);
});

app.use("/dist", express.static(__dirname + "/dist"));
app.use("/admin", express.static(__dirname + "/src/Admin.html"));
app.use("/admin.js", express.static(__dirname + "/src/admin.js"));
app.use("/images", express.static(__dirname + "/images"));
app.use("/objectImageFiles", (req, res) => {
  let worldName = url.parse(req.url, true).query.worldName;
  express.static(__dirname + `/src/Assets/${worldName}/Object_Image_Files`);
});
app.use("/node_modules", express.static(__dirname + "/node_modules"));
app.use("/style.css", express.static(__dirname + "/style.css"));
app.use("/adminStyle.css", express.static(__dirname + "/adminStyle.css"));

server.listen(3000);
PlayerModel.updateMany({ LoggedIn: true }, { $set: { LoggedIn: false } }).then((res) => {
  if (res) {
    console.log("all players logged out");
  }
  if (!res) {
    console.log("Could not update");
  }
});
console.log("Server listening on port 3000");

let socketList = [];
let playerList = [];

let Player = function () {
  this.id = Math.floor(10000 + Math.random() * 90000);
  this.hp = 100;
  this.maxHp = 100;
  this.speed = 0.07;
  this.maxSpeed = 0.09;
  this.bulletList = [];
  this.ammoList = [];
  this.movement = {
    forward: false,
    left: false,
    backwards: false,
    right: false,
  };

  this.attack = {
    shoot: false,
  };

  this.shoot = function () {
    socket.emit("shoot");
  };
};

let sendVerificationCode = function (email, code, username) {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "omihridesh@gmail.com",
      pass: "1hggtn2aq123edsMI.",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  let mailOptions = {
    from: "War",
    to: email,
    subject: "Here is your Verification Code for War",
    html: `<p>Your verification for the username "${username.toString()}" code is:</p><span style="font-size: 30px; font-weight:bold;">${code.toString()}</span>`,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }

    res.render("contact", { msg: "Email has been sent" });
  });
};

let scoreArray = [];
let timeArray = [];
let current_minutes;
let current_minutes2;
let current_seconds;
let current_seconds2;
let matchIsStarting = false;
let matchIsEnding = false;
let betweenMatches = false;
let duration = 300;
let rest = 60;

let countdown = function (seconds) {
  seconds = seconds;

  function tick() {
    seconds--;
    current_minutes = parseInt(seconds / 60);
    current_seconds = seconds % 60;

    if (seconds > 0) {
      setTimeout(tick, 1000);
    } else if (seconds <= 0) {
      matchIsEnding = true;
      between(rest);
    }
  }
  tick();
};

let between = function (seconds2) {
  seconds2 = seconds2;

  function tick2() {
    seconds2--;
    current_minutes2 = parseInt(seconds2 / 60);
    current_seconds2 = seconds2 % 60;
    if (seconds2 > 0) {
      matchIsStarting = false;
      betweenMatches = true;
      setTimeout(tick2, 1000);
    } else if (seconds2 <= 0) {
      betweenMatches = false;
      reset();
      matchIsStarting = true;
      setTimeout(function () {
        matchIsStarting = false;
      }, 10);
    }
  }
  tick2();
};

let reset = function () {
  countdown(duration);
};

countdown(duration);

let removeDupes = function (scoreArray) {
  for (let i = scoreArray.length - 1; i > 0; i--) {
    if (scoreArray.length > 1) {
      if (scoreArray[i - 1]) {
        if (scoreArray[i].username === scoreArray[i - 1].username) {
          if (scoreArray[i].score <= scoreArray[i - 1].score) {
            scoreArray.splice(i, 1);
          } else if (scoreArray[i].score >= scoreArray[i - 1].score) {
            scoreArray.splice(i - 1, 1);
          }
        }
      }
    }
  }
};

let removeDupes2 = function (arr) {
  return [...new Set(arr)];
};

let sortArray = function (scoreArray) {
  scoreArray.sort((a, b) => b.score - a.score);
};

let worldArray = [{ name: "starting world", listOfPlayers: [] }];

let findWorldPlayerIsIn = function (id) {
  let socketId = id;
  let res;
  for (let i = 0; i < worldArray.length; i++) {
    let world = worldArray[i];
    if (
      world.listOfPlayers.findIndex((el) => {
        return el.socketId == socketId;
      })
    ) {
      res = i;
    }
  }
  return res;
};

io.on("connection", function (socket) {
  console.log(socket.id + " joined the server on " + new Date().toLocaleString());
  io.emit("world data", io.sockets.adapter.rooms, playerList);

  socket.on("Sign up attempt", function (signUpInfo) {
    let playerData = {
      ID: Math.floor(Math.random() * 1000000),
      LoggedIn: false,
      Username: signUpInfo.username,
      Email: signUpInfo.email,
      Password: signUpInfo.password,
      Code: Math.floor(Math.random() * 1000000),
      Verified: false,
      IP: null,
      Geolocation: {},
      Health: 100,
      Score: 0,
      Wins: 0,
      Losses: 0,
      Ties: 0,
      Bullets: 0,
    };

    let progressData = {
      Username: signUpInfo.username,
      Email: signUpInfo.email,
      DatesWon: [],
    };

    PlayerModel.findOne({ Username: signUpInfo.username }, async (err, res) => {
      if (res) {
        console.log("SIGN UP FAILED: Player with this username already exists");
        socket.emit("Player with this username already exists");
      }
      if (!res) {
        await PlayerModel.findOne({ Username: signUpInfo.username, Email: signUpInfo.email }, (err, res) => {
          if (res) {
            console.log("SIGN UP FAILED: Player with this email already exists");
            socket.emit("Player with this email already exists");
          }
          if (!res) {
            let newPlayerModel = new PlayerModel(playerData);
            let newProgressModel = new ProgressModel(progressData);
            newPlayerModel.save((err) => {
              if (err) {
                console.error(err);
              } else {
                socket.emit("Sign up successful");
                sendVerificationCode(playerData.Email, playerData.Code, playerData.Username);
                for (let i in playerList) {
                  if (playerList[i].id == socket.id) {
                    playerList[i].username = playerData.Username;
                  }
                }
              }
            });
            newProgressModel.save((err) => {
              if (err) {
                console.error(err);
              } else {
                console.log("progress for this account has been created");
              }
            });
          }
          if (err) {
            console.error(err);
          }
        });
      }
      if (err) {
        console.error(err);
      }
    });
  });

  socket.on("Log in attempt", function (logInInfo) {
    // console.log(new Date().toLocaleString(), "1111");
    PlayerModel.findOne({ Username: logInInfo.username }, (err, res) => {
      // console.log(new Date().toLocaleString(), "2222");
      if (res) {
        // console.log(new Date().toLocaleString(), "3333");
        if (res.checkPassword(logInInfo.password)) {
          console.log("password is correct", new Date().toLocaleString());
          if (res.checkVerification()) {
            console.log("account is verified", new Date().toLocaleString());
            if (!res.checkLoggedIn()) {
              console.log("account is not logged in", new Date().toLocaleString());
              socket.leaveAll();
              socket.join(worldArray[0].name);
              console.log(io.sockets.adapter.rooms);
              socket.emit("Log in successful");
              worldArray[0].listOfPlayers.push(socket.id);
              for (let i in playerList) {
                if (playerList[i].id == socket.id) {
                  playerList[i].username = logInInfo.username;
                }
              }
              PlayerModel.updateOne(
                {
                  Username: logInInfo.username,
                  Password: logInInfo.password,
                  LoggedIn: false,
                  Verified: true,
                },
                { $set: { LoggedIn: true } },
                { upsert: false }
              ).then((res) => {
                if (res) {
                }
              });
            } else if (res.checkLoggedIn()) {
              socket.emit("This player is already logged in");
            }
          } else if (!res.checkVerification()) {
            socket.emit("Account needs verification");
          }
        } else if (!res.checkPassword(logInInfo.password)) {
          socket.emit("Wrong password");
        }
      }
      if (!res) {
        socket.emit("No player exists with that username");
      }
      if (err) {
        console.error(err);
      }
    });
  });

  socket.on("Verification code", function (data) {
    PlayerModel.findOne({ Code: data.code, Username: data.username, Verified: false }, async (err, res) => {
      if (res) {
        await PlayerModel.updateOne(
          { Username: data.username },
          { $set: { Verified: true } },
          { upsert: false }
        ).then((res) => {
          if (res) {
            console.log(res);
          }
        });
        socket.emit("You have been verified");
      }
      if (!res) {
        socket.emit("Wrong verification code");
      }
      if (err) {
        console.error(err);
      }
    });
  });

  socket.on("I wish to exist", function (player) {
    let newPlayer = new Player();

    playerList.push({
      player: newPlayer,
      id: socket.id,
      username: null,
      score: 0,
    });

    socketList.push({
      socketId: socket.id,
      id: player.id,
    });

    socket.broadcast.emit("New connection", { player: player, connector: socket.id });
  });

  socket.on("updated player info", function (playerInfo) {
    socket.to(worldArray[findWorldPlayerIsIn(socket.id)].name).emit("players updated info", playerInfo);
    PlayerModel.updateOne(
      { Username: playerInfo.username },
      { $set: { Health: playerInfo.health, Score: playerInfo.score, Bullets: playerInfo.bulletList } },
      { upsert: false }
    ).then((res) => {});
  });

  socket.on("updated bullet info", function (bulletInfo) {
    socket.to(worldArray[findWorldPlayerIsIn(socket.id)].name).emit("bullets updated info", bulletInfo);
  });

  socket.on("me", function (data) {
    io.to(data.connector).emit("other player", data.me);
  });

  socket.on("player health", function (health, username, id) {
    socket.to(worldArray[findWorldPlayerIsIn(socket.id)].name).emit("updated player health", health, id);
    PlayerModel.updateOne(
      { Username: username },
      { $set: { Health: health } },
      { upsert: false }
    ).then((res) => {});
  });

  socket.on("Player health", function (data) {
    socket
      .to(worldArray[findWorldPlayerIsIn(socket.id)].name)
      .emit("updated player health", data.health, data.id);
    PlayerModel.updateOne(
      { Username: data.username },
      { $set: { Health: data.health } },
      { upsert: false }
    ).then((res) => {});
  });

  socket.on("score went up", function (score, username) {
    socket
      .to(worldArray[findWorldPlayerIsIn(socket.id)].name)
      .emit("updated player score", username, score + 1);
    scoreArray.push({ username: username, score: score + 1 });
    removeDupes(scoreArray);
    sortArray(scoreArray);
    removeDupes(scoreArray);
    sortArray(scoreArray);
    PlayerModel.updateOne(
      { Username: username },
      { $set: { Score: score + 1 } },
      { upsert: false }
    ).then((res) => {});
  });

  socket.on("IP", function (data) {
    fetch(
      `http://ip-api.com/json/${data.ip}?fields=status,data,continent,continentCode,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,offset,currency,isp,org,as,asname,reverse,mobile,proxy,hosting,query`
    )
      .then((results) => results.json())
      .then(function (res) {
        PlayerModel.updateOne({ Username: data.username }, { $set: { IP: data.ip, Geolocation: res } }).then(
          (res) => {
            if (res) {
            }
          }
        );
      });
  });

  socket.on("can i have the leaderboard values", function () {
    socket.emit("you already have them");
  });

  socket.on("send past winners", function () {
    ProgressModel.find({}, (err, res) => {
      if (res) {
        for (let i in res) {
          let arr = res[i];
          if (arr.DatesWon.length > 0) {
            console.log("sending");
            socket.emit("Past winners", removeDupes2(arr.DatesWon));
          }
        }
      }
      if (err) {
        console.error(err);
      }
    });
  });

  socket.on("gimme all the data", function () {
    adminPanel = socket;
    socket.join(worldArray[0].name);
    worldArray[0].listOfPlayers.push(socket.id);

    PlayerModel.find({}, (err, res) => {
      if (res) {
        socket.emit("Here is the data", res);
      }
      if (!res) {
        console.log("What data?");
      }
      if (err) {
        console.error(err);
      }
    });
  });

  socket.on("show preview", function (data) {
    if (data) {
      console.log(data.uploadMapInput.fileInformation[0]);
      let body = data;
      let worldName = body.worldNameInput;
      if (fs.existsSync(`./src/Assets/${worldName}`)) {
        socket.emit("world already exists");
      } else {
        fs.mkdir(`./src/Assets/${worldName}`, { recursive: false }, (err) => {
          if (err) {
            console.error(err);
          } else {
            fs.mkdir(`./src/Assets/${worldName}/Maps`, { recursive: false }, (err) => {
              if (err) {
                console.error(err);
              }
            });
            fs.mkdir(`./src/Assets/${worldName}/Objects`, { recursive: false }, (err) => {
              if (err) {
                console.error(err);
              }
            });
            fs.mkdir(`./src/Assets/${worldName}/Object_Image_Files`, { recursive: false }, (err) => {
              if (err) {
                console.error(err);
              }
            });
            console.log(`Folder for world: ${worldName} created`);

            let mapFile = body.uploadMapInput.fileText;
            let mapFileName = body.uploadMapInput.fileInformation[0].name;
            let objectFile = body.mapObjectFilesInput.fileText;
            let objectFileName = body.mapObjectFilesInput.fileInformation[0].name;
            let objectImageFiles;
            let objectImageFilesName;
            for (let i = 0; i < body.mapObjectImageFilesInput.fileText.length; i++) {
              let image = body.mapObjectImageFilesInput.fileText[i];
              let data = image.replace(/^data:image\/\w+;base64,/, "");
              let buf = Buffer.from(data, "base64");
              objectImageFiles = buf;
              objectImageFilesName = body.mapObjectImageFilesInput.fileInformation[i].name;
              fs.writeFileSync(
                __dirname + `/src/Assets/${worldName}/Object_Image_Files/${objectImageFilesName}`,
                objectImageFiles,
                (err) => {
                  if (err) {
                    console.error(err);
                  } else {
                    console.log("File created");
                  }
                }
              );
            }
            fs.writeFileSync(`./src/Assets/${worldName}/Maps/${mapFileName}`, mapFile, (err) => {
              if (err) {
                console.error(err);
              } else {
                console.log("File created");
              }
            });
            fs.writeFileSync(`./src/Assets/${worldName}/Objects/${objectFileName}`, objectFile, (err) => {
              if (err) {
                console.error(err);
              } else {
                console.log("File created");
              }
            });
          }
        });
      }
      // socket.emit("uploaded files for preview");
    }
  });

  socket.on("create new world", function (name, mapFile) {
    if (name) {
      let worldName = `${name} + ${worldArray.length}`;
      let id = socket.id;
      socket.to(worldArray[findWorldPlayerIsIn(socket.id)].name).emit("someone disconnected", id, "world");
      worldArray[findWorldPlayerIsIn(id)].listOfPlayers.splice(
        worldArray[findWorldPlayerIsIn(id)].listOfPlayers.findIndex((el) => {
          return el == id;
        }),
        1
      );
      adminPanel.join(worldArray[findWorldPlayerIsIn(socket.id)].name);
      socket.leaveAll();
      adminPanel.join(worldName);
      socket.join(worldName);
      worldArray.push({ name: worldName, listOfPlayers: [] });
      worldArray[
        worldArray.findIndex((el) => {
          return el.name == worldName;
        })
      ].listOfPlayers.push(id);
      console.log(io.sockets.adapter.rooms);
      socket.emit("world created");
    } else {
      socket.emit("needs name");
    }
  });

  socket.on("join this world", function (name) {
    name = name.toString().replace("_", " ");
    let worldName = name;
    let id = socket.id;
    socket.to(worldArray[findWorldPlayerIsIn(socket.id)].name).emit("someone disconnected", id);
    worldArray[findWorldPlayerIsIn(id)].listOfPlayers.splice(
      worldArray[findWorldPlayerIsIn(id)].listOfPlayers.findIndex((el) => {
        return el == id;
      }),
      1
    );
    adminPanel.join(worldArray[findWorldPlayerIsIn(socket.id)].name);
    socket.leaveAll();
    adminPanel.join(worldName);
    socket.join(worldName);
    worldArray.push({ name: worldName, listOfPlayers: [] });
    worldArray[
      worldArray.findIndex((el) => {
        return el.name == worldName;
      })
    ].listOfPlayers.push(id);
    console.log(io.sockets.adapter.rooms);
    socket.emit("joined world");
  });

  socket.on("disconnecting", function () {
    let id = socket.id;
    let worldPlayerIsIn = worldArray[findWorldPlayerIsIn(id)];
    console.log(worldArray);
    worldPlayerIsIn.listOfPlayers.splice(
      worldPlayerIsIn.listOfPlayers.findIndex((el) => {
        return el == id;
      }),
      1
    );
  });

  socket.on("disconnect", function () {
    console.log(socket.id + " left the server on " + new Date().toLocaleString());
    for (let i in playerList) {
      if (playerList[i].id == socket.id) {
        let player = playerList[i];
        PlayerModel.updateOne({ Username: player.username }, { $set: { LoggedIn: false } }).then((res) => {
          if (res) {
            console.log(`logged ${player.username} out`);
          }
          if (!res) {
            console.log("could not log player out");
          }
        });
        playerList.splice(i, 1);
      }
    }

    for (let i in socketList) {
      if (socketList[i].socketId == socket.id) {
        let id = socketList[i].id;
        socketList.splice(i, 1);
        socket.to(worldArray[findWorldPlayerIsIn(socket.id)].name).emit("someone disconnected", id, "server");
      }
    }
    socket.disconnect(true);
  });
});

setInterval(async () => {
  if (matchIsStarting == true) {
    io.emit("Match starting");
  }

  if (betweenMatches == false) {
    io.emit("current time", {
      minutes: current_minutes,
      seconds: current_seconds,
    });
  }

  if (betweenMatches == true) {
    io.emit("current time2", {
      minutes: current_minutes2,
      seconds: current_seconds2,
    });
  }

  if (matchIsEnding == true) {
    console.log("match finished");
    matchIsEnding = false;
    betweenMatches = true;
    io.emit("Match finished");
    console.log(new Date().toLocaleString(), "1");
    if (scoreArray[0]) {
      console.log(new Date().toLocaleString(), "2");
      io.emit("leaderboard scores", scoreArray);
      if (scoreArray[0].score !== 0) {
        console.log(new Date().toLocaleString(), "3");
        timeArray = { username: scoreArray[0].username, score: scoreArray[0].score, date: new Date() };
        io.emit("new winner", timeArray);
        await ProgressModel.findOne({ Username: timeArray.username }, async (err, res) => {
          if (res) {
            res.DatesWon.push(timeArray);
            console.log(new Date().toLocaleString(), "4");
            await ProgressModel.updateOne(
              { Username: timeArray.username },
              { $set: { DatesWon: res.DatesWon } }
            ).then((res) => {
              if (res) {
                console.log(new Date().toLocaleString(), "5");
              }
            });
          } else if (!res) {
            console.log("no progress document exists with this username");
          }
          if (err) {
            console.error(err);
          } else if (!res || !err) {
            console.log("no return");
          }
        });
      } else if (scoreArray[0].score == 0) {
        console.log("no winners");
      }
    } else if (!scoreArray[0]) {
      console.log("scoreArray[0] is not defined");
    }

    for (let i in scoreArray) {
      let arr = scoreArray[i];
      if (i != 0) {
        PlayerModel.updateMany(
          { Verified: true, LoggedIn: true, Username: arr.username },
          { $inc: { Losses: 1 } }
        ).then((res) => {
          if (res) {
            console.log("updated losses");
          } else if (!res) {
            console.error("could not update the losses");
          }
        });
      }
    }
    PlayerModel.updateMany({ Verified: true }, { $set: { Score: 0, HP: 100 } }).then((res) => {
      if (res) {
        console.log("reset scores and hp");
      } else if (!res) {
        console.error("could not reset scores and HP");
      }
    });

    if (scoreArray[0]) {
      if (scoreArray[0].score !== 0) {
        PlayerModel.updateOne(
          { Verified: true, LoggedIn: true, Username: scoreArray[0].username },
          { $inc: { Wins: 1 } }
        ).then((res) => {
          if (res) {
            console.log("incremented wins");
          } else if (!res) {
            console.error("could not increment wins");
          }
        });
      }
    }
    scoreArray = [];
    timeArray = [];
  }
}, 10);

setInterval(() => {
  io.emit("world data", io.sockets.adapter.rooms, playerList);
  if (Object.keys(io.sockets.adapter.rooms)[0] !== "starting world") {
    delete io.sockets.adapter.rooms[Object.keys(io.sockets.adapter.rooms)[0]];
  }
}, 1000);
