MAP_SIZE = 30;
SNAKE_LEN = 5;

Game = function () {

};

///////////////////////////////////////////////////////////////////////////////// TILE
Tile = function (options) {
  options = options || {};
  var emptyTile = options.playerId == undefined;
  this.playerId = emptyTile ? -1 : options.playerId;
  this.ttl = emptyTile ? 0 : SNAKE_LEN;
  this.food = options.food || null;
};

Tile.prototype = {
  each: function (callback) {
    var i, j;
    for (i = 0; i < MAP_SIZE; i++) {
      for (j = 0; j < MAP_SIZE; j++) {
        callback(i, j)
      }
    }
  },
  func2: function () {
    console.log('func2');
  }
};

Tile.collection = new Meteor.Collection('tile', function() {
  return Tile.collection.find().sort({i: 1, j: 1});
});

/////////////////////////////////////////////////////////////////////////////////// PLAYER
Player = function(options) {
  options = options || {};
  this.playerId = options.playerId;
  this.direction = options.direction || [1, 0];
  this.position = [0, options.playerId];
  //this.position = options.position || [MAP_SIZE / options.playerId, MAP_SIZE % options.playerId];
  this.frozenFor = options.frozenFor || 1;
  this.score = options.score || 0;

};