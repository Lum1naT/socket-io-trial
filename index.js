const express = require('express');
const path = require('path');
const app = express();
require('dotenv').config();
const port = process.env.PORT;
const router = express.Router();


app.get('/', function(req, res) {

    res.sendFile(path.join(__dirname + '/src/templates/index.html'));

});

// use router
app.use('/', router);

// define your root for css and html files
app.use(express.static(__dirname + '/src'));

app.listen(port, () => {
  console.log(`App listening on http://localhost:${port}`);
});