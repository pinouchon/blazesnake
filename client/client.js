Accounts.ui.config({ passwordSignupFields: 'USERNAME_ONLY' });

// counter starts at 0
Session.setDefault("counter", 0);

//  Template.hello.helpers({
//    counter: function () {
//      return Session.get("counter");
//    }
//  });

//  Template.hello.events({
//    'click button': function () {
//      // increment the counter when button is clicked
//      Session.set("counter", Session.get("counter") + 1);
//    }
//  });
Template.map.helpers({
  tiles: function () {
    return Map.findOne() && Map.findOne().tiles;
  },

//    getColor: function () {
//      return ({null: '-', red: 'r'})[this && this.color]
//    },
  getColor: function () {
//      var user = this.userId && Meteor.users.findOne({_id: this.userId});
//      console.log('user...', user, this.userId);
//      var color = user && user.profile.playerId;
    if (this.playerId == -1) return 'F5F5F5';
    return ['F00', '0F0', '00F', 'FF0', '0FF', 'F0F', '700', '070', '007', '770', '707', '777'][this.playerId] || '000';
  }
});

Template.resetButton.events({
  'click .reset': function(e) {
    e.preventDefault();
    Meteor.call('reset');
  }
});