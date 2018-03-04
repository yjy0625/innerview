const express = require('express')
var app = express()
var bodyParser = require('body-parser')
let https = require ('https');
const sql = require('mssql')
var azure = require('azure-storage');
const ImageDataURI = require('image-data-uri');

let accessKey = '1f106a6e1d0245279847533f272c1ebc';
let accessKey_face = '601e6f96dd0d4db4a456c0920a700cde';
let uri = 'westcentralus.api.cognitive.microsoft.com';
let path2 = '/face/v1.0/detect';
let dataUriToBuffer = require('data-uri-to-buffer');
var storage = require('azure-storage');

process.env['AZURE_STORAGE_ACCOUNT'] = 'hacktechdb'
process.env['AZURE_STORAGE_ACCESS_KEY'] = '8pKd3ObdvvKqNDc9a4c9MZmVQDm4XGQTboarTbNcmc6K7VSNlBn4TypoTogvAfNHyMZo+f/cUaV0Pj3PDnIPRA=='
process.env['AZURE_STORAGE_CONNECTION_STRING'] = 'DefaultEndpointsProtocol=https;AccountName=hacktechdb;AccountKey=8pKd3ObdvvKqNDc9a4c9MZmVQDm4XGQTboarTbNcmc6K7VSNlBn4TypoTogvAfNHyMZo+f/cUaV0Pj3PDnIPRA==;EndpointSuffix=core.windows.net'

var sentiment = 0.0;
var wording = '';
var expression_anger = 0.0;
var expression_contempt = 0.0;
var expression_disgust = 0.0;
var expression_fear = 0.0;
var expression_neutral = 0.0;
var expression_happiness = 0.0;
var expression_sadness = 0.0;
var expression_surprise = 0.0;
var sentimantFlag = 0;
var faceFlag = 0;
var tempJson = {
	"username": "",
	"interviews": [],
	"interview_name": ""

};
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// use all files in '/public' directory for static routing
app.use(express.static('public'));


let get_sentiments = function (documents, res) {
	let body = JSON.stringify (documents);

	let request_params = {
		method : 'POST',
		hostname : uri,
		path : '/text/analytics/v2.0/sentiment',
		headers : {
			'Ocp-Apim-Subscription-Key' : accessKey,
		}
	};

	let req = https.request (request_params, function (response) {
		let body = '';
		response.on ('data', function (d) {
			body += d;
		});
		response.on ('end', function () {
			let body_ = JSON.parse (body);
			let body__ = JSON.stringify (body_, null, '  ');
			sentiments_json = body_;
					while(sentimantFlag == 0){}

			console.log(sentiments_json);
			sentiment = sentiments_json['documents'][0]['score'];
			sentimantFlag = 1;
			if (sentimantFlag == 1 && faceFlag == 1){
				res.send("OK");
			}
		});
		response.on ('error', function (e) {
			console.log ('Error: ' + e.message);
		});
	});
	req.write (body);
	req.end();
}

let get_face = function(image_uri, res, final) {

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
			let body_ = JSON.parse(body);
			emotion_json = body_;
			if (emotion_json.length == 0)
				return;
			expression_anger= emotion_json[0]['faceAttributes']['emotion']['anger'];
			expression_contempt= emotion_json[0]['faceAttributes']['emotion']['contempt'];
			expression_disgust= emotion_json[0]['faceAttributes']['emotion']['disgust'];
			expression_fear= emotion_json[0]['faceAttributes']['emotion']['fear'];
			expression_happiness= emotion_json[0]['faceAttributes']['emotion']['happiness'];
			expression_neutral= emotion_json[0]['faceAttributes']['emotion']['neutral'];
			expression_sadness= emotion_json[0]['faceAttributes']['emotion']['sadness'];
			expression_surprise= emotion_json[0]['faceAttributes']['emotion']['surprise'];
			if (final == 1)
					faceFlag = 1;
			if (faceFlag == 1 & sentimantFlag == 1){
				res.send("OK");
			}
		});

		response.on ('error', function (e) {
			console.log ('Error: ' + e.message);
		});

	});

	req.write(ImageDataURI.decode(image_uri).dataBuffer);
	req.end();

}

