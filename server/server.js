Meteor.methods({
  reset: function () {
    console.log('reset');
    // map
    if (Tile.collection.find().count() == 0) {
      Tile.prototype.each(function (i, j) {
        Tile.collection.upsert({i: i, j: j}, {i: i, j: j});
      });
    }
    Tile.collection.update({}, {$set: new Tile()}, {multi: true});
    //players
    Meteor.users.find().forEach(function (u) {
      //console.log('each', p._id);
      Meteor.users.update({_id: u._id}, {$set: {profile: new Player({playerId: u.profile.playerId})}});
      Tile.collection.update({i: 0, j: u.profile.playerId}, {$set: new Tile({playerId: u.profile.playerId})});
    });
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
    var n = 0;
    while (Meteor.users.find({
      'profile.playerId': n,
      _id: {$ne: user._id},
      'status.online': true}).count() != 0) {
      n++;
    }

    Meteor.users.update({_id: user._id}, {$set: {profile: new Player({playerId: n})}});
    Tile.collection.update({i: 0, j: n}, {$set: new Tile({playerId: n})});
  },
  removed: function (user) {
    //console.log('offline');
    Meteor.users.update({_id: user._id}, {$set: {'profile.playerId': null}});
    Tile.collection.update({i: 0, j: user.profile.playerId}, {$set: new Tile()});
  }
});

Meteor.startup(function () {
  console.log('startup');
  //Tile.collection.update({i: 0, j: 0}, {'tile.playerId': 1});

  var step = 0;
  var tick = function () {
    console.log('tick', step);

    //Tile.collection.update({ttl: {$gt: 0}}, {$inc: {ttl: -1}});
    Tile.collection.find({ttl: {$gt: 0}}).forEach(function (t) {
      Tile.collection.update({_id: t._id}, {$set: {ttl: Math.max(t.ttl - 1, 0)}});
    });

    //Tile.collection.update({ttl: 0, playerId: {$gte: 0}}, {$set: {playerId:-1}});
    Tile.collection.find({ttl: 0, playerId: {$gte: 0}}).forEach(function (t) {
      Tile.collection.update({_id: t._id}, {$set: {playerId: -1}});
    });

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
      Tile.collection.update({i: newY, j: newX}, {$set: new Tile({playerId: u.profile.playerId})});

    });
    step++;
  };

  Meteor.setInterval(tick, 100);
  // code to run on server at startup
});