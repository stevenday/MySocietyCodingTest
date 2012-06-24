/*******************************
 * Configuration
 ******************************/

// Basic app configuration
var pub = __dirname + '/public';
var port = 3000;

/*******************************
 * Required modules
 ******************************/

// Express for http requests
var express = require('express');
var app = express.createServer();
//Socket.io for websocket requests
var io = require('socket.io').listen(app);
// Our database module
var db = require('./database');

/*******************************
 * App
 ******************************/ 

// Configure Express
app.configure(function () {
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.static(pub));
    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
    }));
    app.use(app.router);
});

// Respond to http get requests at "/" with the index.html page
app.get('/', function (req, res) {
    res.sendFile(pub + "/index.html");
});

// Respond to http posts at "/vote" by trying to save the response
app.post('/vote', function (req, res) {
    // Request body should contain the email, constituency and party fields we
    // need to save the vote.
    db.saveVote(req.body, function (err) {
        if (err) {
            console.log(err);
            res.send(err.message, 500);
        }
        else {
            res.send("Saved", 200);
        }
    });
});

//Respond to new websocket connections by returning the current votes
io.sockets.on('connection', function (socket) {
    db.getCurrentVotes(function (err, currentVotes) {
        if (!err) {
            socket.emit('votes', currentVotes);
        }
        else {
            console.log(err);
        }
    });
});

// Broadcast totals to all sockets every second
var votesInterval = setInterval(function () {
    db.getCurrentVotes(function (err, currentVotes) {
        if (!err) {
            io.sockets.emit('votes', currentVotes);
        }
        else {
            console.log(err);
        }
    });
}, 1000);

/*******************************
 * Start the app
 ******************************/

// Start Express
app.listen(port);