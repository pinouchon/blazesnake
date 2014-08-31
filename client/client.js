Accounts.ui.config({ passwordSignupFields: 'USERNAME_ONLY' });

Template.map.helpers({
  tiles2d: function() {
    var arr = [];
    for (var i = 0; i < MAP_SIZE; i++) {
      arr[i] = Tile.collection.find({i: i}, {sort: {j: 1}});
    }
    return arr;
  },

  getColor: function() {
    var id = this.playerId;
    if (id == -1) return 'F5F5F5';
    return ['F00', '0F0', '00F', 'FF0', '0FF', 'F0F', '700', '070', '007', '770', '707', '777'][id] || '000';
  }
});
Template.map.rendered = function() {
  $('body').on('keydown',function(e) {
    Meteor.call('keyEvent', e.which);
  });

};

Template.resetButton.events({
  'click .reset': function (e) {
    e.preventDefault();
    Meteor.call('reset');
  }
});
