// Globals

var user_id;
var interviewId;
var questions;
var questionIndex = -1;
var practiceQuestion = null;
var responseData = [];
var snapshots = [];
var snapshotInterval;
var shownFollowupQuestions = [];

// Main

$(function() {
	interviewId = $.urlParam('id');

	initUI();
	initWebcam();
	snapshotInterval = window.setInterval(function () {takeSnapshot();}, 5000);

	// add event listener for buttons
	$(".quit.button").click(function() {
		window.location.href = "/list";
	});
	$(".next.button").click(function() {
		practiceQuestion.stopRecording();
		responseData.push(practiceQuestion.getData());
		const previousResponse = practiceQuestion.getData().audioContent;
		getFollowupQuestion(previousResponse, q => {
			console.log("Question: " + q);
			if(q) {
				askFollowupQuestion(q);
			}
			else {
				askQuestion();
			}
		})
	});

	// get the first question and start asking questions
	getQuestions(res => {
		questions = JSON.parse(res);
		setTotalQuestionNumberDisplay(questions.length);
		askQuestion();
	});
});

function getQuestions(callback) {
	$.ajax({
		method: "GET",
		url: "/api/interviews/questions/" + interviewId
	}).done(res => callback(res));
}

function askQuestion() {
	questionIndex++;

	if(currentQuestionIsLastQuestion()) {
		submitData();
	}
	else {
		if(questionIndex != 0) {
			hideQuestion();
			hideFollowup();
		}

		// UI operations
		practiceQuestion = new PracticeQuestion({
			'questionIndex': questionIndex,
			'questionString': questions[questionIndex],
			'isFollowup': false
		});
		setTimeout(function() {
			setQuestionIndexDisplay(questionIndex);
			showQuestion(questions[questionIndex]);
			practiceQuestion.startRecording();
		}, 500);

	}
}

function askFollowupQuestion(questionString) {
	practiceQuestion = new PracticeQuestion({
		'questionIndex': questionIndex,
		'questionString': questionString,
		'isFollowup': true
	});
	setTimeout(function() {
		setQuestionIndexDisplay(questionIndex);
		showFollowup(questionString);
		practiceQuestion.startRecording();
	}, 500);
}

function currentQuestionIsLastQuestion() {
	return questionIndex == questions.length;
}

function getFollowupQuestion(response, callback) {
	$.ajax({
		method: 'GET',
		url: 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/1a5d0a97-d862-4549-a829-753db7d68805?subscription-key=dbee4f8dbed244cc9ef3e8f9fd8665ae&verbose=true&timezoneOffset=-480&q=' + encodeURI(response)
	}).done(res => {
		console.log(res);

		if(res.topScoringIntent === undefined) {
			callback(null);
			return;
		}

		const intent = res.topScoringIntent.intent;
		const score = res.topScoringIntent.score;
		if(score > 0.3 && intent != 'None' && !(shownFollowupQuestions.indexOf(intent) == -1)) {
			if(intent === 'AttendHackathon') {
				const possibleResponses = ["Nice to see that you love hackathons. Could you describe one of the projects you like the best?"];
			    const rand = Math.floor(Math.random() * possibleResponses.length);
			    callback(possibleResponses[rand]);
			}
			else if(intent === 'Collaborate') {
				const possibleResponses = ["Sounds good. So in terms of collaboration, have you been faced with a difficult situation in a team? How did you deal with that?"];
			    const rand = Math.floor(Math.random() * possibleResponses.length);
			    callback(possibleResponses[rand]);
			}
			else if(intent === 'Leadership') {
				const possibleResponses = ["I see that you have a decent amount of leadership experience. Do you like to work in a team as a leader or as a member? Why?"];
			    const rand = Math.floor(Math.random() * possibleResponses.length);
				callback(possibleResponses[rand]);
			}
			else if(intent === 'MachineLearning') {
				const possibleResponses = ["So you know about machine learning? What are some of the projects you have completed using machine learning?"];
			    const rand = Math.floor(Math.random() * possibleResponses.length);
			    callback(possibleResponses[rand]);
			}
			else { // intern
				const possibleResponses = ["Can you tell me more about the intern project you just mentioned? What did you enjoy most about it?"];
			    const rand = Math.floor(Math.random() * possibleResponses.length);
			    callback(possibleResponses[rand]);
			}
			shownFollowupQuestions.push(intent);
		}
		else {
			callback(null);
		}
	});
}

/*
* Webcam functionalities
*/

function initWebcam() {
	Webcam.set({
		width: 320,
		height: 240,
		image_format: 'jpeg',
		jpeg_quality: 90
	});
	Webcam.attach('#webcam');
}

function takeSnapshot() {
	Webcam.snap( function(data_uri) {
		if(snapshots.length >= 5) {
			const rand = Math.floor(Math.random() * 5);
			snapshots[rand] = data_uri;
		}
		else {
			snapshots.push(data_uri);
		}
	});
}

/*
* Sending result to backend
*/

function submitData() {
	clearInterval(snapshotInterval);
	var data = {
		"username": "jingyun",
		"questions": responseData,
		"snapshots": snapshots
	};
	console.log(data);
	$.ajax({
		method: "POST",
		url: "/api/feedback/",
		data: data
	}).done(res => {
		if(res === 'OK') {
			window.location.href = "/feedback?id=" + interviewId;
		}
	});
}

/*
* UI Functions
*/

function initUI() {
	$('.question-number').hide();
	$('.question-content').hide();
	$('.question-followup').hide();
}

function setTotalQuestionNumberDisplay(num) {
	$('.question-total').text(num);
}

function setQuestionIndexDisplay(num) {
	$('.question-index').text(num + 1);
}

function showQuestion(text) {
	$('.question-content').text(text);
	$('.question-number').fadeIn();
	$('.question-content').fadeIn();
}

function showFollowup(text) {
	$('.question-followup-content').text(text);
	$('.question-followup').fadeIn();
}

function hideQuestion() {
	$('.question-number').fadeOut();
	$('.question-content').fadeOut();
}

function hideFollowup() {
	$('.question-followup').fadeOut();
}

/*
* Helpers
*/

$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
       return null;
    }
    else{
       return decodeURI(results[1]) || 0;
    }
}
