const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookie = require('cookie');
const app = express();
require('dotenv').config();
const port = process.env.PORT;
const router = express.Router();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const cors = require('cors');
const {TwingEnvironment, TwingLoaderFilesystem} = require('twing');

let loader = new TwingLoaderFilesystem('./src/templates');
let twing = new TwingEnvironment(loader);
// DO NOT EDIT
var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKeyFirebase.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://rooms-chat-dummy-app-default-rtdb.europe-west1.firebasedatabase.app"
});

let database = admin.database();
// -------

var usersRef = database.ref("users");
var roomsRef = database.ref("rooms");
var msgsRef = database.ref("messages");


roomsRef.on("value", function(snapshot) {
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


  var cookies = cookie.parse(socket.handshake.headers.cookie);    
  console.log(cookies.userKey);

  // on disconnect
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });


  socket.on('chat message', (data) => {
    console.log( data.username + ': ' + data.msg + " > " + data.userKey);
    var date = new Date().toLocaleString("cs");
    io.emit('chat message', {username: data.username, msg: data.msg, timestamp: date});

  });

  
});

app.get('/', function (req, res) {
  twing.render('index.html.twig', {'name': 'World'}).then((output) => {
      res.end(output);
  });
});

app.post('/set-name', function(req, res) {
    var username = req.body.username;
    var date = new Date().toLocaleString("cs");

    var obj = {username: username, joined_at: date  };

    var newUserRef = usersRef.push(obj, function(error) {
      if (error) {
        // The write failed...
        console.log("Failed with error: " + error)
      } else {
        // The write was successful...
        console.log("success")
      }
    });

    var newUserKey = newUserRef.key;
    res.cookie('userKey', newUserKey);
    res.cookie('username', username);
    res.redirect('/rooms');    // sets cookie userKey and username
});


app.get('/rooms', function (req, res) {
  twing.render('rooms.html.twig', {'userKey': req.cookies.userKey, 'username': req.cookies.username}).then((output) => {
      res.end(output);
  });
});


// use router
app.use('/', router);
app.use(cors());


// define your root for css and html files
app.use(express.static(__dirname + '/src'));

http.listen(port, () => {
  console.log(`App listening on http://localhost:${port}`);
});