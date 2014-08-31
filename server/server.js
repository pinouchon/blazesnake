
SNAKE_LEN = 5;

function Tile(options) {
  options = options || {};
  //this.user = options.user || null;
  //this.userId = options.userId || null;
  var emptyTile = options.playerId == undefined;
  this.playerId = emptyTile ? -1 : options.playerId;
  this.ttl = emptyTile ? 0 : SNAKE_LEN;
  this.food = options.food || null;

}
function Player(options) {
  options = options || {};
  this.playerId = options.playerId;
  this.direction = options.direction || [1, 0];
  this.position = [0, options.playerId];
  //this.position = options.position || [MAP_SIZE / options.playerId, MAP_SIZE % options.playerId];
  this.frozenFor = options.frozenFor || 1;
  this.score = options.score || 0;

  this.foo = function () {
    return 'foobar';
  }
}

Meteor.methods({
  reset: function () {
    //console.log('reset');
    // map
    var tiles = Map.findOne().tiles;
    for (var i = 0; i < MAP_SIZE; i++) {
      for (var j = 0; j < MAP_SIZE; j++) {
        tiles[i].row[j] = new Tile();
      }
    }

    // players
    Meteor.users.find().forEach(function (u) {
      //console.log('each', p._id);
      Meteor.users.update({_id: u._id}, {$set: {profile: new Player({playerId: u.profile.playerId})}});
      tiles[0].row[u.profile.playerId] = new Tile({playerId: u.profile.playerId});
    });
    Map.update({}, {tiles: tiles});
  },
  keyEvent: function (which) {
    //console.log('keyevent', which, this.userId);
    var positions = {37: [0, -1], 38: [-1, 0], 39: [0, 1], 40: [1, 0]};
    Meteor.users.update(
      {_id: this.userId},
      {$set: {'profile.direction': positions[which]}}
    );
  }
});

Meteor.users.find({"status.online": true}).observe({
  added: function (user) {
    //console.log('online', user._id);

    var i = 0;
    while (Meteor.users.find({
      'profile.playerId': i,
      _id: {$ne: user._id},
      'status.online': true}).count() != 0) {
      i++;
    }
    //console.log('assigning', i);

    Meteor.users.update({_id: user._id}, {$set: {profile: new Player({playerId: i})}});
    var tiles = Map.findOne().tiles;
    tiles[0].row[i] = new Tile({playerId: i});
    Map.update({}, {tiles: tiles});
  },
  removed: function (user) {
    //console.log('offline');
    Meteor.users.update({_id: user._id}, {$set: {'profile.playerId': null}});
    var tiles = Map.findOne().tiles;
    tiles[0].row[user.profile.playerId] = new Tile();
    Map.update({}, {tiles: tiles});
  }
});

var initMap = function () {
  //console.log('initMap');
  //console.log('count', Map.find().count());
  var i;
  var j;
  if (Map.find().count() == 0) {
    var tiles = [];

    for (i = 0; i < MAP_SIZE; i++) {
      tiles[i] = {row: []};
      for (j = 0; j < MAP_SIZE; j++) {
        tiles[i].row[j] = new Tile()
      }
    }
    Map.insert({tiles: tiles});
  }

  for (i = 0; i < MAP_SIZE; i++) {
    for (j = 0; j < MAP_SIZE; j++) {
      Tile2.upsert({i: i, j: j}, {tile: new Tile(), i: i, j: j});
    }
  }
};


Meteor.startup(function () {
  console.log('startup');
  Tile2.update({i: 0, j: 0}, {'tile.playerId': 1});
  initMap();
  //Map.findOne();
  return;

  var step = 0;
  var tick = function () {
    //console.log('tick', step);

    var tiles = Map.findOne().tiles;
    for (var i = 0; i < MAP_SIZE; i++) {
      for (var j = 0; j < MAP_SIZE; j++) {
        //console.log('ttl', tiles[i].row[j].ttl, tiles[i].row[j].playerId);
        var newTtl = tiles[i].row[j].ttl - 1;
        if (newTtl <= 0) {
          tiles[i].row[j] = new Tile();
        } else {
          tiles[i].row[j].ttl = newTtl;
          //tiles[i].row[j].playerId = tiles[i].row[j].playerId;
          //console.log('test', tiles[i].row[j].playerId);
        }
      }
    }
    Meteor.users.find({'status.online': true}).forEach(function (u) {
      //console.log('updating', u.username, u.profile.direction, u.profile.position, u.profile.playerId);
      var newY = u.profile.position[0] + 1 * u.profile.direction[0];
      var newX = u.profile.position[1] + 1 * u.profile.direction[1];
      if (newY < 0 || newY >= MAP_SIZE ||
        newX < 0 || newX >= MAP_SIZE) {
        //console.log('out of bounds', newY, newX);
        return;
        newY = Math.round(options.playerId / MAP_SIZE);
        newX = options.playerId % MAP_SIZE;
      }
      Meteor.users.update({_id: u._id}, {$set: {'profile.position': [newY, newX]}});
      //console.log('updating tile', [newY, newX], 'with', u.profile.playerId);
      tiles[newY].row[newX] = new Tile({playerId: u.profile.playerId});

    });
    Map.update({}, {tiles: tiles});

    step++;
  };

  Meteor.setInterval(tick, 200);
  // code to run on server at startup
});