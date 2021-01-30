const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
require('dotenv').config();
const port = process.env.PORT;
const router = express.Router();
const http = require('http').Server(app);
const io = require('socket.io')(http);

// DO NOT EDIT
var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKeyFirebase.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://rooms-chat-dummy-app-default-rtdb.europe-west1.firebasedatabase.app"
});

let database = admin.database();
// -------

var obj = {name: "username", value: "omega"};
var usersRef = database.ref("users");

usersRef.push(obj, function(error) {
  if (error) {
    // The write failed...
    console.log("Failed with error: " + error)
  } else {
    // The write was successful...
    console.log("success")
  }
});

usersRef.on("value", function(snapshot) {
  console.log(snapshot.val());
}, function (errorObject) {
  console.log("The read failed: " + errorObject.code);
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());




io.on('connection', (socket) => {
  // on connection
  console.log('a user connected');

  // on disconnect
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });


  socket.on('chat message', (data) => {
    console.log( data.username + ': ' + data.msg);
    var date = new Date().toLocaleString("cs");
    io.emit('chat message', {username: data.username, msg: data.msg, timestamp: date});

  });

  
});

app.get('/', function(req, res) {

    res.sendFile(path.join(__dirname + '/src/templates/index.html'));

});

app.post('/set-name', function(req, res) {
    var username = req.body.username;
    res.cookie('username', username).redirect('/rooms');    // sets cookie username
});

app.get('/rooms', function(req, res){

  res.sendFile(path.join(__dirname + '/src/templates/rooms.html'));



});


// use router
app.use('/', router);



// define your root for css and html files
app.use(express.static(__dirname + '/src'));

http.listen(port, () => {
  console.log(`App listening on http://localhost:${port}`);
});