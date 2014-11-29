var express = require('express');
var app = express();
var ExpressPeerServer = require('peer').ExpressPeerServer;
 
app.use(express.static(__dirname + "/client"));

var server = app.listen(8080);

var options = {
    debug: true
}

app.use('/api', ExpressPeerServer(server, options));

// OR

// var server = require('http').createServer(app);
// 
// app.use('/peerjs', ExpressPeerServer(server, options));
// 
// server.listen(9000);

