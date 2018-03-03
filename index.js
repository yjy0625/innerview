const express = require('express')
var app = express()
var bodyParser = require('body-parser')
let https = require ('https');
const sql = require('mssql')
var azure = require('azure-storage');

let accessKey = '1f106a6e1d0245279847533f272c1ebc';
let accessKey_face = 'd0b93efcc5b14ba5b0c7dc97ed4f7133';
let uri = 'westus.api.cognitive.microsoft.com';
let path2 = '/face/v1.0/detect';
let dataUriToBuffer = require('data-uri-to-buffer');
var storage = require('azure-storage');

var parseDataUri = require('parse-data-uri')
process.env['AZURE_STORAGE_ACCOUNT'] = 'hacktechdb'
process.env['AZURE_STORAGE_ACCESS_KEY'] = '8pKd3ObdvvKqNDc9a4c9MZmVQDm4XGQTboarTbNcmc6K7VSNlBn4TypoTogvAfNHyMZo+f/cUaV0Pj3PDnIPRA=='
process.env['AZURE_STORAGE_CONNECTION_STRING'] = 'DefaultEndpointsProtocol=https;AccountName=hacktechdb;AccountKey=8pKd3ObdvvKqNDc9a4c9MZmVQDm4XGQTboarTbNcmc6K7VSNlBn4TypoTogvAfNHyMZo+f/cUaV0Pj3PDnIPRA==;EndpointSuffix=core.windows.net'
var blobSvc = azure.createBlobService();
var connectionString = 'DefaultEndpointsProtocol=https;AccountName=hacktechdb;AccountKey=8pKd3ObdvvKqNDc9a4c9MZmVQDm4XGQTboarTbNcmc6K7VSNlBn4TypoTogvAfNHyMZo+f/cUaV0Pj3PDnIPRA==;EndpointSuffix=core.windows.net';
var blobService = storage.createBlobService(connectionString);

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
	   		semantFlag = 1;
	   		if (semantFlag == 1 && faceFlag == 1){
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

// let get_language = function (documents) {
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

let get_face = function(url_, res){

    let request_params = {
        method : 'POST',
        hostname : uri+path2+"?returnFaceId:true%returnFaceLandmarks:false%returnFaceAttributes:age,gender,headPose,smile,facialHair,glasses,emotion,hair,makeup,occlusion,accessories,blur,exposure,noise",
        headers : {
            'Ocp-Apim-Subscription-Key' : accessKey_face,
            "Content-Type": "application/json"
        },
        data:{
        	url: url_}
    };

    let req = https.request (request_params, function(response){
    	 let body = '';
    response.on ('data', function (d) {
        body += d;
    });
    response.on ('end', function () {
        let body_ = JSON.parse (body);
        let body__ = JSON.stringify (body_, null, '  ');
        console.log (body__);
        emotion_json = body__;
        console.log("emotion_json: " + emotion_json);
		expression_anger= emotion_json[0]['emotion']['anger'];
		expression_contempt= emotion_json[0]['emotion']['contempt'];
		expression_disgust= emotion_json[0]['emotion']['disgust'];
		expression_fear= emotion_json[0]['emotion']['fear'];
		expression_happiness= emotion_json[0]['emotion']['happiness'];
		expression_neutral= emotion_json[0]['emotion']['neutral'];
		expression_sadness= emotion_json[0]['emotion']['sadness'];
		expression_surprise= emotion_json[0]['emotion']['surprise'];

		faceFlag = 1;
		if (faceFlag == 1 & semantFlag == 1){
			res.send("OK");
		}

    });
    response.on ('error', function (e) {
        console.log ('Error: ' + e.message);
    });

    });
    req.write (body);
    req.end ();

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

let blobInit = function(datastream){
  	var CONTAINER_NAME = "innerview-snapshots";
  	var BLOCK_BLOB_NAME = "snapshot";
  	var url = '';
  	console.log("datastream: " + datastream);
	blobService.createContainerIfNotExists(CONTAINER_NAME, { 'publicAccessLevel': 'blob' }, function (error) {
  // handleError(error);

	blobService.createBlockBlobFromStream(CONTAINER_NAME, BLOCK_BLOB_NAME, datastream, function (error) {
  //  handleError(error);

  });
});
	  url = blobService.getUrl(CONTAINER_NAME, BLOCK_BLOB_NAME)
	  return url;
	}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// use all files in '/public' directory for static routing
app.use(express.static('public'));

// api requests
app.get('/api/login/username/:username/password/:password', function (req, res) {
	res.send("OK");
})

app.post('/feedback', function (req, res) {
	var numOfQuestions = req.body.questions.length
	for (var i = 0; i < numOfQuestions; i++){
		var question = req.body.questions[i]
		var timing = question["timing"];
		console.log("timing: " + timing);
		var content = question["content"];
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
	}

	var snapshots = req.body.snapshots;
	var snapshotsLength = snapshots.length;

	for (var i = 0; i < snapshots.length; i++){
		var snapshotURI = snapshots[i];
		console.log(snapshotURI);
		decoded = parseDataUri(snapshotURI);
		console.log(decoded.data);	
		var url = blobInit(decoded.data);
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

// app.get('/')
app.listen(3001, function() { console.log('Innerview app listening on port 3001!') })