// let get_key_phrases = function (documents) {
//     let body = JSON.stringify (documents);

//     let request_params = {
//         method : 'POST',
//         hostname : uri,
//         path : path,
//         headers : {
//             'Ocp-Apim-Subscription-Key' : accessKey,
//         }
//     };

//     let req = https.request (request_params, response_handler);
//     req.write (body);
//     req.end ();
// }

// api requests
app.get('/api/login/username/:username/password/:password', function (req, res) {
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
	var username = req.body["username"];
	tempJson["username"] = username;
	console.log(username);
	var interviews = req.body["interviews"];
	console.log(req.body);
	var numOfInterviews = interviews.length;
	for (var x = 0; x < numOfInterviews; ++x){
		var interview = interviews[x];
		var metadata = interview["metadata"];
		var interview_id = metadata["interview_id"];
		var interview_name = metadata["interview_name"];
		var numOfQuestions = interview["questions"].length;
		for (var i = 0; i < numOfQuestions; i++){
			var question = interview["questions"][i];
			var prepTime = question["timing"]["prepTime"];
			var totalTime = question["timing"]["totalTime"];
			var content = question["audioContent"];
			var index = question["index"];
			var isFollowup = question["isFollowup"];
			var questionString = "What is your favorite food?";
			console.log("content: " + content);
			var documents_sentiments = {'documents':[{'id': '1', 'language': "en",'text':　content}]};
			get_sentiments(documents_sentiments, res);
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
			var analysisJson = {
				"prepTime": prepTime,
				"totalTime": totalTime,
				"textSentiments":sentiment,
				"isFollowup": isFollowup,
				"questionString": questionString,
				"sentiment": sentiment,
				"wording": wording
				}
			var dummyInterview = {
									"metadata":{
												"interview_id": 0,
												"intreview_name": ""},
									"questions":[],
									"snapshots":[]
								 }
			tempJson["interviews"][x] = dummyInterview;
			tempJson["interviews"][x]["questions"][i] = analysisJson;
		}

		var snapshots = interview["snapshots"];
		var snapshotsLength = snapshots.length;
		var final = 0;
		for (var i = 0; i < snapshots.length; i++){
			var snapshotURI = snapshots[i];
			// TODO get_face
			if (i == snapshots.length - 1)
				final = 1;
			get_face(snapshotURI, res, final);
			tempJson["interviews"][x]["snapshots"][i] = {
					"expression_anger": expression_anger,
					"expression_contempt": expression_contempt,
					"expression_disgust": expression_disgust,
					"expression_fear": expression_fear,
					"expression_happiness": expression_happiness,
					"expression_neutral": expression_neutral,
					"expression_sadness": expression_sadness,
					"expression_surprise": expression_surprise}
		}
	

	}

	
	// var documents_language = {'documents':[{'id': '1', 'text': content}]};
	// console.log("documents_language: " + documents_language);
	// var language_json = JSON.parse(get_language(documents_language));
	// console.log("language_json: "language_json)
	// if (language_json.errors.length != 0){
	// 	console.log("Error!!: " + language_json.errors);
	// }
	// var detectedLanguages = language_json.documents[0].detectedLanguages;
	// var detectedLanguageLength = detectedLanguages.length;
	// var content_language = '';
	// var maxScore = 0;
	// for (var i = 0; i < detectedLanguageLength; i++){
	// 	if (detectedLanguages[i].score > maxScore){
	// 		maxScore = detectedLanguages[i].score;
	// 		content_language = detectedLanguages[i].name;
	// 	}
	// }
	

	//keyPhrases_json = JSON.parse(get_key_phrases(documents_sentiments));

	//var conduct = req.body.conduct;


})

get_face("data:image/jpeg;base64,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", null);

// app.get('/')
app.listen(3002, function() { console.log('Innerview app listening on port 3001!') })