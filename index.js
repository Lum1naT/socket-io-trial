const express = require('express');
const path = require('path');
const app = express();
require('dotenv').config();
const port = process.env.PORT;
const router = express.Router();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const admin = require('firebase-admin');

var connection = null;
r.connect( {host: 'localhost', port: 28015}, function(err, conn) {
    if (err) throw err;
    connection = conn;
})


io.on('connection', (socket) => {
  // on connection
  console.log('a user connected');

  // on disconnect
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });


  socket.on('chat message', (data) => {
    console.log( data.username + ': ' + data.msg);
    var date = new Date().toLocaleString();
    io.emit('chat message', {username: data.username, msg: data.msg, timestamp: date});

  });

  
});

app.get('/', function(req, res) {

    res.sendFile(path.join(__dirname + '/src/templates/index.html'));

});


// use router
app.use('/', router);

// define your root for css and html files
app.use(express.static(__dirname + '/src'));

http.listen(port, () => {
  console.log(`App listening on http://localhost:${port}`);
});