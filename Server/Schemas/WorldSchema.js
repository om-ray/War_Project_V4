let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let WorldSchema = new Schema({
  Name: String,
  NumberOfPlayers: Number,
  ListOfPlayer: Array,
  OwnedBy: String,
  MapFile: String,
  ObjectFile: String,
  CreatedAt: {
    type: String,
    default: new Date(),
  },
});

let WorldModel = mongoose.model("world", WorldSchema);

module.exports = WorldModel;
