// Globals

var questions;
var questionIndex = -1;
var practiceQuestions = [];

// Main

$(function() {
	questions = getQuestions();
	setTotalQuestionNumberDisplay(questions.length);
	initUI();

	// add event listener for buttons
	$(".quit.button").click(function() {
		
	});
	$(".next.button").click(function() {
		practiceQuestions[practiceQuestions.length - 1].stopRecording();
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
		var practiceQuestion = new PracticeQuestion({
			'questionString': questions[questionIndex]
		});
		setTimeout(function() {
			setQuestionIndexDisplay(questionIndex);
			practiceQuestions.push(practiceQuestion);
			showQuestion(questions[questionIndex]);
			practiceQuestion.startRecording();
		}, 500);
		
	}
}

function currentQuestionIsLastQuestion() {
	return questionIndex == questions.length;
}

function submitData() {

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