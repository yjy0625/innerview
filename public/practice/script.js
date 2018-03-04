// Globals

var user_id;
var interviewId;
var questions;
var questionIndex = -1;
var questionIsFollowup = false;
var practiceQuestion = null;
var responseData = [];
var snapshots = [];
var snapshotInterval;

// Main

$(function() {
	interviewId = $.urlParam('interviewId');

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
		askQuestion();
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
		}

		// UI operations
		practiceQuestion = new PracticeQuestion({
			'questionIndex': questionIndex,
			'questionString': questions[questionIndex],
			'isFollowup': questionIsFollowup
		});
		setTimeout(function() {
			setQuestionIndexDisplay(questionIndex);
			showQuestion(questions[questionIndex]);
			practiceQuestion.startRecording();
		}, 500);

	}
}

function currentQuestionIsLastQuestion() {
	return questionIndex == questions.length;
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
