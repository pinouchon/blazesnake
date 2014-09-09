Accounts.ui.config({passwordSignupFields: 'USERNAME_ONLY'});

Template.map.helpers({
  tiles2d: function () {
    var tiles2d = [];
    for (var i = 0; i < MAP_SIZE; i++) {
      tiles2d[i] = Tile.collection.find({x: i},
        {sort: {x: 1, y: 1}});
    }
    return tiles2d;
  }
});

Template.map.events({
  'click .reset': function() {
    Meteor.call('reset');
  }
});

UI.registerHelper('getColor', function () {
  if (this.userId == -1) return 'F5F5F5';
  return ['F00', '0F0', '00B', 'FF0', 'F81', '070',
    '616', 'F2F', '0EE', '990',
    '177', '55F', '522'][this.userId] || '000';
});

Template.map.rendered = function () {
  $('body').on('keydown', function (e) {
    Meteor.call('keyDown', e.which);
  });
};

Template.scores.helpers({
  users: function() {
    return User.collection.find({'status.online': true},
      {sort: {score: -1}});
  }
});