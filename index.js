var Hapi = require('hapi');
var server = new Hapi.Server();

server.connection({
  host: '127.0.0.1',
  port: 8000,
  routes: {cors: true}
});

var plugins = [
  {
    register: require('hapi-mongodb'),
    options: {
      "url":"mongodb://127.0.0.1:27017/punisher",
      "settings": {db: {
        "native_parser": false}}
    }
  }
];

server.register(plugins, function(err) {
  if (err) { throw err; };

  server.start(function() {
    server.log('info', 'Server running at: ' + server.info.uri);
  });
});

server.route([
  // Welcome to Punisher
  {
    method: 'GET',
    path: '/',
    handler: function(request, reply) {
      reply("Welcome to the Punisher!");
    }
  },
  // Get all punishments
  {
    method: 'GET',
    path: '/punish',
    handler: function (request, reply) {
      var db = request.server.plugins['hapi-mongodb'].db;
      db.collection('punishments').find().toArray(function(err, result){
        if (err) throw err;
        reply(result);
      });
    }
  },
  // Post a punishment
  {
    method: "POST",
    path: "/punish",
    handler: function(request, reply) {
      var newPunish =  request.payload.punish;
      var db = request.server.plugins['hapi-mongodb'].db;
      db.collection('punishments').insert( newPunish, function(err, writeResult){
        if(err) {
          reply(Hapi.error.internal('Internal MongoDB Error', err));
        } else {
          reply(writeResult);
        }
      });
    }
  },
  // Return a random punishment
  {
    method: 'GET',
      path: '/punish/random',
      handler: function (request, reply) {
      var db = request.server.plugins['hapi-mongodb'].db; 
      db.collection('punishments').find().toArray(function(err, result){
        if (err) throw err;
        var allPunish = result;
        var randomPunish = Math.floor(Math.random() * allPunish.length);
        var punishment = allPunish[randomPunish];
        reply(punishment);
      });
    }
  },
  // Return a random Victim
  {
    method: 'GET',
      path: '/punish/who',
      handler: function (request, reply) {
      var db = request.server.plugins['hapi-mongodb'].db; 
      db.collection('victims').find().toArray(function(err, result){
        if (err) throw err;
        var allVictims = result;
        var randomVictim = Math.floor(Math.random() * allVictims.length);
        var victim = allVictims[randomVictim];
        reply(victim);
      });
    }
  }
])

server.start();