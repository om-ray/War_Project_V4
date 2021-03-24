let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let PlayerSchema = new Schema({
  ID: Number,
  LoggedIn: Boolean,
  Username: String,
  Email: String,
  Password: String,
  Code: Number,
  Verified: Boolean,
  IP: String,
  Geolocation: Object,
  Health: Number,
  Score: Number,
  Wins: Number,
  Losses: Number,
  Ties: Number,
  Bullets: Number,
  WorldsCreated: Number,
  WorldsOwned: Number,
  WorldsVisited: Number,
  CurrentWorld: String,
  Worlds: Array,
  CreatedAt: {
    type: String,
    default: new Date(),
  },
});

PlayerSchema.methods.checkPassword = function (password) {
  if (this.Password == password) {
    return true;
  } else if (this.Password !== password) {
    return false;
  }
};

PlayerSchema.methods.checkVerification = function () {
  if (this.Verified == true) {
    return true;
  } else if (this.Verified !== false) {
    return false;
  }
};

PlayerSchema.methods.checkLoggedIn = function () {
  if (this.LoggedIn == true) {
    return true;
  } else if (this.LoggedIn !== false) {
    return false;
  }
};

let PlayerModel = mongoose.model("player", PlayerSchema);

module.exports = PlayerModel;
