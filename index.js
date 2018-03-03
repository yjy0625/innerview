const express = require('express')
var app = express()
var bodyParser = require('body-parser')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// use all files in '/public' directory for static routing
app.use(express.static('public'))

// api requests
app.get('/api/login/username/:username/password/:password', function (req, res) {
	res.send("OK");
})

app.post('/feedback', function (req, res) {
	res.send("OK");
})

app.listen(3001, function() { console.log('Innerview app listening on port 3001!') })