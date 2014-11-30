// Serve most files
var express = require('express');
var app = express();
 
app.use(express.static(__dirname + "/client"));

var appserver = app.listen(8000);

var options = {
    debug: true
}

// Serve as PeerJSserver
var PeerServer = require('peer').PeerServer;
var server = new PeerServer({port: 8080, path: '/api'});

// Track connected users, make available on /users
var connected = [];
server.on('connection', function (id) {
    connected.push(id);
});
server.on('disconnect', function (id) {
    var index = connected.indexOf(id);
    if (index >= 0){
      connected.splice(index, 1);
    }
});

app.get('/users', function(req, res){ return res.json(connected)});
