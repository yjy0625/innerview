const express = require('express')
const session = require('express-session')
var app = express()
var bodyParser = require('body-parser')
let https = require ('https');
const sql = require('mssql')
var azure = require('azure-storage');
const ImageDataURI = require('image-data-uri');

let accessKey_sentiment = 'a700966b433a4adc8113427a6d4d4ae5';
let accessKey_face = '601e6f96dd0d4db4a456c0920a700cde';
let uri = 'westcentralus.api.cognitive.microsoft.com';
let path2 = '/face/v1.0/detect';
let dataUriToBuffer = require('data-uri-to-buffer');
var storage = require('azure-storage');

process.env['AZURE_STORAGE_ACCOUNT'] = 'hacktechdb'
process.env['AZURE_STORAGE_ACCESS_KEY'] = '8pKd3ObdvvKqNDc9a4c9MZmVQDm4XGQTboarTbNcmc6K7VSNlBn4TypoTogvAfNHyMZo+f/cUaV0Pj3PDnIPRA=='
process.env['AZURE_STORAGE_CONNECTION_STRING'] = 'DefaultEndpointsProtocol=https;AccountName=hacktechdb;AccountKey=8pKd3ObdvvKqNDc9a4c9MZmVQDm4XGQTboarTbNcmc6K7VSNlBn4TypoTogvAfNHyMZo+f/cUaV0Pj3PDnIPRA==;EndpointSuffix=core.windows.net'

