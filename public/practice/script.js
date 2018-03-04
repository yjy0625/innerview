// Globals

var questions;
var questionIndex = -1;
var questionIsFollowup = false;
var practiceQuestion = null;
var responseData = [];
var snapshots = [];
var snapshotInterval;

// Main

$(function() {
	questions = getQuestions();
	setTotalQuestionNumberDisplay(questions.length);
	initUI();
	initWebcam();
	snapshotInterval = window.setInterval(function () {takeSnapshot();}, 5000);

	// add event listener for buttons
	$(".quit.button").click(function() {
		// TODO: go back
	});
	$(".next.button").click(function() {
		practiceQuestion.stopRecording();
		responseData.push(practiceQuestion.getData());
		askQuestion();
	});

	// kickstart the first question
	askQuestion();
});

function getQuestions() {
	const questions = [
		'Tell me about yourself.',
		'Why google?',
		'What skills do you have?'
	];
	return questions;
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
		snapshots.push(data_uri);
	} );
}

/*
* Sending result to backend
*/

function submitData() {
	clearInterval(snapshotInterval);
	var data = {
		"questions": responseData,
		"snapshots": snapshots
	};
	console.log(data);
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