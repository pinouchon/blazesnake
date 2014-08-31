MAP_SIZE = 30;

Map = new Meteor.Collection('map', function () {
  return Map.findOne();
});

Tile2 = new Meteor.Collection('tile2', function() {
  return Tile2.find();
});