app.use(session({
	secret: 'hacktech2018',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser({
	limit: '50mb'
}));
app.use(bodyParser.json({
	limit: '50mb'
}));
app.use(bodyParser.urlencoded({
	limit: '50mb',
	extended: true
}));

var tempJson;

// use all files in '/public' directory for static routing
app.use(express.static('public'));

/*
let get_key_phrases = function (documents) {
    let body = JSON.stringify (documents);

    let request_params = {
        method : 'POST',
        hostname : uri,
        path : path,
        headers : {
            'Ocp-Apim-Subscription-Key' : accessKey,
        }
    };

    let req = https.request (request_params, response_handler);
    req.write (body);
    req.end ();
}
*/

/*
* API Requests
*/
app.get('/api/login/username/:username/password/:password', function (req, res) {
	req.session.username = req.params.username;
	res.send("OK");
})

app.get('/interviews/all', function (req, res) {
	var interviews = [
		{
			"id": 1, 
			"name": "Google Software Intern", 
			"description": "This set of practice problems is targeted to help you gain an software internship from Google. Good Luck."
		},
		{
			"id": 2, 
			"name": "Microsoft Software Intern", 
			"description": "This set of practice problems is targeted to help you gain an software internship from Microsoft. Good Luck."
		},
		{
			"id": 3, 
			"name": "Qualcomm Hardware Intern", 
			"description": "This set of practice problems is targeted to help you gain an hardware internship from Qualcomm. Good Luck."
		},

	];

	res.send(JSON.stringify(interviews));
})

app.get('/interviews/questions/:id', function (req, res) {
	var questions = [
		"Tell me about your self",
		"What is one technical exprience that you are very proud of",
		"Tell me about your experience at HackTech"
	];
	res.send(JSON.stringify(questions));
})

app.get('/api/login/username/:username/password/:password', function (req, res) {
	res.send("OK");
})

app.get('/feedback/username/:username/interview_id/:interview_id', function (req, res) {
	var username = tempJson["username"];
	var interview = tempJson["interviews"][interview_id];
	var interviewReturnJson = {"username": username, "interview": interview}
	res.send("JSON.stringify(interviewReturnJson)");
})

app.post('/feedback', function (req, res) {
	console.log(Object.keys(req.body));
	var questions = req.body["questions"];
	var numOfQuestions = questions.length;
	var snapshots = req.body["snapshots"];
	var numOfSnapshots = snapshots.length;
	var completedRequests = 0;

	var finalResult = {
		"metadata": req.body["metadata"],
		"questions": [],
		"snapshots": []
	};

	var username = req.body["username"];
	finalResult["username"] = username;

	console.log("Username: " + username);

	questions.forEach((question, i) => {
		finalResult["questions"][i] = {
			"prepTime": question["timing"]["startTime"],
			"totalTime": question["timing"]["totalTime"],
			"index": question["index"],
			"isFollowup": question["isFollowup"],
			"questionString": question["questionString"],
			"sentiment": 0.5,
			"wording": get_wordings(question["audioContent"]),
			"responseContent": question["audioContent"]
		};

		if(question["audioContent"] !== '') {
			var sentimentAnalysisInputData = {
				'documents': [{
					'id': '1', 
					'language': "en",
					'text': question["audioContent"]
				}]
			};
			get_sentiments(sentimentAnalysisInputData, sentiment => {
				finalResult["questions"][i]["sentiment"] = sentiment;
				checkComplete();
			});
		}
		else {
			console.log("One transcription is empty.");
			checkComplete();
		}
		
	});

	snapshots.forEach((snapshot, i) => {
		get_face(snapshot, expression => {
			finalResult["snapshots"][i] = {
				"expression_anger": expression.anger,
				"expression_contempt": expression.contempt,
				"expression_disgust": expression.disgust,
				"expression_fear": expression.fear,
				"expression_happiness": expression.happiness,
				"expression_neutral": expression.neutral,
				"expression_sadness": expression.sadness,
				"expression_surprise": expression.surprise
			};
			checkComplete();
		});
	});

	function checkComplete() {
		completedRequests++;
		console.log("" + completedRequests + " / " + (numOfSnapshots + numOfQuestions) + " requests completed.");
		if(completedRequests == numOfSnapshots + numOfQuestions) {
			console.log(finalResult);
			tempJson = finalResult;
			res.send("OK");
		}
	}
})

/*
* Helpers
*/

// repeat a list of repeated words in a string
let get_wordings = function (content) {
	var wording = '';
	var contentArray = content.split(" ");
	var contentLength = contentArray.length;
	var wordingCount = 0;
	for (var i = 0; i < contentLength; i++){
		wordingCount = 0;
		for (var j = 0; j < contentLength; j++){
			if (contentArray[i] == contentArray[j]){
				wordingCount++;
			}
			if (wordingCount > 7){
				if (wording != '')
					wording += ",";
				wording += contentArray[i];
			}
			break;
		}	
	}
	return wording;
}

// run callback function given the transcribed speech of the user
let get_sentiments = function (documents, callback) {
	let body = JSON.stringify (documents);

	let request_params = {
		method : 'POST',
		hostname : uri,
		path : '/text/analytics/v2.0/sentiment',
		headers : {
			'Ocp-Apim-Subscription-Key': accessKey_sentiment,
		}
	};

	let req = https.request(request_params, function (response) {
		let body = '';

		response.on('data', function (d) {
			body += d;
		});

		response.on('end', function () {
			var sentiment = JSON.parse(body)['documents'][0]['score'];
			callback(sentiment);
		});

		response.on('error', function (e) {
			console.log('Error: ' + e.message);
		});
	});
	req.write (body);
	req.end();
}

// run callback on the emotion of the subject given an image URI.
let get_face = function(image_uri, callback) {

	let request_params = {
		method : 'POST',
		hostname : uri,
		path: path2+"?returnFaceId:false&returnFaceLandmarks:false&returnFaceAttributes=age,gender,headPose,smile,facialHair,glasses,emotion,hair,makeup,occlusion,accessories,blur,exposure,noise",
		headers : {
			'Ocp-Apim-Subscription-Key' : accessKey_face,
			"Content-Type": "application/octet-stream"
		}
	};

	let req = https.request (request_params, function(response) {
		let body = '';

		response.on ('data', function (d) {
			body += d;
		});

		response.on ('end', function () {
			let emotion_json = JSON.parse(body);
			if (emotion_json.length == 0) return;
			emotions = emotion_json[0]['faceAttributes']['emotion'];
			callback(emotions);
		});

		response.on ('error', function (e) {
			console.log ('Error: ' + e.message);
		});

	});

	req.write(ImageDataURI.decode(image_uri).dataBuffer);
	req.end();

}

/*
* Start server
*/

app.listen(3001, function() { console.log('Innerview app listening on port 3001!') })